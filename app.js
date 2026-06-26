/* app.js — 디지털 청첩장 앱 로직
 * config.js(window.WEDDING_CONFIG)가 먼저 로드된 후 실행됩니다.
 */

const C = window.WEDDING_CONFIG;
const qs = (sel, root = document) => root.querySelector(sel);

// ── Firebase 모듈 참조 (initFirebase 후 설정) ──────────────────────
let db = null;
let fsAdd, fsCollection, fsQuery, fsOrder, fsTimestamp, fsGetDocs;

// ═══════════════════════════════════════════════════════════════════
// 1. 커버 이미지
// ═══════════════════════════════════════════════════════════════════
{
  const img = qs('#cover-img');
  img.src = C.images.cover;
  img.onerror = () => {
    const d = document.createElement('div');
    d.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#B3AB97;font-family:"Nanum Myeongjo",serif;font-size:13px;gap:8px;';
    d.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span>사진을 추가해 주세요</span>`;
    img.parentElement.appendChild(d);
    img.style.display = 'none';
  };
}

// ═══════════════════════════════════════════════════════════════════
// 2. 혼주 표기 + 연락처
// ═══════════════════════════════════════════════════════════════════
{
  const fl = qs('#families-list');
  C.families.forEach(f => {
    const d = document.createElement('div');
    d.style.cssText = "display:flex;align-items:baseline;justify-content:center;gap:5px;margin-bottom:6px;font-family:'Nanum Myeongjo',serif;font-size:14px;";
    d.innerHTML = `<span style="color:#9A9078;">${f.parents}</span><span style="color:#C8CDA6;font-size:11px;">의</span><span style="font-weight:700;color:#5E5746;">${f.relation}</span><span style="font-weight:700;color:#6E7B45;">${f.child}</span>`;
    fl.appendChild(d);
  });

  const cl = qs('#contacts-list');
  C.contacts.forEach(ct => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:4px 0;';

    const info = document.createElement('div');
    info.innerHTML = `<span style="font-family:'Nanum Myeongjo',serif;font-size:13px;color:#9A9078;margin-right:6px;">${ct.role}</span><span style="font-family:'Nanum Myeongjo',serif;font-size:15px;font-weight:700;color:#3B3A34;">${ct.name}</span>`;

    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:6px;';

    if (ct.kakao) {
      const a = document.createElement('a');
      a.href = ct.kakao; a.target = '_blank'; a.rel = 'noopener'; a.className = 'tap';
      a.title = `${ct.name} 카카오톡`;
      a.style.cssText = 'display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#FEE500;text-decoration:none;';
      a.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3C6.477 3 2 6.477 2 11c0 2.94 1.6 5.51 4.034 7.09L5 21l3.342-1.686A10.8 10.8 0 0 0 12 20c5.523 0 10-3.477 10-7.5C22 6.477 17.523 3 12 3z"/></svg>`;
      btns.appendChild(a);
    }

    if (ct.tel) {
      const num = ct.tel.replace(/-/g, '');

      const aCall = document.createElement('a');
      aCall.href = `tel:${num}`; aCall.className = 'tap'; aCall.title = `${ct.name} 전화`;
      aCall.style.cssText = 'display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#F0EEE6;text-decoration:none;';
      aCall.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E7B45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
      btns.appendChild(aCall);

      const aSms = document.createElement('a');
      aSms.href = `sms:${num}`; aSms.className = 'tap'; aSms.title = `${ct.name} 문자`;
      aSms.style.cssText = aCall.style.cssText;
      aSms.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6E7B45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
      btns.appendChild(aSms);
    }

    row.appendChild(info);
    row.appendChild(btns);
    cl.appendChild(row);
  });
}

