"""Normalize the official TFDA open dataset; runtime never calls an external API.

Usage: python -X utf8 scripts/import-tfda.py [--download]
The large downloaded source is a local cache; the compact source snapshot and
manifest are kept with the application for reproducibility.
"""
import hashlib
import io
import json
from pathlib import Path
import sys
import zipfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent / 'data' / 'nutrition'
RAW = ROOT / 'sources' / 'tfda-20.json'
URL = 'https://data.fda.gov.tw/data/opendata/export/20/json'
if '--download' in sys.argv or not RAW.exists():
    import requests
    session = requests.Session()
    session.trust_env = False
    response = session.get(URL, timeout=60)
    response.raise_for_status()
    archive = zipfile.ZipFile(io.BytesIO(response.content))
    RAW.parent.mkdir(parents=True, exist_ok=True)
    RAW.write_bytes(archive.read(archive.namelist()[0]))

raw_bytes = RAW.read_bytes()
rows = json.loads(raw_bytes.decode('utf-8-sig'))
fields = {'熱量': 'calories', '粗蛋白': 'proteins', '粗脂肪': 'fats',
          '總碳水化合物': 'carbs', '膳食纖維': 'fiber', '鈉': 'sodium', '修正熱量': 'adjustedCalories'}
foods = {}
for row in rows:
    if row['分析項'] not in fields:
        continue
    key = row['整合編號']
    food = foods.setdefault(key, {
        'id': key, 'name': row['樣品名稱'], 'category': row['食品分類'],
        'description': row['內容物描述'], 'aliases': row['俗名'],
        'sourceUnitWeight': row['每單位重'], 'nutrients': {}, 'evidence': {},
    })
    field = fields[row['分析項']]
    value = row['每100克含量']
    if value is None or not str(value).strip():
        continue  # Never turn missing analysis into zero.
    food['nutrients'][field] = float(value)
    food['evidence'][field] = {
        'analysis': row['分析項'], 'unit': row['含量單位'],
        'valuePer100g': str(value).strip(), 'sampleCount': row['樣本數'],
    }
snapshot = {key: foods[key] for key in sorted(foods)}
(ROOT / 'tfda-source-foods.json').write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(ROOT / 'source-manifest.json').write_text(json.dumps({
    'publisher': '卫生福利部食品药物管理署（TFDA）',
    'datasetUrl': 'https://data.gov.tw/dataset/8543', 'downloadUrl': URL,
    'license': '政府資料開放授權條款-第1版', 'licenseUrl': 'https://data.gov.tw/license',
    'retrievedAt': datetime.now(timezone.utc).isoformat(),
    'rawSha256': hashlib.sha256(raw_bytes).hexdigest(),
    'sourceRows': len(rows), 'sourceFoods': len(snapshot),
    'basis': 'per 100 grams of the described sample, not per 100 ml',
    'energyField': '熱量 (kcal)',
    'notice': '下载日期不是采样日期；样品地区、原配方和加工状态必须保留。',
}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Normalized {len(snapshot)} official source foods; sha256={hashlib.sha256(raw_bytes).hexdigest()}')
