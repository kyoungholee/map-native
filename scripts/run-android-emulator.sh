#!/usr/bin/env sh
set -e

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

AVD_NAME="${1:-Pixel_7}"

# 1) 기존 Metro(8081) 종료
if lsof -ti :8081 >/dev/null 2>&1; then
  echo "기존 Metro(8081) 종료 중..."
  lsof -ti :8081 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# 2) Android 에뮬레이터 실행
sh scripts/boot-android-emulator.sh "$AVD_NAME"

# 3) Expo Go 최신 버전 설치 (버전 불일치 방지)
sh scripts/install-expo-go-android.sh

# 4) 에뮬레이터 ↔ Mac Metro 포트 연결
adb reverse tcp:8081 tcp:8081

echo ""
echo "앱을 실행합니다. (종료: Ctrl+C)"
echo ""

# 5) Metro + 에뮬레이터 앱 자동 실행
exec npx expo start --android --localhost
