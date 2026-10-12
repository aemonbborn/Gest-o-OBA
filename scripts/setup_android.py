#!/usr/bin/env python3
"""Instala SDK oficial com arquivos e checksums fixados do catálogo Google."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess
import zipfile

PACKAGES = [
    ('platform-35_r02.zip', '0bb560a90a7a2cbd0dd8348224d518b638fe7949', 'platforms/android-35', 'android/repository/'),
    ('build-tools_r35_linux.zip', '2cfaa0bbb2336e9ec18ed3ecea84fa2e2af607bc', 'build-tools/35.0.0', 'android/repository/'),
]
EMULATOR_PACKAGES = [
    ('platform-tools_r37.0.1-linux.zip', '477254aa5f903c15cf51001717bdf347fb6b53e0', 'platform-tools', 'android/repository/'),
    ('emulator-linux_x64-16428233.zip', 'cd7362ea55dfb86a418958138dc396e74165dd01', 'emulator', 'android/repository/'),
    ('x86_64-26_r01.zip', '432f149c048bffce7f9de526ec65b336daf7a0a3', 'system-images/android-26/default/x86_64', 'android/repository/sys-img/android/'),
]


def sha1(path):
    digest = hashlib.sha1()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sdk', default='/workspace/.tools/android-sdk')
    parser.add_argument('--cache', default='/workspace/.gestao-android/downloads')
    parser.add_argument('--emulator', action='store_true')
    args = parser.parse_args()
    sdk, cache = Path(args.sdk).resolve(), Path(args.cache).resolve()
    cache.mkdir(parents=True, exist_ok=True)
    for name, expected, relative, prefix in PACKAGES + (EMULATOR_PACKAGES if args.emulator else []):
        archive = cache / name
        if not archive.exists():
            print('Baixando pacote oficial:', name, flush=True)
            subprocess.run(['curl', '--fail', '--location', '--silent', '--show-error', '--max-time', '240',
                            'https://dl.google.com/' + prefix + name, '-o', str(archive)], check=True)
        if sha1(archive) != expected:
            raise SystemExit('Checksum oficial não confere: ' + name + '. Não use o pacote; baixe novamente da fonte oficial.')
        target = sdk / relative
        marker = target / '.gestao-verified-package.json'
        if marker.is_file() and json.loads(marker.read_text()).get('sha1') == expected:
            print('Pacote verificado já instalado:', relative, flush=True)
            continue
        target.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(archive) as files:
            archive_root = files.namelist()[0].split('/')[0] + '/'
            for info in files.infolist():
                member = info.filename.removeprefix(archive_root)
                if not member:
                    continue
                output = (target / member).resolve()
                if not output.is_relative_to(target):
                    raise SystemExit('Caminho inválido no arquivo oficial: ' + member)
                if info.is_dir():
                    output.mkdir(parents=True, exist_ok=True)
                else:
                    output.parent.mkdir(parents=True, exist_ok=True)
                    output.write_bytes(files.read(info))
                    mode = (info.external_attr >> 16) & 0o777
                    if mode:
                        output.chmod(mode)
        marker.write_text(json.dumps({'archive': name, 'sha1': expected}) + '\n')
        print('Checksum oficial verificado; instalado:', relative, flush=True)
    subprocess.run([str(sdk / 'build-tools/35.0.0/aapt'), 'version'], check=True)


if __name__ == '__main__':
    main()