// ═══════════════════════════════════════════════════════════════════
// 3. 캘린더 + D-Day
// ═══════════════════════════════════════════════════════════════════
{
  const { year, month, day, hour, minute } = C.wedding.date;

  // 달력 그리기
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  let html = '';
  for (let i = 0; i < cells.length; i += 7) {
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;">';
    for (let j = 0; j < 7; j++) {
      const d = cells[i + j];
      if (!d) { html += '<div></div>'; continue; }
      if (d === day) {
        html += `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#6E7B45;color:#fff;font-family:'Nanum Myeongjo',serif;font-size:13px;font-weight:700;margin:0 auto;">${d}</div>`;
      } else {
        html += `<div style="font-family:'Nanum Myeongjo',serif;font-size:13px;color:${j === 0 ? '#C06A4F' : j === 6 ? '#4A6BB0' : '#7C7464'};line-height:34px;">${d}</div>`;
      }
    }
    html += '</div>';
  }
  qs('#cal-weeks').innerHTML = html;

  // D-Day 계산
  const target = new Date(year, month, day, hour, minute);
  const diff = target - new Date();
  const ddEl = qs('#dday');
  const sentEl = qs('#dday-sentence');

  if (diff > 0) {
    const d = Math.ceil(diff / 864e5);
    ddEl.textContent = `D - ${d}`;
    sentEl.textContent = `${d}일 남았습니다`;
  } else if (diff >= -60000) {
    ddEl.textContent = 'D - Day';
    sentEl.textContent = '오늘입니다!';
  } else {
    const d = Math.floor(-diff / 864e5);
    ddEl.textContent = `D + ${d}`;
    sentEl.textContent = `행복한 ${d}일이 지났습니다`;
  }
}

