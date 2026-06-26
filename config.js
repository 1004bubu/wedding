/* =========================================================================
 *  청첩장 설정 파일 — 여기만 수정하면 됩니다
 *  우강희 ♥ 최하영  /  2026.10.04 일 오후 5:20  /  루이비스 웨딩 중구
 *
 *  ⚠️ 표시는 실제 정보 확인 후 반드시 교체해야 하는 항목입니다.
 * ========================================================================= */
window.WEDDING_CONFIG = {

  /* ── 신랑 · 신부 ───────────────────────────────────────────────── */
  groom: { name: '우강희', label: '1004 신랑' },
  bride: { name: '최하영', label: '1004 신부' },

  /* ── 예식 일시 · 장소 ──────────────────────────────────────────── */
  wedding: {
    // 캘린더/디데이 계산에 사용 (월은 0부터: 9 = 10월)
    date: { year: 2026, month: 9, day: 4, hour: 17, minute: 20 },
    dateText: '2026년 10월 4일 일요일 오후 5시 20분',
    venueName: '루이비스 웨딩 중구',
  },

  /* ── 이미지 (로컬 경로) ────────────────────────────────────────────
   *  cover    : 대문(메인) 1장   — 권장 3:4 세로, 예) images/cover/main.jpg
   *  gallery  : 슬라이드용 N장    — 정사각(1:1) 권장, 예) images/gallery/01.jpg
   *  파일이 아직 없어도 placeholder가 자동 표시됩니다(onerror 대체).
   *  최적화: 가능하면 .webp 로 변환해 같은 이름으로 두세요. */
  images: {
    cover: 'images/cover/main.jpg',
    gallery: [
      'images/gallery/01.jpg',
      'images/gallery/02.jpg',
      'images/gallery/03.jpg',
      'images/gallery/04.jpg',
      'images/gallery/05.jpg',
      'images/gallery/06.jpg',
      'images/gallery/07.jpg',
      'images/gallery/08.jpg',
      'images/gallery/09.jpg',
      'images/gallery/10.jpg',
      'images/gallery/11.jpg',
      'images/gallery/12.jpg',
      'images/gallery/13.jpg',
      'images/gallery/14.jpg',
      'images/gallery/15.jpg',
      'images/gallery/16.jpg',
      'images/gallery/17.jpg',
      'images/gallery/18.jpg',
      'images/gallery/19.jpg',
      'images/gallery/20.jpg',
      'images/gallery/21.jpg',
      'images/gallery/22.jpg',
      'images/gallery/23.jpg',
      'images/gallery/24.jpg',
      'images/gallery/25.jpg',
      'images/gallery/26.jpg',
      'images/gallery/27.jpg',
    ],
  },

  /* ── 연락처 ─────────────────────────────────────────────────────────
   *  신랑·신부 : 카카오 개인링크(kakao) 우선 노출. ID 미정이면 빈 값으로 두세요.
   *  부모님    : 전화(tel)·문자(sms) 버튼. */
  contacts: [
    { role: '신랑',      name: '우강희', tel: '010-4793-9254' },
    { role: '신랑 아버지', name: '우성호', tel: '010-9135-9949' },
    { role: '신랑 어머니', name: '이혜순', tel: '010-9424-5187' },
    { role: '신부',      name: '최하영', tel: '010-9991-9523' },
    { role: '신부 아버지', name: '최칠범', tel: '010-5331-0862' },
    { role: '신부 어머니', name: '전주현', tel: '010-4899-9523' },
  ],

  /* ── 혼주 표기 (인사말 하단) ──────────────────────────────────────── */
  families: [
    { parents: '우성호 · 이혜순', relation: '장남', child: '강희' },
    { parents: '최칠범 · 전주현', relation: '장녀', child: '하영' },
  ],

  /* ── 마음 전하실 곳 (계좌) ───────────────────────────────────────────
   *  bank/number 가 비어 있으면 '준비 중'으로 표시되고 복사 버튼은 숨겨집니다. */
  accounts: {
    groom: [
      { relation: '신랑',   holder: '우강희', bank: '농협은행', number: '30217744383113' },
      { relation: '아버지', holder: '우성호', bank: '농협은행', number: '58512011425' },
      { relation: '어머니', holder: '이혜순', bank: '농협은행', number: '22503651207555' },
    ],
    bride: [
      { relation: '신부',   holder: '최하영', bank: '케이뱅크', number: '100217666514' },
      { relation: '아버지', holder: '최칠범', bank: '국민은행', number: '044210914324' },
      { relation: '어머니', holder: '전주현', bank: '국민은행', number: '044240572524' },
    ],
  },

  /* ── 오시는 길 ─────────────────────────────────────────────────────── */
  location: {
    name: '루이비스 웨딩 중구',
    address: '서울시 중구 청파로 463 한국경제신문사 18층',
    tel: '02-312-6800',
    // 카카오맵 지오코딩 실패 시 사용할 예비 좌표
    lat: 37.56060023904431,
    lng: 126.96735289698235,
    // 길찾기 버튼 (앱키 불필요)
    kakaoUrl: 'https://map.kakao.com/?q=' + encodeURIComponent('루이비스웨딩 중구점'),
    naverUrl: 'https://map.naver.com/v5/search/' + encodeURIComponent('루이비스웨딩 중구'),
    tmapUrl:  'https://tmap.life/route?name=' + encodeURIComponent('루이비스웨딩 중구'),
  },

  /* ── 카카오 ────────────────────────────────────────────────────────────
   *  jsKey : Kakao Developers > 내 애플리케이션 > 앱 키 > JavaScript 키
   *          + 플랫폼 > Web 에 배포 도메인 등록 필요 (예: https://계정.github.io)
   *  비어 있으면 지도 임베드 대신 길찾기 버튼만 노출됩니다. */
  kakao: {
    jsKey: '8410b0ab71c5776ce46d957a70595387', // 카카오 JavaScript 앱키
  },

  /* ── Firebase (방명록 · 참석 의사) ─────────────────────────────────────
   *  Firebase Console > 프로젝트 설정 > 내 앱(웹) > SDK 설정 의 값들.
   *  비어 있으면 '미리보기 모드'로 동작합니다(예시 데이터 표시, 저장은 안 됨).
   *  값을 채우면 Firestore(guestbook / rsvp 컬렉션)에 실제 저장됩니다. */
  firebase: {
    apiKey: "AIzaSyB06JePQpwYjrSEUg5R4pN5qydY42FP4fk",
    authDomain: "wedding-dc19a.firebaseapp.com",
    projectId: "wedding-dc19a",
    storageBucket: "wedding-dc19a.firebasestorage.app",
    messagingSenderId: "196587293260",
    appId: "1:196587293260:web:e751d7d9e54b09551802e9",
    measurementId: "G-W93TV0FY32"
  },

  /* ── 배경음악(선택) ────────────────────────────────────────────────────
   *  mp3 경로를 넣으면 우하단에 재생 버튼이 표시됩니다. 비우면 버튼 숨김.
   *  예) 'music/bgm.mp3' */
  bgmSrc: 'music/bgm.mp3',

  /* ── 미리보기 모드용 예시 데이터 (Firebase 연동 전에만 노출) ─────────── */
  sampleGuestbook: [
    { name: '정유진', message: '두 분의 앞날에 사랑과 행복이 가득하길 바랄게요. 결혼 진심으로 축하해요!', date: '2026.06.20' },
    { name: '최도윤', message: '강희야 결혼 축하한다! 천국의 1004처럼 늘 행복하게 잘 살아라 :)', date: '2026.06.18' },
    { name: '한소율', message: '예쁜 신부 하영이 축하해~ 두 사람 오래오래 행복하자!', date: '2026.06.15' },
  ],
};
