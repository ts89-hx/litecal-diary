"""Optional resumable CPU wheel download for Windows/Python 3.12."""
import re
from pathlib import Path
import requests
from verified_download import download
session = requests.Session()
session.trust_env = False
response = session.get('https://download.pytorch.org/whl/cpu/torch/', timeout=30)
response.raise_for_status()
links = re.findall(r'href="([^"]+)"', response.text)
link = next(value for value in links if 'torch-2.6.0%2Bcpu-cp312-cp312-win_amd64.whl' in value)
url, sha = link.split('#sha256=')
head = session.head(url, allow_redirects=True, timeout=30)
head.raise_for_status()
size = int(head.headers['content-length'])
print(f'Official CPU wheel: {size} bytes, SHA-256 {sha}', flush=True)
target = Path(__file__).resolve().parent.parent / 'model-assets' / 'torch-2.6.0+cpu-cp312-cp312-win_amd64.whl'
download(url, target, size, sha)