// ═══════════════════════════════════════════════════════════════════
// 4. 갤러리 + 라이트박스
// ═══════════════════════════════════════════════════════════════════
{
  const PH = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='%23EFEBDD'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='11' fill='%23B3AB97'>사진 준비 중</text></svg>`;
  const grid = qs('#gallery-grid');
  let lbIdx = 0;

  // 파일명 'N-M' 기준으로 넘버 세트별 장수 집계 → 1장뿐인 세트는 행 전체 너비로 배치
  const groupOf = src => { const m = src.match(/\/(\d+)-\d+\.[^./]+$/); return m ? m[1] : src; };
  const groupCounts = C.images.gallery.reduce((acc, src) => {
    const g = groupOf(src); acc[g] = (acc[g] || 0) + 1; return acc;
  }, {});

  // 사진별 보여줄 영역(object-position) — 얼굴 잘림 방지. 키: 파일명(확장자 제외)
  const focus = C.images.galleryFocus || {};
  const nameOf = src => { const m = src.match(/\/([^/]+)\.[^./]+$/); return m ? m[1] : ''; };

  C.images.gallery.forEach((src, i) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'aspect-ratio:1;overflow:hidden;border-radius:10px;background:#EFEBDD;cursor:pointer;';
    // 같은 세트에 1장뿐이면 한 행을 전체 너비로 차지 (예: 1-1, 15-1)
    if (groupCounts[groupOf(src)] === 1) wrap.style.gridColumn = '1 / -1';

    const img = document.createElement('img');
    img.src = src; img.alt = `갤러리 ${i + 1}`;
    img.loading = 'lazy'; img.decoding = 'async';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s ease;';
    const pos = focus[nameOf(src)];
    if (pos) img.style.objectPosition = pos;   // 지정 없으면 기본 중앙(50% 50%)
    img.onerror = () => { img.src = PH; };
    img.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.06)'; });
    img.addEventListener('mouseleave', () => { img.style.transform = ''; });

    wrap.appendChild(img);
    wrap.addEventListener('click', () => openLb(i));
    grid.appendChild(wrap);
  });

  // 라이트박스
  const lb = document.createElement('div');
  lb.style.cssText = 'display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.93);';
  lb.innerHTML = `
    <button aria-label="닫기" id="lb-x" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#fff;font-size:34px;cursor:pointer;line-height:1;padding:8px;">×</button>
    <button aria-label="이전" id="lb-prev" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.18);border:none;color:#fff;width:44px;height:44px;border-radius:50%;font-size:26px;cursor:pointer;">‹</button>
    <button aria-label="다음" id="lb-next" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.18);border:none;color:#fff;width:44px;height:44px;border-radius:50%;font-size:26px;cursor:pointer;">›</button>
    <div id="lb-center" style="height:100%;display:flex;align-items:center;justify-content:center;">
      <img id="lb-img" src="" alt="" style="max-width:94vw;max-height:88vh;object-fit:contain;border-radius:6px;">
    </div>
    <div id="lb-count" style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-family:'Nanum Myeongjo',serif;font-size:13px;pointer-events:none;"></div>
  `;
  document.body.appendChild(lb);

  const lbImg = qs('#lb-img', lb);
  const lbCount = qs('#lb-count', lb);

  function showLb() {
    lbImg.src = C.images.gallery[lbIdx];
    lbImg.onerror = () => { lbImg.src = PH; };
    lbCount.textContent = `${lbIdx + 1} / ${C.images.gallery.length}`;
  }

  function openLb(i) {
    lbIdx = i; showLb();
    lb.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.style.display = 'none';
    document.body.style.overflow = '';
  }

  const nav = delta => {
    lbIdx = (lbIdx + delta + C.images.gallery.length) % C.images.gallery.length;
    showLb();
  };

  qs('#lb-x', lb).addEventListener('click', closeLb);
  qs('#lb-prev', lb).addEventListener('click', () => nav(-1));
  qs('#lb-next', lb).addEventListener('click', () => nav(1));
  qs('#lb-center', lb).addEventListener('click', e => { if (e.target === e.currentTarget) closeLb(); });

  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1);
  });

  document.addEventListener('keydown', e => {
    if (lb.style.display !== 'block') return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') nav(1);
    if (e.key === 'ArrowLeft') nav(-1);
  });
}

// ═══════════════════════════════════════════════════════════════════
// 5. 계좌 아코디언
// ═══════════════════════════════════════════════════════════════════
{
  function renderAccList(containerId, list) {
    const el = qs(`#${containerId}`);
    list.forEach(acc => {
      const has = acc.bank && acc.number;
      const row = document.createElement('div');
      row.style.cssText = 'padding:12px 6px;border-bottom:1px solid #ECE5D4;display:flex;align-items:center;justify-content:space-between;';

      const info = document.createElement('div');
      info.style.textAlign = 'left';
      info.innerHTML = `
        <div style="font-family:'Nanum Myeongjo',serif;font-size:13px;color:#9A9078;margin-bottom:3px;">${acc.relation} · ${acc.holder}</div>
        <div style="font-family:'Nanum Myeongjo',serif;font-size:14px;color:#3B3A34;">${has ? `${acc.bank} ${acc.number}` : '<span style="color:#B3AB97;">준비 중</span>'}</div>
      `;
      row.appendChild(info);

      if (has) {
        const btn = document.createElement('button');
        btn.textContent = '복사';
        btn.style.cssText = "border:1px solid #C9CCA8;background:#FBF8F0;color:#6E7B45;font-family:'Nanum Myeongjo',serif;font-size:12px;padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;";
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(`${acc.bank} ${acc.number}`).then(() => {
            btn.textContent = '복사됨 ✓';
            setTimeout(() => { btn.textContent = '복사'; }, 1500);
          });
        });
        row.appendChild(btn);
      }
      el.appendChild(row);
    });
  }

  renderAccList('groom-accounts', C.accounts.groom);
  renderAccList('bride-accounts', C.accounts.bride);

  document.querySelectorAll('.acc-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = qs(`#${btn.dataset.target}`);
      const arrow = btn.querySelector('.acc-arrow');
      const open = body.style.display !== 'none';
      body.style.display = open ? 'none' : 'block';
      if (arrow) arrow.textContent = open ? '▼' : '▲';
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// 6. 오시는 길 (지도 + 길찾기 버튼)
// ═══════════════════════════════════════════════════════════════════
{
  const { kakaoUrl, naverUrl, tmapUrl } = C.location;
  qs('#nav-kakao').href = kakaoUrl;
  qs('#nav-naver').href = naverUrl;
  qs('#nav-tmap').href = tmapUrl;

  const mapEl = qs('#map');

  if (C.kakao.jsKey) {
    const s = document.createElement('script');
    s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${C.kakao.jsKey}&autoload=false`;
    s.onload = () => {
      kakao.maps.load(() => {
        const pos = new kakao.maps.LatLng(C.location.lat, C.location.lng);
        const map = new kakao.maps.Map(mapEl, { center: pos, level: 3 });
        const marker = new kakao.maps.Marker({ map, position: pos });
        new kakao.maps.InfoWindow({
          content: `<div style="padding:5px 8px;font-size:12px;font-family:'Nanum Myeongjo',serif;">${C.location.name}</div>`,
        }).open(map, marker);
      });
    };
    s.onerror = showMapFallback;
    document.head.appendChild(s);
  } else {
    showMapFallback();
  }

  function showMapFallback() {
    mapEl.style.cssText += 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;';
    mapEl.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9A9078" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div style="font-family:'Nanum Myeongjo',serif;text-align:center;">
        <div style="font-size:14px;font-weight:700;color:#5E5746;margin-bottom:4px;">${C.location.name}</div>
        <div style="font-size:12px;color:#9A9078;">${C.location.address}</div>
      </div>
      <a href="${kakaoUrl}" target="_blank" rel="noopener" style="font-family:'Nanum Myeongjo',serif;font-size:12px;color:#6E7B45;border:1px solid #C9CCA8;padding:8px 18px;border-radius:20px;text-decoration:none;margin-top:2px;" onclick="event.stopPropagation()">카카오맵으로 보기 →</a>
    `;
    mapEl.addEventListener('click', () => window.open(kakaoUrl, '_blank', 'noopener'));
  }
}

// ═══════════════════════════════════════════════════════════════════
// 7. RSVP 폼
// ═══════════════════════════════════════════════════════════════════
{
  const formState = { side: null, attending: null, meal: null };
  let guestCount = 1;
  const countEl = qs('#rsvp-count');

  document.querySelectorAll('.seg-group').forEach(group => {
    group.querySelectorAll('.seg').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.seg').forEach(b => b.classList.remove('seg-on'));
        btn.classList.add('seg-on');
        formState[group.dataset.field] = btn.dataset.value;
      });
    });
  });

  qs('#count-dec').addEventListener('click', () => { if (guestCount > 1) countEl.textContent = --guestCount; });
  qs('#count-inc').addEventListener('click', () => { if (guestCount < 10) countEl.textContent = ++guestCount; });

  qs('#rsvp-submit').addEventListener('click', async () => {
    const name = qs('#rsvp-name').value.trim();
    if (!name) return alert('성함을 입력해 주세요.');
    if (!formState.side) return alert('신랑측/신부측을 선택해 주세요.');
    if (!formState.attending) return alert('참석 여부를 선택해 주세요.');
    if (!formState.meal) return alert('식사 여부를 선택해 주세요.');

    const btn = qs('#rsvp-submit');
    btn.disabled = true; btn.textContent = '전송 중...';

    try {
      if (db) {
        await fsAdd(fsCollection(db, 'rsvp'), {
          name, side: formState.side,
          attending: formState.attending === '참석',
          guestCount,
          meal: formState.meal === '예정' ? 'yes' : 'no',
          createdAt: fsTimestamp(),
        });
      }
      btn.textContent = '전달 완료 ✓'; btn.style.background = '#9AA468';
      setTimeout(() => { btn.textContent = '참석 의사 전달하기'; btn.style.background = '#6E7B45'; btn.disabled = false; }, 2500);
    } catch (e) {
      console.error(e);
      alert('전송 중 오류가 발생했습니다. 다시 시도해 주세요.');
      btn.textContent = '참석 의사 전달하기'; btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// 8. 방명록
// ═══════════════════════════════════════════════════════════════════
function makeGuestItem({ name, message, date }) {
  const d = document.createElement('div');
  d.style.cssText = "background:#FBF8F0;border-radius:14px;padding:16px 18px;";
  d.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-family:'Nanum Myeongjo',serif;font-weight:700;font-size:15px;color:#3B3A34;">${name}</span>
      <span style="font-family:'Nanum Myeongjo',serif;font-size:12px;color:#B3AB97;">${date}</span>
    </div>
    <p style="font-family:'Gowun Batang',serif;font-size:14px;line-height:1.9;color:#5E5746;margin:0;">${message.replace(/\n/g, '<br>')}</p>
  `;
  return d;
}

async function loadGuestbook() {
  const list = qs('#guestbook-list');
  list.innerHTML = '';
  if (db) {
    try {
      const snap = await fsGetDocs(fsQuery(fsCollection(db, 'guestbook'), fsOrder('createdAt', 'desc')));
      snap.forEach(doc => {
        const d = doc.data();
        const ts = d.createdAt?.toDate?.() ?? new Date();
        const dateStr = `${ts.getFullYear()}.${String(ts.getMonth()+1).padStart(2,'0')}.${String(ts.getDate()).padStart(2,'0')}`;
        list.appendChild(makeGuestItem({ name: d.name, message: d.message, date: dateStr }));
      });
      if (snap.empty) {
        list.innerHTML = `<p style="font-family:'Nanum Myeongjo',serif;font-size:13px;color:#B3AB97;text-align:center;padding:20px 0;">아직 방명록이 없습니다. 첫 번째 메시지를 남겨주세요!</p>`;
      }
    } catch (e) { console.error('방명록 로드 오류:', e); }
  } else {
    C.sampleGuestbook.forEach(g => list.appendChild(makeGuestItem(g)));
  }
}

{
  const nameEl = qs('#guest-name');
  const msgEl = qs('#guest-message');
  const btn = qs('#guest-submit');

  btn.addEventListener('click', async () => {
    const name = nameEl.value.trim();
    const message = msgEl.value.trim();
    if (!name) return alert('이름을 입력해 주세요.');
    if (!message) return alert('메시지를 입력해 주세요.');

    btn.disabled = true; btn.textContent = '등록 중...';
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

    try {
      if (db) {
        await fsAdd(fsCollection(db, 'guestbook'), { name, message, createdAt: fsTimestamp() });
      }
      const list = qs('#guestbook-list');
      const placeholder = list.querySelector('p');
      if (placeholder) placeholder.remove();
      list.insertBefore(makeGuestItem({ name, message, date: dateStr }), list.firstChild);
      nameEl.value = ''; msgEl.value = '';
      btn.textContent = '등록됨 ✓'; btn.style.background = '#9AA468';
      setTimeout(() => { btn.textContent = '축하 메시지 남기기'; btn.style.background = '#6E7B45'; btn.disabled = false; }, 1800);
    } catch (e) {
      console.error(e);
      alert('등록 중 오류가 발생했습니다.');
      btn.textContent = '축하 메시지 남기기'; btn.disabled = false;
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// 9. 공유
// ═══════════════════════════════════════════════════════════════════
qs('#copy-link').addEventListener('click', () => {
  navigator.clipboard.writeText(location.href).then(() => {
    const btn = qs('#copy-link');
    const prev = btn.innerHTML;
    btn.textContent = '복사됨 ✓';
    setTimeout(() => { btn.innerHTML = prev; }, 1500);
  });
});

qs('#share-invite').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: '우강희 ♥ 최하영 결혼합니다',
      text: `${C.wedding.dateText} · ${C.wedding.venueName}`,
      url: location.href,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(location.href).then(() => alert('링크가 복사되었습니다.'));
  }
});

// ═══════════════════════════════════════════════════════════════════
// 10. BGM
// ═══════════════════════════════════════════════════════════════════
if (C.bgmSrc) {
  const audio = qs('#bgm-audio');
  const btn = qs('#bgm-toggle');
  const icon = qs('#bgm-icon');
  audio.src = C.bgmSrc;
  audio.loop = true;
  btn.style.display = 'flex';

  const SVG_PLAY = `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`;
  const SVG_MUTE = SVG_PLAY + `<line x1="3" y1="3" x2="21" y2="21" stroke-width="1.6"/>`;
  const sync = () => { icon.innerHTML = audio.paused ? SVG_MUTE : SVG_PLAY; };

  // 기본값: 재생. 브라우저 자동재생 차단 시 첫 사용자 동작(토글 버튼 제외)에서 시작.
  const gestures = ['pointerdown', 'touchstart', 'keydown'];
  const startOnGesture = e => { if (!btn.contains(e.target)) audio.play().catch(() => {}); };
  const cleanup = () => gestures.forEach(ev => document.removeEventListener(ev, startOnGesture));
  gestures.forEach(ev => document.addEventListener(ev, startOnGesture, { passive: true }));
  audio.addEventListener('play', () => { cleanup(); sync(); });
  audio.addEventListener('pause', sync);

  audio.play().catch(() => {}); // 자동재생 시도 (막히면 위 제스처 핸들러가 시작)
  sync();

  btn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });
}

// ═══════════════════════════════════════════════════════════════════
// 11. 스크롤 등장 애니메이션
// ═══════════════════════════════════════════════════════════════════
{
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('reveal-in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

// ═══════════════════════════════════════════════════════════════════
// 12. Firebase 초기화 → 방명록 로드
// ═══════════════════════════════════════════════════════════════════
async function initFirebase() {
  const fb = C.firebase;
  if (!fb.apiKey || !fb.projectId) return;
  try {
    const [{ initializeApp }, {
      getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp,
    }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js'),
    ]);
    const app = initializeApp(fb);
    db = getFirestore(app);
    fsAdd = addDoc; fsCollection = collection;
    fsQuery = query; fsOrder = orderBy;
    fsTimestamp = serverTimestamp; fsGetDocs = getDocs;
  } catch (e) {
    console.error('Firebase 초기화 오류:', e);
  }
}

initFirebase().then(loadGuestbook);
