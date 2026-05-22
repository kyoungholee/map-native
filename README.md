# Dooson ERP — Native (모바일)

두손 ERP **건설 현장 모바일 앱** 프로토타입입니다. Expo(React Native)로 구현했으며, **Expo Go**로 에뮬레이터·실기기에서 바로 실행할 수 있습니다.

백엔드 API는 아직 연결하지 않았고, **Zustand 메모리 + 목업 데이터**로 화면·지도·QR 흐름을 검증하는 단계입니다.

---

## 주요 기능

### 하단 탭 (4개)

| 탭 | 설명 |
|----|------|
| **홈** | 네이버 지도 + 등록된 **현장 경계**(파란 사각형) + **근무자 위치** 마커 |
| **현장 목록** | 현장 카드 목록, 등록/수정, 상세 정보 |
| **출근 QR** | 본인(김도운) 출근용 QR — 관리자 스캔·자동 출근은 추후 연동 |
| **마이정보** | admin 목업 프로필 + GPS 좌표(시뮬레이션) 표시 |

### 지도 (네이버 Maps JS API v3 + WebView)

- **Expo Go** 환경에서 동작하도록 **WebView + Web Dynamic Map** 방식 사용 (네이티브 SDK 미사용)
- **현장 경계**: 북·동·남·서 4좌표 → 파란색 폴리곤으로 표시
- **근무자 마커**: 현장 경계 안에서 **10초마다** 좌표 자동 갱신 (시뮬레이션)
  - 김도운 (현장소장) — 초록 마커
  - 이준호 (현장기사) — 주황 마커

### 현장 관리 (로컬 저장)

- 웹 ERP와 동일한 필드로 **현장 등록/수정** (현장명, 주소, 책임자, 착공·준공일, 상태, 경계 좌표)
- 기본 시드 데이터: **에코24BL** (부산)
- 앱을 재시작하면 시드 데이터만 남고, 새로 등록한 현장은 초기화됨

### 출근 QR · 마이정보

- 로그인/회원가입 **미구현** — `admin` 계정(김도운) 목업 고정
- QR payload: `dooson_attendance` JSON (사번, 이름, 현장 등) — 추후 관리자 앱 스캔 연동 예정

---

## 기술 스택

- **Expo SDK 54** / React Native 0.81 / React 19
- **TypeScript**
- **React Navigation** (Bottom Tabs)
- **Zustand** — 현장 목록, 근무자 GPS 시뮬레이션
- **react-native-webview** — 네이버 지도
- **react-native-qrcode-svg** — 출근 QR

---

## 사전 요구 사항

- Node.js 18+
- npm
- Android 개발 시: Android Studio, SDK, AVD(에뮬레이터)
- [네이버 클라우드 플랫폼](https://console.ncloud.com/) Maps Application **Client ID** (Dynamic Map)

---

## 시작하기

### 1. 의존성 설치

```bash
cd native
npm install
```

### 2. 환경 변수

`.env.example`을 참고해 프로젝트 루트에 `.env` 파일을 만듭니다.

```env
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_Client_ID
```

> `.env`, `.env.example`은 Git에 올리지 않습니다 (`.gitignore` 참고).

### 3. 네이버 지도 콘솔 설정

Maps > Application > **Web Dynamic Map** 선택 후, **Web 서비스 URL**에 포트 없이 등록:

- `http://localhost`
- `http://127.0.0.1`

Android 에뮬레이터는 `127.0.0.1:8081` 기준으로 인증되므로 `127.0.0.1` 등록이 필요합니다.

스크립트 로드 시 파라미터는 **`ncpKeyId`** 를 사용합니다.

### 4. 실행

```bash
# Metro만
npm start

# Android 에뮬레이터 + Expo Go 자동 실행 (권장)
npm run emulator
```

`npm run emulator`는 다음을 순서대로 수행합니다.

1. Metro(8081) 정리
2. Android 에뮬레이터 부팅 (`Pixel_7` 기본)
3. Expo Go 설치
4. `adb reverse`로 Metro 연결
5. `expo start --android --localhost`

에뮬레이터 AVD 이름 변경:

```bash
npm run emulator -- Medium_Phone_API_36.1
```

---

## 프로젝트 구조

```
native/
├── App.tsx                 # 앱 루트, GPS 시뮬레이션 시작
├── navigation/
│   └── MainTabs.tsx        # 하단 탭 네비게이션
├── screens/
│   ├── HomeScreen.tsx      # 지도 (현장 경계 + 근무자)
│   ├── SiteListScreen.tsx  # 현장 목록·등록
│   ├── AttendanceQrScreen.tsx
│   └── MyInfoScreen.tsx
├── components/
│   ├── NaverMapView.tsx    # WebView 지도 래퍼
│   ├── sites/              # 현장 카드·폼·상세
│   └── ProfileInfoRow.tsx
├── lib/
│   ├── naverMapHtml.ts     # 지도 HTML 생성 (폴리곤·마커)
│   ├── siteBoundary.ts     # 경계 → 꼭짓점 변환
│   ├── siteMapOverlays.ts
│   └── attendanceQr.ts     # QR JSON payload
├── store/
│   ├── siteStore.ts        # 현장 목록 (메모리)
│   └── workLocationStore.ts # 근무자 GPS 시뮬레이션
├── data/
│   ├── seedSites.ts        # 에코24BL 시드
│   ├── mockWorkers.ts      # 김도운, 이준호
│   └── mockWorkLocation.ts
├── types/
├── scripts/                # 에뮬레이터·Expo Go 설치 스크립트
└── app.json
```

---

## 목업 데이터 요약

| 구분 | 내용 |
|------|------|
| 계정 | `admin` — 김도운 (현장소장) |
| 추가 근무자 | 이준호 (현장기사), 홈 지도에만 표시 |
| 기본 현장 | 에코24BL, 부산, 경계 좌표 4점 포함 |
| GPS | 실제 단말 GPS가 아닌 **현장 안 랜덤 이동** (10초 간격) |

마이정보 화면은 **김도운(admin)** 좌표만 표시합니다.

---

## 지도 인증 실패 시

화면에 *「네이버 지도 Open API 인증이 실패했습니다」* 가 반복되면:

1. Client ID가 `.env`에 올바른지 확인
2. 콘솔 Web URL: `http://127.0.0.1`, `http://localhost` (포트 제외)
3. Dynamic Map(Web) 서비스 선택 여부
4. Metro 재시작: `npm run emulator`

---

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm start` | Expo Metro |
| `npm run android` | Android에서 앱 열기 |
| `npm run ios` | iOS 시뮬레이터 |
| `npm run emulator` | 에뮬레이터 부팅 + Expo Go + 앱 실행 |
| `npx tsc --noEmit` | 타입 검사 |

---

## 추후 개발 예정

- [ ] 로그인 / 회원가입
- [ ] 백엔드 API 연동 (현장 CRUD, 출근 기록)
- [ ] 관리자 QR 스캔 → 자동 출근
- [ ] 실제 GPS 연동 (시뮬레이션 대체)
- [ ] 현장 데이터 영구 저장 (AsyncStorage 또는 API)
- [ ] Development Build + 네이버 Maps Native SDK (선택)

---

## 관련 문서

- [Expo SDK 54 문서](https://docs.expo.dev/)
- [네이버 지도 API v3](https://navermaps.github.io/maps.js.ncp/docs/)
- [Maps 문제 해결 (Ncloud)](https://guide.ncloud-docs.com/docs/application-maps-troubleshoot)

---

## 라이선스

저장소 루트 `LICENSE` 참고.
