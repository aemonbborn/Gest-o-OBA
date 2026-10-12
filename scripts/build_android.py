#!/usr/bin/env python3
"""Gera um APK pequeno usando o SDK oficial, sem Gradle ou bibliotecas externas."""
from pathlib import Path
import argparse
import hashlib
import os
import secrets
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def run(*command):
    subprocess.run([str(part) for part in command], check=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sdk', default=os.environ.get('ANDROID_SDK_ROOT', '/workspace/.tools/android-sdk'))
    parser.add_argument('--signing-dir', default='/workspace/.gestao-android/signing')
    parser.add_argument('--output', default=str(ROOT / 'downloads/gestao-emergencia-adulto.apk'))
    parser.add_argument('--with-tests', action='store_true')
    args = parser.parse_args()
    sdk = Path(args.sdk).resolve()
    tools = sdk / 'build-tools/35.0.0'
    platform = sdk / 'platforms/android-35/android.jar'
    if not platform.is_file() or not (tools / 'aapt').is_file():
        raise SystemExit('Instale o SDK com python3 scripts/setup_android.py antes de compilar.')
    build = ROOT / 'android/build'
    if build.exists():
        shutil.rmtree(build)
    build.mkdir(parents=True)
    signing = Path(args.signing_dir).resolve()
    signing.mkdir(parents=True, exist_ok=True)
    signing.chmod(0o700)
    keystore, password = signing / 'gestao-ea.jks', signing / 'gestao-ea.pass'
    if not keystore.exists():
        password.write_text(secrets.token_urlsafe(32))
        password.chmod(0o600)
        run('keytool', '-genkeypair', '-keystore', keystore, '-storepass:file', password,
            '-keypass:file', password, '-alias', 'gestao-ea', '-keyalg', 'RSA', '-keysize', '3072',
            '-validity', '3650', '-dname', 'CN=Gestao Emergencia Adulto')
        keystore.chmod(0o600)
    if not password.is_file():
        raise SystemExit('Arquivo de assinatura ausente. Preserve a chave existente para atualizar o APK.')

    def package(name, manifest, sources, resources=None, classpath=None, output=None):
        work = build / name
        for directory in ['gen', 'classes', 'dex']:
            (work / directory).mkdir(parents=True)
        unsigned = work / 'unsigned.apk'
        command = [tools / 'aapt', 'package', '-f', '-m', '-J', work / 'gen',
                   '-M', manifest, '-I', platform, '-F', unsigned]
        if resources:
            command += ['-S', resources]
        run(*command)
        java_files = list(sources.rglob('*.java')) + list((work / 'gen').rglob('*.java'))
        run('java', 'com.sun.tools.javac.Main', '-source', '8', '-target', '8', '-Xlint:-options', '-encoding', 'UTF-8',
            '-classpath', str(platform) + (os.pathsep + str(classpath) if classpath else ''),
            '-d', work / 'classes', *java_files)
        run(tools / 'd8', '--release', '--lib', platform, '--min-api', '26',
            '--output', work / 'dex', *list((work / 'classes').rglob('*.class')))
        with zipfile.ZipFile(unsigned, 'a', zipfile.ZIP_DEFLATED) as archive:
            for dex in (work / 'dex').glob('*.dex'):
                archive.write(dex, dex.name)
        aligned = work / 'aligned.apk'
        run(tools / 'zipalign', '-f', '4', unsigned, aligned)
        output = output or work / (name + '.apk')
        output.parent.mkdir(parents=True, exist_ok=True)
        run(tools / 'apksigner', 'sign', '--ks', keystore, '--ks-key-alias', 'gestao-ea',
            '--ks-pass', 'file:' + str(password), '--out', output, aligned)
        run(tools / 'apksigner', 'verify', '--verbose', output)
        run(tools / 'zipalign', '-c', '4', output)
        return work, output

    work, output = package('app', ROOT / 'android/AndroidManifest.xml', ROOT / 'android/src',
                           ROOT / 'android/res', output=Path(args.output).resolve())
    checksum = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix('.apk.sha256').write_text(checksum + '  ' + output.name + '\n')
    run('java', 'com.sun.tools.javac.Main', '-source', '8', '-target', '8', '-Xlint:-options', '-encoding', 'UTF-8',
        '-classpath', work / 'classes', '-d', work / 'classes', ROOT / 'android/tests/ProgramUrlTest.java')
    run('java', '-cp', work / 'classes', 'com.aemonbborn.gestaoea.ProgramUrlTest')
    if args.with_tests:
        package('instrumentation', ROOT / 'android/tests/AndroidManifest.xml', ROOT / 'android/tests/src',
                classpath=work / 'classes', output=build / 'instrumentation.apk')
    print('APK gerado e assinatura/alinhamento verificados:', output)


if __name__ == '__main__':
    main()
