# 건설현장 — Native (모바일)

두손 **건설 현장 모바일 앱** 입니다. Expo(React Native)로 구현했으며, **Supabase** 백엔드와 연동해 현장·위치·계정 데이터를 관리합니다. **Expo Go**로 에뮬레이터·실기기에서 바로 실행할 수 있습니다.

---

## 이 저장소의 위치

| 구분                    | 설명                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **현재**                | Supabase 백엔드, 로그인, 지도·현장·출근 QR까지 **실사용에 가까운 흐름**을 검증하는 모바일 프로토타입              |
| **추후 (실제 계약 시)** | 계약이 확정된 **고객사 요구사항·운영 정책·기존 시스템**에 맞춰 화면·기능·연동 방식을 **재기획하고 커스텀**할 예정 |

이 프로젝트는 특정 납품용 최종 제품이 아니라, **UX와 기능 단위를 빠르게 시험하기 위함**입니다. 웹(건설현장)과 도메인 개념은 맞추되, 저장소·배포·API는 고객사 계약 범위에 따라 분리·이관될 수 있습니다.

---

## 주요 기능

### 로그인

- 앱 실행 시 **로그인 화면** → 인증 후 메인 탭 진입
- 데모 계정 (비밀번호 공통: `line1234!`)

| 아이디  | 이름   | 역할     |
| ------- | ------ | -------- |
| `admin` | 김도운 | 현장소장 |
| `test`  | 테스트 | 테스터   |

- 계정·프로필 정보는 **Supabase**에 저장됩니다 (`construction_sites` / `trackables` 시드, 앱 부트스트랩 시 자동 생성)
- 수동 시드: `npm run seed:auth-db`

### 하단 탭 (4개)

| 탭            | 설명                                                               |
| ------------- | ------------------------------------------------------------------ |
| **홈**        | 네이버 지도 + **현장 경계**(파란 폴리곤) + **인력·장비** 위치 마커 |
| **현장 목록** | Supabase에 저장된 현장 목록, 등록·수정·상세                        |
| **출근 QR**   | 로그인한 사용자 기준 출근 QR (`dooson_attendance` JSON)            |
| **마이정보**  | 로그인 프로필 + **현재 GPS 좌표** 표시, 로그아웃                   |

### 지도 · GPS

- **Expo Go** 환경: **WebView + 네이버 Maps JS API v3** (Dynamic Map)
- **현장 경계**: 북·동·남·서 4좌표 → 폴리곤 표시
- **위치 데이터**: 단말 **실제 GPS**로 수집한 위·경도를 사용하며, **Supabase `trackables`** 테이블에 저장·동기화합니다
- 홈 지도에서 마커 선택 시 좌표 확인 및 **GPS 수정** 후 DB 반영 가능
- 다른 단말·사용자 위치는 DB `trackables` 조회로 지도에 표시 (React Query 갱신)

### 현장 관리 (Supabase)

- 현장 **등록 / 수정 / 목록** — `construction_sites` 테이블
- 앱 재시작 후에도 DB에 유지 (Supabase 설정 시)
- 최초 실행 시 비어 있으면 **에코24BL** 등 시드 데이터 자동 삽입 (`lib/supabaseSeed.ts`)

### 출근 QR

- 로그인 사용자 프로필 기준 QR 생성
- 관리자 스캔 → 자동 출근 처리는 **추후 연동** 예정

---

## 기술 스택

| 영역        | 기술                                                             |
| ----------- | ---------------------------------------------------------------- |
| 앱          | Expo SDK 54, React Native 0.81, React 19, TypeScript             |
| 네비게이션  | React Navigation (Bottom Tabs + 로그인 게이트)                   |
| 상태·데이터 | TanStack React Query, Zustand (Supabase 미설정 시 로컬 fallback) |
| 백엔드      | **Supabase** (PostgreSQL, REST, Auth 준비)                       |
| 지도        | react-native-webview + 네이버 Maps JS API v3                     |
| 기타        | react-native-qrcode-svg, AsyncStorage (세션)                     |

