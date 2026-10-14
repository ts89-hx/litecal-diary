"""Persistent CPU inference worker. NDJSON over stdio; no network or image files."""
import os
os.environ['HF_HUB_OFFLINE'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['TOKENIZERS_PARALLELISM'] = 'false'
import base64
import io
import json
from pathlib import Path
import sys
import warnings
import socket

def no_external_connection(*args, **kwargs):
    raise RuntimeError('Inference worker is offline; outgoing network access is disabled')
socket.socket.connect = no_external_connection
socket.socket.connect_ex = no_external_connection

ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = Path(os.environ.get('FOOD_MODEL_DIR', str(ROOT / 'model-assets' / 'chinese-clip')))
def emit(payload):
    print(json.dumps(payload, ensure_ascii=False), flush=True)

try:
    import torch
    from PIL import Image, ImageOps, UnidentifiedImageError
    from transformers import ChineseCLIPModel, ChineseCLIPProcessor
    Image.MAX_IMAGE_PIXELS = 20_000_000
    warnings.simplefilter('error', Image.DecompressionBombWarning)
    torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
    model = ChineseCLIPModel.from_pretrained(str(MODEL_DIR), local_files_only=True).eval()
    processor = ChineseCLIPProcessor.from_pretrained(str(MODEL_DIR), local_files_only=True)
    catalog = json.loads((ROOT / 'data' / 'nutrition' / 'catalog.json').read_text(encoding='utf-8'))
    groups = {}
    for food in catalog:
        label = food['recognition_label']
        groups.setdefault(label, []).append(food)
    labels = list(groups)
    negatives = ['一张人像照片', '一只宠物', '一台电脑和键盘', '手机屏幕上的文字',
                 '风景和建筑物', '一张空白图片', '空盘子和餐具', '食品包装上的营养成分表',
                 '一张菜单', '一桌摆着多道不同的菜', '一锅火锅和各种食材', '一碗麻辣烫']
    texts = [f'一张{label}的食物照片' for label in labels] + negatives
    embeddings = []
    with torch.inference_mode():
        for start in range(0, len(texts), 24):
            tokens = processor(text=texts[start:start+24], padding=True, truncation=True, max_length=52, return_tensors='pt')
            features = model.get_text_features(**tokens)
            embeddings.append(features / features.norm(dim=-1, keepdim=True))
    text_features = torch.cat(embeddings)
    emit({'type': 'ready', 'model': 'Chinese-CLIP ViT-B/16', 'foodGroups': len(labels), 'foods':len(catalog)})
except Exception as error:
    emit({'type':'fatal', 'error':'本地识别模型加载失败，请检查模型文件和Python依赖', 'detail':type(error).__name__})
    sys.exit(1)

for line in sys.stdin:
    request = {}
    try:
        request = json.loads(line)
        data = base64.b64decode(request['image'], validate=True)
        if not data or len(data) > 4 * 1024 * 1024:
            raise ValueError('图片需在4MB以内')
        with Image.open(io.BytesIO(data)) as opened:
            if opened.format not in ['JPEG','PNG','BMP','WEBP']:
                raise ValueError('不支持该图片格式，请上传JPG、PNG、BMP或WebP')
            image = ImageOps.exif_transpose(opened).convert('RGB')
            if min(image.size) < 32:
                raise ValueError('图片尺寸太小，请重新拍摄')
        with torch.inference_mode():
            features = model.get_image_features(**processor(images=image, return_tensors='pt'))
            features = features / features.norm(dim=-1, keepdim=True)
            scores = (features @ text_features.T)[0]
            food_scores = scores[:len(labels)]
            best = float(food_scores.max())
            nonfood = float(scores[len(labels):].max())
            # Conservative heuristics, NOT calibrated recognition probabilities.
            if best < 0.20 or nonfood >= best:
                raise ValueError('无法可靠识别单道食物，请靠近拍摄一道菜，或手动搜索添加')
            top = torch.topk(food_scores, min(3,len(labels)))
            candidates = []
            for similarity, index in zip(top.values.tolist(), top.indices.tolist()):
                for food in groups[labels[index]]:
                    candidates.append({'name':food['name'], 'catalogKey':food['catalog_key'],
                        'provider':'local', 'confidence':None, 'similarity':round(similarity,4),
                        'requiresReview':True})
        emit({'id':request['id'],'candidates':candidates[:12], 'model':'Chinese-CLIP ViT-B/16'})
    except (ValueError, KeyError, UnidentifiedImageError, Image.DecompressionBombError, Image.DecompressionBombWarning) as error:
        emit({'id':request.get('id'),'error':str(error) if isinstance(error,ValueError) else '无法解码图片，请重新选择清晰照片'})
    except Exception as error:
        emit({'id':request.get('id'),'error':'本地图片分析失败，请重试或手动添加','detail':type(error).__name__})
