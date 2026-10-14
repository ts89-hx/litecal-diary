"""One-time download of a pinned official Chinese-CLIP checkpoint.
Inference loads only local files; no photos are sent to a third party.
"""
import hashlib
import json
from pathlib import Path
import requests
from verified_download import download

MODEL = 'OFA-Sys/chinese-clip-vit-base-patch16'
REVISION = '36e679e65c2a2fead755ae21162091293ad37834'
WEIGHT_SHA = '7b7b583c210c867410bc6bdb8a55fe14eec62999e0a9ea31ff222dc501f9cfbe'
DIRECTORY = Path(__file__).resolve().parent.parent / 'model-assets' / 'chinese-clip'
DIRECTORY.mkdir(parents=True, exist_ok=True)
session = requests.Session()
session.trust_env = False
for name in ['config.json', 'preprocessor_config.json', 'vocab.txt', 'pytorch_model.bin']:
    target = DIRECTORY / name
    if name == 'pytorch_model.bin':
        download(f'https://huggingface.co/{MODEL}/resolve/{REVISION}/{name}', target, 753177983, WEIGHT_SHA)
        continue
    if target.exists() and (name != 'pytorch_model.bin' or hashlib.sha256(target.read_bytes()).hexdigest() == WEIGHT_SHA):
        print(f'Already present: {name}', flush=True)
        continue
    response = session.get(f'https://huggingface.co/{MODEL}/resolve/{REVISION}/{name}', stream=True, timeout=(30, 90))
    response.raise_for_status()
    partial = target.with_suffix(target.suffix + '.partial')
    digest = hashlib.sha256()
    written = 0
    report_at = 50 * 1024 * 1024
    with partial.open('wb') as handle:
        for chunk in response.iter_content(1024 * 1024):
            if not chunk:
                continue
            handle.write(chunk)
            digest.update(chunk)
            written += len(chunk)
            if written >= report_at:
                print(f'{name}: {written // (1024 * 1024)} MiB', flush=True)
                report_at += 50 * 1024 * 1024
    if name == 'pytorch_model.bin' and digest.hexdigest() != WEIGHT_SHA:
        raise RuntimeError('Model checksum mismatch; partial file is not usable')
    partial.replace(target)
    print(f'Verified download: {name}', flush=True)
(DIRECTORY / 'provenance.json').write_text(json.dumps({
    'model': MODEL, 'revision': REVISION, 'weightSha256': WEIGHT_SHA,
    'source': f'https://huggingface.co/{MODEL}',
    'codeLicense': 'MIT, https://github.com/OFA-Sys/Chinese-CLIP/blob/master/LICENSE',
}, indent=2), encoding='utf-8')
