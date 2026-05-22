#!/usr/bin/env sh
set -e

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

SDK_VERSION="${EXPO_SDK_VERSION:-54.0.0}"
CACHE_DIR="$ROOT_DIR/.cache/expo-go"
APK_PATH="$CACHE_DIR/Expo-Go.apk"
mkdir -p "$CACHE_DIR"

if ! adb devices | grep -q "device$"; then
  echo "연결된 Android 에뮬레이터가 없습니다."
  exit 1
fi

echo "Expo Go (SDK $SDK_VERSION) 설치 중..."

APK_URL=$(curl -sf "https://exp.host/--/api/v2/versions" | node -e "
  const j = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  const s = j.sdkVersions['$SDK_VERSION'];
  if (!s?.androidClientUrl) process.exit(1);
  console.log(s.androidClientUrl);
")

if [ ! -f "$APK_PATH" ]; then
  curl -sfL "$APK_URL" -o "$APK_PATH"
fi

adb install -r "$APK_PATH" >/dev/null
echo "Expo Go 설치 완료"
