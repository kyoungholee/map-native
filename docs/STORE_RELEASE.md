# Google Play 출시 체크리스트

Play Console **프로덕션 공개 직전**까지 단계별로 진행합니다.  
완료한 항목은 `[x]`로 표시해 나갑니다.

> 전체 QA 항목(동기화 UI, 실기기, EAS env): **[QA_RELEASE_CHECKLIST.md](./QA_RELEASE_CHECKLIST.md)**

> **iOS App Store**는 별도 과정(Apple Developer $99/년, Xcode/EAS iOS 빌드)입니다. 이 문서는 **Google Play** 기준입니다.

---

## 진행 현황 요약

| 단계  | 내용                                        | 상태                            |
| ----- | ------------------------------------------- | ------------------------------- |
| **1** | 프로젝트·빌드 설정 (EAS, 버전, 지도 URL)    | 코드 반영 완료 → 로컬 확인 필요 |
| **2** | 내부 테스트용 APK 빌드 (EAS)                | 👉 다음에 함께                  |
| **3** | 스토어 등록 자료 (문구, 스크린샷, 개인정보) | 👉                              |
| **4** | AAB 프로덕션 빌드 + 비공개/공개 트랙 업로드 | 👉                              |

---

## 1단계 — 프로젝트 준비 (저장소)

### 1.1 빌드 설정

- [x] `eas.json` — preview(APK), production(AAB) 프로필
- [x] `app.json` — `versionCode`, 패키지명, 스토어용 앱 이름
- [x] `package.json` — `build:preview`, `build:production` 스크립트
- [ ] 로컬에서 `npx tsc --noEmit` 통과 확인
- [ ] Expo 계정 로그인: `npx eas login`

### 1.2 환경 변수 (`.env`)

```env
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_ID
# 개발(Expo Go / Metro)
EXPO_PUBLIC_NAVER_MAP_WEBVIEW_BASE_URL=
# 비우면 개발 시 127.0.0.1:8081 / localhost 자동

# 스토어 빌드·Play 등록용 (HTTPS 공개 URL)
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://your-domain.com/privacy-policy.html
```

프로덕션 빌드 시 **반드시** 설정:

```env
EXPO_PUBLIC_NAVER_MAP_WEBVIEW_BASE_URL=https://enterprise-beta-construction.dooson.it
```

(EAS Secrets에도 동일 키 등록 권장)

### 1.3 네이버 지도 콘솔

**Web Dynamic Map** Application에 URL 추가 (호스트만, 포트 없음):

| 용도                | URL                                                                        |
| ------------------- | -------------------------------------------------------------------------- |
| 개발                | `http://localhost`, `http://127.0.0.1`                                     |
| 스토어 앱 (WebView) | `https://enterprise-beta-construction.dooson.it` (또는 실제 호스팅 도메인) |

- [ ] 프로덕션 도메인 등록 완료
- [ ] `docs/privacy-policy.html` 을 위 도메인에 업로드해 HTTPS로 접근 가능

### 1.4 앱 내·정책

- [x] `docs/privacy-policy.html` 초안 작성
- [x] 마이정보 → 개인정보처리방침 링크
- [x] 위치 권한 제거 (GPS 시뮬레이션만 사용 → Play 데이터 안전 단순화)

---

## 2단계 — 내부 테스트 빌드 (EAS)

```bash
cd native
npm install
npx eas login
npx eas build:configure   # 최초 1회 (프로젝트 ID 연결)
```

프로젝트에 EAS project ID가 없으면 위 명령이 `app.json`에 `extra.eas.projectId`를 추가합니다.

### Preview APK (팀 설치용)

```bash
# .env 프로덕션 URL 넣은 뒤
npm run build:preview
```

또는 EAS Secrets:

```bash
npx eas secret:create --name EXPO_PUBLIC_NAVER_MAP_CLIENT_ID --value "xxx" --type string
npx eas secret:create --name EXPO_PUBLIC_NAVER_MAP_WEBVIEW_BASE_URL --value "https://enterprise-beta-construction.dooson.it" --type string
```

- [ ] Preview 빌드 성공
- [ ] 실기기 APK 설치 후 **지도 로드** 확인
- [ ] 현장·QR·탭 동작 확인

---

## 3단계 — Google Play Console

### 3.1 계정

- [ ] [Play Console](https://play.google.com/console) 개발자 등록 (**$25**, 1회)
- [ ] 개발자 계정 본인/사업자 정보 완료

### 3.2 앱 만들기

| 항목      | 권장 예시                                           |
| --------- | --------------------------------------------------- |
| 앱 이름   | 건설현장 베타                                       |
| 기본 언어 | 한국어                                              |
| 앱 유형   | 앱 / 비게임                                         |
| 패키지명  | `com.dooson.map.beta` (스토어 첫 등록 후 변경 불가) |

### 3.3 스토어 등록 (그래픽)

- [ ] 앱 아이콘 512×512 (PNG)
- [ ] 스크린샷 최소 2장 (휴대전화, 16:9 또는 9:16)
- [ ] 짧은 설명 (80자 이내)
- [ ] 전체 설명
- [ ] 개인정보처리방침 **URL** (`EXPO_PUBLIC_PRIVACY_POLICY_URL` 과 동일)

**짧은 설명 예시**

> 건설 현장 지도, 현장 등록, 출근 QR을 확인하는 베타 앱입니다.

### 3.4 정책·설문

- [ ] 콘텐츠 등급 설문
- [ ] 타겟 연령·광고 여부
- [ ] **데이터 안전**: 위치 미수집(시뮬레이션만) / 계정 미수집(베타)에 맞게 선언
- [ ] 앱 액세스: 로그인 없음 → “모든 기능 무료 이용” 등

---

## 4단계 — 프로덕션 업로드 (공개 직전)

```bash
npm run build:production
```

- [ ] AAB 빌드 성공
- [ ] Play Console → **내부 테스트** 또는 **비공개 테스트** 트랙에 AAB 업로드
- [ ] 테스터 기기에서 설치·최종 확인
- [ ] 프로덕션 트랙 제출 → 심사 대기

### 공개 전 최종 확인

- [ ] 앱 설명에 “베타”“데모 데이터” 명시 (목업·API 미연동)
- [ ] 크래시 없음
- [ ] 개인정보 URL 동작
- [ ] 지도 인증 실패 없음

---

## 자주 묻는 질문

**Q. Expo Go로 올리면 되나요?**  
A. 안 됩니다. `eas build`로 만든 **독립 AAB**만 업로드 가능합니다.

**Q. 올리기 쉬운가요?**  
A. 빌드는 EAS로 중간 난이도. 첫 등록·심사·스크린샷·개인정보는 1~2주 정도 잡는 것이 안전합니다.

**Q. NH 전용 앱과 관계는?**  
A. 이 패키지는 **베타 검증용**. NH 계약 시 별도 앱·패키지명으로 갈 수 있습니다.

---

## 다음에 할 일 (지금)

1. `.env`에 프로덕션 `EXPO_PUBLIC_NAVER_MAP_WEBVIEW_BASE_URL` 설정
2. 네이버 콘솔에 HTTPS 도메인 등록
3. `privacy-policy.html` 웹 서버에 업로드
4. 터미널에서: `npx eas login` 후 `npm run build:preview`

1단계 확인이 끝나면 **2단계 EAS 빌드**를 같이 진행하면 됩니다.