---

## Supabase 데이터 구조 (요약)

| 테이블 / 대상                                  | 용도                                              |
| ---------------------------------------------- | ------------------------------------------------- |
| `construction_sites`                           | 건설 현장 (이름, 주소, 경계 좌표, 상태 등)        |
| `trackables`                                   | 인력·장비 GPS (lat/lng, 현장별 마커)              |
| `trackables` (시스템 현장 `__AUTH_ACCOUNTS__`) | 로그인 계정 `admin` / `test` 프로필               |
| `simulate_trackables_tick` (RPC, 선택)         | 데모용 좌표 이동 함수 — `docs/supabase-setup.sql` |

스키마·RLS·RPC: **`docs/supabase-setup.sql`**  
Auth 사용자(선택): **`docs/supabase-auth-seed.sql`**

---

## 사전 요구 사항

- Node.js 18+
- npm
- Android 개발: Android Studio, SDK, AVD(에뮬레이터)
- [네이버 클라우드](https://console.ncloud.com/) Maps **Client ID** (Web Dynamic Map)
- [Supabase](https://supabase.com/) 프로젝트 (URL + anon key)

---

## 시작하기

### 1. 의존성 설치

```bash
cd native
npm install
```

### 2. 환경 변수

`.env.example`을 참고해 프로젝트 루트에 `.env`를 만듭니다.

```env
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_Client_ID
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. 네이버 지도 콘솔

Maps > Application > **Web Dynamic Map**, Web 서비스 URL (포트 없이):

- `http://localhost`
- `http://127.0.0.1`

스크립트 파라미터: **`ncpKeyId`**

### 5. 실행

```bash
# Metro만
npm start

# Android 에뮬레이터 + Expo Go (권장)
npm run emulator
```

`npm run emulator` — Metro 정리 → 에뮬레이터 부팅 → Expo Go 설치 → `adb reverse` → `expo start --android --localhost`

AVD 이름 변경:

```bash
npm run emulator -- Medium_Phone_API_36.1
```

실기기(USB):

```bash
npm run device
```

---

## 프로젝트 구조

```
native/
├── App.tsx                    # QueryClient, Auth/Supabase 부트스트랩
├── navigation/
│   ├── RootNavigator.tsx      # 로그인 ↔ 메인 탭
│   └── MainTabs.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx         # 지도, GPS 수정
│   ├── SiteListScreen.tsx
│   ├── AttendanceQrScreen.tsx
│   └── MyInfoScreen.tsx
├── components/
│   ├── AuthBootstrap.tsx
│   ├── SupabaseBootstrap.tsx
│   ├── NaverMapView.tsx
│   └── sites/
├── lib/
│   ├── supabaseClient.ts
│   ├── supabaseApi.ts         # 현장·trackables CRUD
│   ├── supabaseAuthSeed.ts    # 로그인 계정 DB 시드
│   ├── authApi.ts
│   └── naverMapHtml.ts
├── store/
│   ├── authStore.ts
│   ├── siteStore.ts           # Supabase 미설정 시 fallback
│   └── workLocationStore.ts
├── hooks/                     # React Query, GPS 시뮬/동기화
├── data/
│   ├── authProfiles.ts
│   └── seedSites.ts
├── docs/
│   ├── supabase-setup.sql
│   └── supabase-auth-seed.sql
└── scripts/
    ├── seed-auth-db.mjs
    └── run-android-emulator.sh
```

---

## npm 스크립트

| 명령                       | 설명                            |
| -------------------------- | ------------------------------- |
| `npm start`                | Expo Metro                      |
| `npm run emulator`         | 에뮬레이터 + Expo Go + 앱 실행  |
| `npm run device`           | 실기기 USB + Expo Go            |
| `npm run android` / `ios`  | 네이티브 실행                   |
| `npm run typecheck`        | TypeScript 검사                 |
| `npm run seed:auth-db`     | Supabase에 admin/test 계정 시드 |
| `npm run build:preview`           | EAS APK (Android 내부 테스트)   |
| `npm run build:preview:ios`       | EAS IPA (iOS 내부 테스트)       |
| `npm run build:preview:all`       | Android + iOS preview 빌드      |
| `npm run build:production`        | EAS AAB (Play)                  |
| `npm run build:production:ios`    | EAS IPA (App Store)             |
| `npm run build:production:all`    | Android + iOS production 빌드   |
| `npm run submit:internal`         | Play 내부 테스트 제출           |
| `npm run submit:internal:ios`     | TestFlight 제출                 |

---

## iOS 빌드 · App Store 배포

### 사전 준비

1. [Apple Developer Program](https://developer.apple.com/programs/) 가입
2. [App Store Connect](https://appstoreconnect.apple.com/)에서 앱 등록
   - Bundle ID: `com.dooson.map.beta` (Android `package`와 동일)
3. EAS 로그인: `npx eas login`
4. preview/production 환경 변수 동기화:
   ```bash
   npm run env:pull:preview
   # 또는
   npm run env:pull:production
   ```
5. 스토어 빌드용 네이버 지도 Referer (HTTPS) — `EXPO_PUBLIC_NAVER_MAP_WEBVIEW_BASE_URL` 설정

### 최초 iOS 빌드 (인증서 자동 생성)

```bash
npm run build:preview:ios
```

첫 빌드 시 EAS가 Distribution Certificate · Provisioning Profile을 생성·관리합니다.  
팀 ID 등은 CLI 프롬프트에 따라 입력하면 됩니다.

```bash
# 인증서·프로비저닝 수동 확인/갱신
npx eas credentials --platform ios
```

### TestFlight · App Store 제출

```bash
# production IPA 빌드
npm run build:production:ios

# App Store Connect / TestFlight 업로드
npm run submit:internal:ios
```

첫 `submit` 시 Apple ID · App Store Connect API Key 중 하나를 선택합니다.  
`ascAppId`(App Store Connect 앱 ID)는 제출 시 입력하거나, 이후 `eas.json`의 `submit.production.ios`에 추가할 수 있습니다.

```json
"ios": {
  "appleId": "your-apple-id@example.com",
  "ascAppId": "1234567890",
  "appleTeamId": "ABCDE12345",
  "language": "ko-KR"
}
```

### iOS 개발 (Expo Go · 시뮬레이터)

```bash
npm start
# iPhone Expo Go 앱에서 QR 스캔

# 또는 Mac + Xcode 시뮬레이터
npm run ios
```

---

## 지도 인증 실패 시

_「네이버 지도 Open API 인증이 실패했습니다」_ 가 나오면:

1. `.env`의 `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID` 확인
2. 콘솔 Web URL: `http://127.0.0.1`, `http://localhost`
3. **Web Dynamic Map** 서비스 선택 여부
4. Metro 재시작: `npm run emulator`

---

## 추후 (계약 확정 시)

실제 고객사와 **계약이 확정되면** 다음을 전제로 **별도 제품**으로 다시 기획·개발합니다.

- 고객사 **업무 프로세스·화면 IA**에 맞는 UX 재설계
- **기존 ERP / 인사 / 안전관리** 등 연동 API·계정 체계 반영
- 보안·개인정보·배포 정책(사내 MDM, 스토어, 전용 빌드 등) 적용
- 이 베타에서 검증한 지도·현장·출근 QR 흐름은 **참고 구현**으로 활용

베타 저장소와의 관계(포크, 신규 repo, 모노레포 packages)는 계약·팀 구성에 따라 결정합니다.

---

## 관련 문서

- [Expo SDK 54](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [네이버 지도 API v3](https://navermaps.github.io/maps.js.ncp/docs/)
- [Maps 문제 해결 (Ncloud)](https://guide.ncloud-docs.com/docs/application-maps-troubleshoot)
