#!/usr/bin/env python3
"""Inicia o AVD da gestão e espera a inicialização completa, sem modificar código."""
from pathlib import Path
import argparse
import os
import subprocess
import time


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--sdk', default='/workspace/.tools/android-sdk')
    parser.add_argument('--state-dir', default='/workspace/.gestao-android')
    args = parser.parse_args()
    sdk, state = Path(args.sdk).resolve(), Path(args.state_dir).resolve()
    adb = sdk / 'platform-tools/adb'
    env = dict(os.environ, ANDROID_HOME=str(sdk), ANDROID_USER_HOME=str(state),
               ANDROID_EMULATOR_HOME=str(state), ANDROID_AVD_HOME=str(state / 'avd'))
    subprocess.run([str(adb), 'start-server'], env=env, check=True)

    def ready():
        result = subprocess.run([str(adb), '-s', 'emulator-5554', 'shell', 'getprop', 'sys.boot_completed'],
                                env=env, text=True, capture_output=True, timeout=15)
        return result.returncode == 0 and result.stdout.strip() == '1'

    if ready():
        print('Android gestao em emulator-5554 já inicializado.')
        return
    avd = state / 'avd/GestaoEA.avd'
    avd.mkdir(parents=True, exist_ok=True)
    (avd.parent / 'GestaoEA.ini').write_text('avd.ini.encoding=UTF-8\npath=' + str(avd) + '\ntarget=android-26\n')
    (avd / 'config.ini').write_text('''AvdId=GestaoEA
avd.ini.displayname=GestaoEA
abi.type=x86_64
hw.cpu.arch=x86_64
hw.cpu.ncore=2
hw.ramSize=1536
hw.lcd.width=720
hw.lcd.height=1280
hw.lcd.density=320
hw.keyboard=yes
hw.gpu.enabled=yes
hw.gpu.mode=swiftshader_indirect
image.sysdir.1=system-images/android-26/default/x86_64/
tag.id=default
tag.display=Default
vm.heapSize=256
disk.dataPartition.size=1024M
showDeviceFrame=no
''')
    devices = subprocess.run([str(adb), 'devices'], env=env, capture_output=True, text=True, check=True)
    if 'emulator-5554' not in devices.stdout:
        with (state / 'emulator.log').open('ab') as log:
            subprocess.Popen([str(sdk / 'emulator/emulator'), '-avd', 'GestaoEA', '-accel', 'off',
                              '-gpu', 'swiftshader_indirect', '-feature', '-Vulkan', '-no-window',
                              '-no-audio', '-no-boot-anim', '-no-snapshot', '-no-metrics', '-port', '5554'],
                             env=env, stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)
    print('Esperando a inicialização do Android; logs em ' + str(state / 'emulator.log'), flush=True)
    deadline = time.monotonic() + 360
    while time.monotonic() < deadline:
        try:
            if ready():
                print('Android inicializado em emulator-5554.', flush=True)
                return
        except subprocess.TimeoutExpired:
            pass
        time.sleep(3)
    raise SystemExit('Android não inicializou. Confira emulator.log antes de repetir.')


if __name__ == '__main__':
    main()
