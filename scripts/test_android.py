#!/usr/bin/env python3
"""Instala e testa o APK no emulador, sem abrir contas Google reais."""
from pathlib import Path
import argparse
import os
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sdk', default='/workspace/.tools/android-sdk')
    parser.add_argument('--apk', default=str(ROOT / 'downloads/gestao-emergencia-adulto.apk'))
    args = parser.parse_args()
    adb = Path(args.sdk) / 'platform-tools/adb'
    env = dict(os.environ, ANDROID_USER_HOME='/workspace/.gestao-android')
    base = [str(adb), '-s', 'emulator-5554']
    for apk in [Path(args.apk), ROOT / 'android/build/instrumentation.apk']:
        subprocess.run(base + ['install', '-r', str(apk)], env=env, check=True)
    result = subprocess.run(base + ['shell', 'am', 'instrument', '-r', '-w',
                                   'com.aemonbborn.gestaoea.test/com.aemonbborn.gestaoea.test.SmokeInstrumentation'],
                            env=env, text=True, capture_output=True, check=True, timeout=120)
    print(result.stdout, end='')
    if 'gestao_smoke=passed' not in result.stdout:
        raise SystemExit('Teste Android não passou; confira a saída acima e o logcat.')
    print('PASS: APK instalado, configuração e abertura nativas verificadas.')


if __name__ == '__main__':
    main()
