/* =========================================================================
 *  방명록 · RSVP 내보내기 스크립트 (관리자 권한)
 *
 *  하는 일:
 *   1) guestbook 컬렉션 → guestbook.csv 로 저장
 *   2) rsvp 컬렉션      → rsvp.csv 로 저장
 *   3) 식사 인원 등 합산 결과를 콘솔에 출력
 *
 *  실행 준비 (최초 1회):
 *   1) Firebase Console → ⚙ 프로젝트 설정 → '서비스 계정' 탭
 *      → "새 비공개 키 생성" → 받은 JSON 파일을 이 프로젝트 루트에
 *         serviceAccountKey.json 이라는 이름으로 저장
 *      (⚠️ 이 키는 절대 공개 레포에 올리면 안 됩니다 — .gitignore에 이미 등록됨)
 *   2) 터미널에서:  npm install firebase-admin
 *
 *  실행:
 *      node scripts/export-firestore.js
 *
 *  결과물(guestbook.csv, rsvp.csv)은 엑셀에서 바로 열립니다(한글 깨짐 방지 BOM 포함).
 * ========================================================================= */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const KEY_PATH = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(KEY_PATH)) {
  console.error('❌ serviceAccountKey.json 이 없습니다. 스크립트 상단 "실행 준비"를 참고하세요.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(KEY_PATH)) });
const db = admin.firestore();

// CSV 한 칸 이스케이프 (쉼표·따옴표·줄바꿈 처리)
const cell = v => {
  const s = v === undefined || v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// 배열(헤더+행들) → CSV 문자열 (엑셀 한글용 UTF-8 BOM 추가)
const toCsv = rows => '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n');

// Firestore Timestamp → 'YYYY-MM-DD HH:mm' (한국시간)
const fmtTime = ts => {
  if (!ts || typeof ts.toDate !== 'function') return '';
  const d = ts.toDate();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

(async () => {
  // ── 1) 방명록 ────────────────────────────────────────────────
  const gbSnap = await db.collection('guestbook').orderBy('createdAt', 'asc').get();
  const gbRows = [['작성시각', '이름', '메시지']];
  gbSnap.forEach(doc => {
    const g = doc.data();
    gbRows.push([fmtTime(g.createdAt), g.name, g.message]);
  });
  fs.writeFileSync('guestbook.csv', toCsv(gbRows));
  console.log(`✅ guestbook.csv 저장 — 방명록 ${gbSnap.size}건`);

  // ── 2) RSVP ─────────────────────────────────────────────────
  const rvSnap = await db.collection('rsvp').orderBy('createdAt', 'asc').get();
  const rvRows = [['작성시각', '이름', '측', '참석여부', '인원', '식사여부']];

  const sum = {
    total: 0,            // 응답 건수
    attendHead: 0,       // 참석 인원 합계
    mealHead: 0,         // 식사 예정 인원 합계
    bySide: {},          // 측별 참석 인원
  };

  rvSnap.forEach(doc => {
    const r = doc.data();
    const attending = r.attending === true;
    const count = Number(r.guestCount) || 0;
    const mealYes = r.meal === 'yes';

    rvRows.push([
      fmtTime(r.createdAt),
      r.name,
      r.side,
      attending ? '참석' : '불참',
      count,
      mealYes ? '예정' : '안함',
    ]);

    sum.total += 1;
    if (attending) {
      sum.attendHead += count;
      sum.bySide[r.side] = (sum.bySide[r.side] || 0) + count;
      if (mealYes) sum.mealHead += count;
    }
  });

  fs.writeFileSync('rsvp.csv', toCsv(rvRows));
  console.log(`✅ rsvp.csv 저장 — RSVP ${rvSnap.size}건\n`);

  // ── 3) 합산 결과 ─────────────────────────────────────────────
  console.log('────────── 집계 ──────────');
  console.log(`응답 건수      : ${sum.total}건`);
  console.log(`참석 인원 합계 : ${sum.attendHead}명`);
  Object.keys(sum.bySide).forEach(side => {
    console.log(`  └ ${side} : ${sum.bySide[side]}명`);
  });
  console.log(`식사 예정 인원 : ${sum.mealHead}명   ← 식사 수 발주 기준`);
  console.log('──────────────────────────');

  process.exit(0);
})().catch(e => { console.error('오류:', e); process.exit(1); });
