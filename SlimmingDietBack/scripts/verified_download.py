"""Resumable, bounded HTTP ranges for large model/runtime downloads."""
from concurrent.futures import ThreadPoolExecutor
import hashlib
from pathlib import Path
import requests
import time

def download(url, target, size, sha256):
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    def checksum(file):
        result = hashlib.sha256()
        with file.open('rb') as stream:
            for data in iter(lambda: stream.read(8 * 1024 * 1024), b''):
                result.update(data)
        return result.hexdigest()
    if target.exists() and target.stat().st_size == size and checksum(target) == sha256:
        print(f'Already verified: {target.name}', flush=True)
        return
    chunk_size = 4 * 1024 * 1024
    starts = list(range(0, size, chunk_size))
    def part(start):
        end = min(start + chunk_size, size) - 1
        file = target.with_name(target.name + f'.part-{start}')
        if file.exists() and file.stat().st_size == end - start + 1:
            return file
        for attempt in range(5):
            try:
                session = requests.Session()
                session.trust_env = False
                separator = '&' if '?' in url else '?'
                response = session.get(f'{url}{separator}download_part={start}', headers={'Range': f'bytes={start}-{end}'}, timeout=(30, 60))
                response.raise_for_status()
                if response.status_code != 206 or response.headers.get('content-range') != f'bytes {start}-{end}/{size}' or len(response.content) != end - start + 1:
                    raise RuntimeError(f'Incomplete range at {start}: {len(response.content)} bytes')
                file.write_bytes(response.content)
                return file
            except Exception:
                if attempt == 4:
                    raise
                time.sleep(attempt + 1)
        raise RuntimeError('Download failed')
    with ThreadPoolExecutor(max_workers=4) as pool:
        files = []
        for index, file in enumerate(pool.map(part, starts), start=1):
            files.append(file)
            if index % 10 == 0 or index == len(starts):
                print(f'{target.name}: {index}/{len(starts)} verified ranges', flush=True)
    assembled = target.with_name(target.name + '.assembling')
    with assembled.open('wb') as output:
        for file in files:
            output.write(file.read_bytes())
    if checksum(assembled) != sha256:
        raise RuntimeError('Final SHA-256 does not match the publisher')
    assembled.replace(target)
    # Only exact task-generated part files in the target directory are removed.
    for file in files:
        file.unlink()
    print(f'Full SHA-256 verified: {target.name}', flush=True)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('url'); parser.add_argument('target'); parser.add_argument('size',type=int); parser.add_argument('sha256')
    args = parser.parse_args()
    download(args.url,args.target,args.size,args.sha256)
