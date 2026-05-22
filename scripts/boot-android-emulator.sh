#!/usr/bin/env sh
set -e

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

AVD_NAME="${1:-Pixel_7}"

if ! command -v emulator >/dev/null 2>&1; then
  echo "Android emulator를 찾을 수 없습니다. Android Studio를 설치해 주세요."
  exit 1
fi

if adb devices | grep -q "emulator-.*device"; then
  echo "이미 실행 중인 Android 에뮬레이터가 있습니다."
  adb devices
  exit 0
fi

echo "Android 에뮬레이터($AVD_NAME)를 시작합니다..."
emulator -avd "$AVD_NAME" -no-snapshot-load >/dev/null 2>&1 &

echo "부팅을 기다리는 중..."
for _ in $(seq 1 60); do
  if adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' | grep -q 1; then
    echo "에뮬레이터 준비 완료"
    adb devices
    exit 0
  fi
  sleep 3
done

echo "에뮬레이터 부팅 시간이 초과되었습니다. Android Studio에서 직접 실행해 보세요."
exit 1
