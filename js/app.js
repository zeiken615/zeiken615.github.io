/* DHL MATH — 화면 구성과 동작 */
const app = document.getElementById('app');
const state = {
  courses: Store.getCourses(),
  notices: Store.getNotices(),
  done: Store.getDoneTasks(),
  filter: '전체',
  search: '',
  adminTab: 'courses'
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 공통 도구 ---------- */
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const fmtDate = d => { const [y, m, day] = String(d).split('-'); return y && m && day ? `${y}. ${pad(m)}. ${pad(day)}` : esc(d); };
const findCourse = id => state.courses.find(c => c.id === id);

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function youtubeId(url) {
  if (!url) return '';
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : '';
}

function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { page: parts[0] || 'home', a: parts[1], b: parts[2] };
}

function pageHead(label, title, desc) {
  return `<section class="page-head"><p class="label reveal">${label}</p><h1 class="reveal">${title}</h1>${desc ? `<p class="page-desc reveal">${desc}</p>` : ''}</section>`;
}

const previewNote = who => `<p class="note reveal">미리보기 — 로그인 기능을 연결하기 전이라 가상의 ${who} 화면을 보여드립니다. 실제 학생 정보가 아닙니다.</p>`;

/* ---------- 그래프 그림 (강좌 이미지) ---------- */
const pathOf = (f, x0, x1, n = 120) => {
  let d = '';
  for (let i = 0; i <= n; i++) { const [px, py] = f(x0 + (x1 - x0) * i / n); d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`; }
  return d;
};
const line = (x1, y1, x2, y2, cls = 'ax') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="4" class="pt"/>`;
const curve = (d, cls = '') => `<path d="${d}" pathLength="1" class="draw ${cls}"/>`;

const ARTS = {
  // y = x² 와 y = 1 (교점 x = ±1)
  parabola: () => line(40, 330, 360, 330) + line(200, 60, 200, 440) +
    curve(pathOf(x => [200 + 90 * x, 330 - 90 * x * x], -1.6, 1.6)) +
    line(70, 240, 330, 240, 'ax ax-dash') + dot(110, 240) + dot(290, 240),
  // 원과 접선 (반지름 90, 45° 지점에서 접함)
  circle: () => line(40, 250, 360, 250) + line(200, 60, 200, 440) +
    curve(pathOf(t => [200 + 90 * Math.cos(t), 250 - 90 * Math.sin(t)], 0, Math.PI * 2)) +
    line(143.6, 66.4, 383.6, 306.4, 'ax ax-dash') + line(200, 250, 263.6, 186.4, 'ax') + dot(263.6, 186.4),
  // y = sin x (0 ≤ x ≤ 2π)
  sine: () => line(40, 250, 360, 250) + line(60, 130, 60, 370) +
    curve(pathOf(x => [60 + 280 * x / (Math.PI * 2), 250 - 80 * Math.sin(x)], 0, Math.PI * 2)) +
    dot(130, 170) + dot(270, 330),
  // y = x³ − 3x 와 극대점에서의 접선
  cubic: () => line(40, 250, 360, 250) + line(200, 70, 200, 430) +
    curve(pathOf(x => [200 + 60 * x, 250 - 35 * (x ** 3 - 3 * x)], -2.1, 2.1)) +
    line(70, 180, 230, 180, 'ax ax-dash') + dot(140, 180),
  // 시험 점수 흐름
  scores: () => {
    const s = [62, 68, 74, 71, 80, 84];
    const pts = s.map((v, i) => [70 + i * 52, 400 - (v - 50) * 7]);
    return line(50, 400, 350, 400) + pts.map(([x]) => line(x, 400, x, 395)).join('') +
      curve('M' + pts.map(p => p.join(' ')).join('L')) + pts.map(([x, y]) => dot(x, y)).join('');
  },
  // y = ln x (x = 1 에서 0)
  log: () => line(40, 300, 360, 300) + line(60, 70, 60, 440) +
    curve(pathOf(x => [60 + 45 * x, 300 - 55 * Math.log(x)], 0.15, 6)) + dot(105, 300),
  // 아르키메데스 나선
  spiral: () => curve(pathOf(t => [200 + 6 * t * Math.cos(t), 250 - 6 * t * Math.sin(t)], 0, Math.PI * 6, 300))
};
const ART_ORDER = ['parabola', 'circle', 'sine', 'cubic', 'scores', 'log', 'spiral'];
function artKey(c) {
  const s = `${c.subject} ${c.title}`;
  if (/공통수학1/.test(s)) return 'parabola';
  if (/공통수학2/.test(s)) return 'circle';
  if (/대수|삼각/.test(s)) return 'sine';
  if (/미적분/.test(s)) return 'cubic';
  if (/내신|기출/.test(s)) return 'scores';
  if (/수능|모의/.test(s)) return 'log';
  if (/심화|고난도/.test(s)) return 'spiral';
  const n = [...String(c.id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return ART_ORDER[n % ART_ORDER.length];
}
const art = (key, label = '') => `<svg class="art" viewBox="0 0 400 500" role="img" aria-label="${esc(label)}"><g>${ARTS[key]()}</g></svg>`;

/* 첫 화면 그림: 점수가 오르는 곡선 */
function heroArt() {
  const W = 1200, H = 640;
  // 글자가 놓이는 왼쪽 아래를 비워 두고 오른쪽 위로만 그림
  const f = x => [540 + x * 600, 380 - 280 / (1 + Math.exp(-8 * (x - 0.5)))];
  const marks = [0.04, 0.24, 0.42, 0.58, 0.76, 0.96].map(f);
  return `<svg class="hero-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    ${[100, 200, 300, 400].map(y => line(540, y, 1160, y, 'ax ax-faint')).join('')}${line(540, 400, 1160, 400)}
    ${curve(pathOf(f, 0, 1, 200), 'hero-curve')}
    ${marks.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" class="pt" style="--d:${0.9 + i * 0.18}s"/>`).join('')}
  </svg>`;
}

/* 점수 변화 그래프 (흑백) */
function scoreChart(tests) {
  const w = 560, h = 300, padL = 36, padR = 40, padT = 30, padB = 40;
  const iw = w - padL - padR, ih = h - padT - padB, min = 50, max = 100;
  const x = i => padL + (tests.length === 1 ? iw / 2 : iw * i / (tests.length - 1));
  const y = v => padT + ih - (v - min) / (max - min) * ih;
  let g = '';
  for (let v = min; v <= max; v += 10) g += line(padL, y(v), w - padR, y(v), v === min ? 'ax' : 'ax ax-faint') + `<text x="${padL - 10}" y="${y(v) + 4}" text-anchor="end" class="tx">${v}</text>`;
  const last = tests.length - 1;
  const d = 'M' + tests.map((t, i) => `${x(i)} ${y(t.score)}`).join('L');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="시험 점수 변화: ${tests.map(t => `${esc(t.name)} ${t.score}점`).join(', ')}">
    ${g}${curve(d)}
    ${tests.map((t, i) => `<circle cx="${x(i)}" cy="${y(t.score)}" r="${i === last ? 5 : 3.5}" class="${i === last ? 'pt' : 'pt pt-open'}"><title>${esc(t.name)} ${t.score}점</title></circle>`).join('')}
    <text x="${x(last) + 10}" y="${y(tests[last].score) - 12}" class="tx tx-strong">${tests[last].score}</text>
    ${tests.map((t, i) => `<text x="${x(i)}" y="${h - 12}" text-anchor="middle" class="tx">${esc(t.name)}</text>`).join('')}
  </svg>`;
}

/* ---------- 홈 ---------- */
function viewHome() {
  const first = DEMO_STUDENT.tests[0].score, last = DEMO_STUDENT.tests.at(-1).score;
  const notices = state.notices.slice(0, 3);
  return `
  <section class="hero">
    <div class="hero-media">${heroArt()}</div>
    <div class="hero-text">
      <p class="label hero-in" style="--d:.1s">High School Mathematics — ${esc(SITE.teacher)}</p>
      <h1 class="hero-title"><span class="hero-in" style="--d:.25s">틀린 문제에는</span><span class="hero-in" style="--d:.4s">이유가 있습니다</span></h1>
      <a class="text-link hero-in" style="--d:.6s" href="#/consult">상담 신청하기</a>
    </div>
    <p class="hero-caption hero-in" style="--d:1.4s">한 학생의 점수 변화 · ${first} → ${last} · 예시</p>
  </section>

  <section class="statement">
    <p class="label reveal">Philosophy</p>
    <p class="statement-text reveal">${esc(SITE.slogan)}</p>
  </section>

  <section class="block">
    <div class="block-head"><p class="label reveal">Method</p></div>
    <ol class="method">
      ${[
        ['시험 분석', '학교 시험과 테스트를 문항별로 나눠 보고, 어디서 점수가 빠졌는지 찾습니다.'],
        ['변형 문제', '틀린 문제와 같은 원리를 숫자와 조건만 바꿔 다시 풀게 합니다.'],
        ['오답노트', '학생마다 다른 오답을 모아, 다시 풀 때까지 따라갑니다.'],
        ['성적 보고서', '무엇이 좋아졌고 무엇이 남았는지 학부모님께 쉬운 말로 알려드립니다.']
      ].map(([t, d], i) => `<li class="reveal" style="--d:${i * 0.08}s"><span class="num">${pad(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
    </ol>
  </section>

  <section class="block">
    <div class="block-head"><p class="label reveal">Courses</p><a class="text-link reveal" href="#/courses">모든 강좌</a></div>
    <div class="grid">${state.courses.slice(0, 4).map(courseItem).join('')}</div>
  </section>

  <section class="split">
    <div class="split-media reveal">${art('scores', '점수 흐름 그림')}</div>
    <div class="split-text">
      <p class="label reveal">Report</p>
      <h2 class="reveal">점수만 알려드리지 않습니다</h2>
      <p class="reveal">시험이 끝나면 왜 틀렸는지 찾고, 다시 풀게 하고, 그 과정을 보고서로 남깁니다. 학생마다 다른 오답노트를 만들고, 학부모님께는 쉬운 말로 정리해 보내드립니다.</p>
      <a class="text-link reveal" href="#/system">성적 관리 방식</a>
    </div>
  </section>

  <section class="block teacher">
    <p class="label reveal">Teacher</p>
    <h2 class="reveal">${esc(SITE.teacher)}</h2>
    <p class="teacher-text reveal">식을 외우기 전에 그림으로 먼저 봅니다. 그래프와 도형으로 이해한 개념은 문제가 바뀌어도 흔들리지 않습니다.</p>
  </section>

  <section class="block">
    <div class="block-head"><p class="label reveal">Notice</p><a class="text-link reveal" href="#/notice">전체 보기</a></div>
    <ul class="list">
      ${notices.length ? notices.map(n => `<li class="reveal"><a href="#/notice/${esc(n.id)}"><time>${fmtDate(n.date)}</time><span>${esc(n.title)}</span></a></li>`).join('') : '<li class="empty">등록된 공지가 없습니다.</li>'}
    </ul>
  </section>

  <section class="closing">
    <p class="label reveal">Consultation</p>
    <h2 class="reveal">지금 성적에서 무엇이 막혀 있는지<br>함께 찾아보겠습니다</h2>
    <a class="btn reveal" href="#/consult">상담 신청하기</a>
  </section>`;
}

/* ---------- 성적 관리 ---------- */
function viewSystem() {
  const s = DEMO_STUDENT;
  const steps = [
    ['문항별 시험 분석', '문항마다 정답률과 난이도를 나누어, 반 전체가 어려워한 문제와 학생 혼자 틀린 문제를 구분합니다.'],
    ['변형 문제 제작', '틀린 문제의 원리는 그대로 두고 숫자와 조건을 바꿔, 진짜 이해했는지 확인합니다.'],
    ['개인 오답노트', '학생마다 틀린 문항이 다르기 때문에, 오답노트도 한 명씩 따로 만듭니다.'],
    ['성적 보고서', '점수 변화와 앞으로의 계획을 쉬운 말로 정리해 학부모님께 보내드립니다.']
  ];
  return `${pageHead('System', '성적 관리', '시험이 끝나면 점수만 알려드리지 않습니다. 왜 틀렸는지 찾고, 다시 풀게 하고, 그 과정을 보고서로 남깁니다.')}
  <section class="block">
    <ol class="method">${steps.map(([t, d], i) => `<li class="reveal" style="--d:${i * 0.08}s"><span class="num">${pad(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </section>
  <section class="split split-report">
    <div class="split-text">
      <p class="label reveal">Report — Sample</p>
      <h2 class="reveal">보고서에 담기는 내용</h2>
      <ul class="plain reveal">
        <li>시험별 점수 변화 그래프</li>
        <li>단원별로 자주 틀린 부분과 다시 푼 결과</li>
        <li>선생님이 직접 쓴 학습 의견과 다음 목표</li>
      </ul>
      <p class="muted reveal">오른쪽은 가상의 학생으로 만든 예시입니다.</p>
    </div>
    <article class="sheet reveal">
      <header><span class="label">성적 보고서</span><span>${esc(s.name)} · ${esc(s.grade)}</span></header>
      ${scoreChart(s.tests)}
      <table class="table"><thead><tr><th>단원</th><th>틀린 문항</th><th>상태</th></tr></thead><tbody>
        ${s.wrongNotes.map(w => `<tr><td>${esc(w.unit)}</td><td>${w.count}</td><td>${w.status === '완료' ? '완료' : '<b>다시 풀기</b>'}</td></tr>`).join('')}
      </tbody></table>
      <p class="sheet-comment">${esc(s.comment)}</p>
    </article>
  </section>`;
}

/* ---------- 강좌 ---------- */
function courseItem(c, i = 0) {
  return `<article class="item reveal" style="--d:${(i % 4) * 0.08}s">
    <a href="#/course/${esc(c.id)}">
      <div class="item-media">${art(artKey(c), c.title)}</div>
      <p class="label">${esc(c.grade)} — ${esc(c.subject)}</p>
      <h3>${esc(c.title)}</h3>
      <p class="item-meta">${c.lessons.length}개 차시</p>
    </a>
  </article>`;
}

function courseGrid() {
  const q = state.search.trim().toLowerCase();
  const list = state.courses.filter(c =>
    (state.filter === '전체' || c.grade === state.filter) &&
    (!q || `${c.title} ${c.subject} ${c.desc} ${c.lessons.map(l => l.title).join(' ')}`.toLowerCase().includes(q)));
  return `<p class="count">${list.length} 강좌</p>
    <div class="grid">${list.length ? list.map(courseItem).join('') : '<p class="empty">조건에 맞는 강좌가 없습니다.</p>'}</div>`;
}

function viewCourses(grade) {
  if (grade && ['전체', ...GRADES].includes(decodeURIComponent(grade))) state.filter = decodeURIComponent(grade);
  return `${pageHead('Courses', '강좌', '')}
  <section class="block block-flush">
    <div class="toolbar">
      <div class="filters" role="group" aria-label="학년 선택">
        ${['전체', ...GRADES].map(g => `<button type="button" class="filter ${state.filter === g ? 'on' : ''}" data-filter="${g}" aria-pressed="${state.filter === g}">${g}</button>`).join('')}
      </div>
      <label class="search"><span class="sr">강좌 검색</span><input id="courseSearch" type="search" placeholder="검색" value="${esc(state.search)}"></label>
    </div>
    <div id="courseResults">${courseGrid()}</div>
  </section>`;
}

/* ---------- 강의실 ---------- */
function viewClassroom(id, lessonNo) {
  const c = findCourse(id);
  if (!c) return viewNotFound('강좌를 찾을 수 없습니다');
  const idx = Math.min(Math.max((Number(lessonNo) || 1) - 1, 0), Math.max(c.lessons.length - 1, 0));
  const lesson = c.lessons[idx];
  const vid = lesson ? youtubeId(lesson.video) : '';
  const player = vid
    ? `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(lesson.title)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
    : `<div class="player player-empty">${art(artKey(c))}<p>이 차시 영상은 준비 중입니다</p></div>`;
  return `<section class="page-head page-head-course">
      <a class="back" href="#/courses">← 강좌</a>
      <p class="label reveal">${esc(c.grade)} — ${esc(c.subject)}</p>
      <h1 class="reveal">${esc(c.title)}</h1>
      <p class="page-desc reveal">${esc(c.desc)}</p>
    </section>
  <section class="block block-flush classroom">
    <div class="reveal">
      ${lesson ? `${player}
      <div class="lesson-now"><span class="num">${pad(idx + 1)}</span><h2>${esc(lesson.title)}</h2></div>
      <div class="lesson-nav">
        ${idx > 0 ? `<a class="text-link text-link-back" href="#/course/${esc(c.id)}/${idx}">이전 차시</a>` : '<span></span>'}
        ${idx < c.lessons.length - 1 ? `<a class="text-link" href="#/course/${esc(c.id)}/${idx + 2}">다음 차시</a>` : ''}
      </div>` : '<p class="empty">아직 등록된 차시가 없습니다.</p>'}
    </div>
    <aside class="reveal">
      <p class="label">차시 — ${c.lessons.length}</p>
      <ol class="lessons">
        ${c.lessons.map((l, i) => `<li><a href="#/course/${esc(c.id)}/${i + 1}" class="${i === idx ? 'on' : ''}" ${i === idx ? 'aria-current="true"' : ''}><span class="num">${pad(i + 1)}</span><span>${esc(l.title)}</span>${youtubeId(l.video) ? '<i>영상</i>' : ''}</a></li>`).join('')}
      </ol>
    </aside>
  </section>`;
}

/* ---------- 공지 ---------- */
function viewNotice(openId) {
  return `${pageHead('Notice', '공지', '')}
  <section class="block block-flush narrow">
    ${state.notices.length ? `<div class="notices">${state.notices.map(n => `
      <details class="notice reveal" ${n.id === openId ? 'open' : ''} id="notice-${esc(n.id)}">
        <summary><time>${fmtDate(n.date)}</time><span>${esc(n.title)}</span></summary>
        <div class="notice-body">${esc(n.body).replace(/\n/g, '<br>')}</div>
      </details>`).join('')}</div>` : '<p class="empty">등록된 공지가 없습니다.</p>'}
  </section>`;
}

/* ---------- 학생 ---------- */
function viewStudent() {
  const s = DEMO_STUDENT;
  const done = s.tasks.filter(t => state.done.includes(t.id)).length;
  const last = s.tests.at(-1), prev = s.tests.at(-2);
  const diff = last.score - prev.score;
  return `${pageHead('Student', '학생 학습관', '')}
  <section class="block block-flush">
    ${previewNote('학생')}
    <div class="figures reveal">
      <div><span class="label">오늘 할 일</span><strong>${done}<small>/${s.tasks.length}</small></strong></div>
      <div><span class="label">최근 시험 · ${esc(last.name)}</span><strong>${last.score}</strong><em>지난번보다 ${diff >= 0 ? '+' : ''}${diff}점</em></div>
      <div><span class="label">다시 풀 오답</span><strong>${s.wrongNotes.filter(w => w.status !== '완료').reduce((a, w) => a + w.count, 0)}<small>문항</small></strong></div>
    </div>
    <div class="cols">
      <div class="col reveal">
        <p class="label">오늘 할 일</p>
        ${s.tasks.map(t => `<label class="task ${state.done.includes(t.id) ? 'done' : ''}"><input type="checkbox" data-task="${t.id}" ${state.done.includes(t.id) ? 'checked' : ''}><span>${esc(t.text)}</span><small>${esc(t.due)}</small></label>`).join('')}
        <p class="label label-gap">점수 변화</p>
        ${scoreChart(s.tests)}
      </div>
      <div class="col reveal">
        <p class="label">이어서 듣기</p>
        ${s.courses.map(sc => { const c = findCourse(sc.id); if (!c) return ''; const pct = Math.round(sc.done / c.lessons.length * 100); return `<a class="progress" href="#/course/${esc(c.id)}/${Math.min(sc.done + 1, c.lessons.length)}"><span>${esc(c.title)}</span><small>${sc.done}/${c.lessons.length}</small><i style="--w:${pct}%"></i></a>`; }).join('')}
        <p class="label label-gap">오답노트</p>
        <ul class="rows">${s.wrongNotes.map(w => `<li><span>${esc(w.unit)}</span><small>${w.count}문항 · ${esc(w.status)}</small></li>`).join('')}</ul>
        <p class="label label-gap">성적표</p>
        <ul class="rows">${s.reports.map(r => `<li><span>${esc(r.title)}<small class="sub">${fmtDate(r.date)}</small></span><button type="button" class="text-btn" data-locked>열기</button></li>`).join('')}</ul>
      </div>
    </div>
  </section>`;
}

/* ---------- 학부모 ---------- */
function viewParent() {
  const s = DEMO_STUDENT;
  const first = s.tests[0], last = s.tests.at(-1);
  return `${pageHead('Parents', '학부모', '')}
  <section class="block block-flush">
    ${previewNote('학부모')}
    <div class="cols">
      <div class="col reveal">
        <p class="label">${esc(s.name)}의 점수 변화</p>
        <p class="muted">${esc(first.name)} ${first.score}점에서 ${esc(last.name)} ${last.score}점이 되었습니다.</p>
        ${scoreChart(s.tests)}
        <p class="label label-gap">선생님 의견</p>
        <p class="letter">${esc(s.comment)}</p>
        <p class="sign">${esc(SITE.teacher)} 드림</p>
      </div>
      <div class="col reveal">
        <p class="label">이번 주</p>
        <ul class="rows">
          <li><span>할 일 완료</span><small>${s.tasks.filter(t => state.done.includes(t.id)).length} / ${s.tasks.length}</small></li>
          <li><span>다시 풀 오답</span><small>${s.wrongNotes.filter(w => w.status !== '완료').reduce((a, w) => a + w.count, 0)}문항</small></li>
        </ul>
        <p class="label label-gap">받은 보고서</p>
        <ul class="rows">${s.reports.map(r => `<li><span>${esc(r.title)}<small class="sub">${fmtDate(r.date)}</small></span><button type="button" class="text-btn" data-locked>열기</button></li>`).join('')}</ul>
        <a class="btn btn-block label-gap" href="#/consult">상담 신청하기</a>
      </div>
    </div>
  </section>`;
}

/* ---------- 상담 ---------- */
function viewConsult() {
  const contacts = [
    SITE.phone && `<li><span class="label">전화</span><a href="tel:${esc(SITE.phone.replace(/[^\d+]/g, ''))}">${esc(SITE.phone)}</a></li>`,
    SITE.kakao && `<li><span class="label">카카오톡</span><a href="${esc(SITE.kakao)}" target="_blank" rel="noopener">채널로 문의하기</a></li>`,
    SITE.hours && `<li><span class="label">상담 시간</span><span>${esc(SITE.hours)}</span></li>`,
    SITE.address && `<li><span class="label">위치</span><span>${esc(SITE.academy ? SITE.academy + ' · ' : '')}${esc(SITE.address)}</span></li>`
  ].filter(Boolean);
  return `${pageHead('Consultation', '상담 신청', '학년과 최근 시험 결과를 남겨주시면, 상담 때 바로 이야기 나눌 수 있도록 미리 살펴보겠습니다.')}
  <section class="block block-flush cols cols-consult">
    <form class="form reveal" id="consultForm" novalidate>
      <div class="field-row">
        <label class="field"><span>학생 이름</span><input name="name" required maxlength="20" autocomplete="off"></label>
        <label class="field"><span>학년</span><select name="grade">${GRADES.map(g => `<option>${g}</option>`).join('')}<option>중3</option></select></label>
      </div>
      <label class="field"><span>보호자 연락처</span><input name="phone" required inputmode="tel" maxlength="20" placeholder="010-0000-0000"></label>
      <label class="field"><span>궁금한 점</span><textarea name="memo" rows="4" maxlength="500" placeholder="최근 내신 점수, 어려워하는 단원, 원하는 상담 시간"></textarea></label>
      <label class="agree"><input type="checkbox" name="agree" required><span>상담을 위해 입력한 정보를 수집·이용하는 데 동의합니다.</span></label>
      <button class="btn" type="submit">상담 신청하기</button>
      <p class="muted">온라인 접수는 연결 작업 중입니다. 지금은 신청 내용이 전송되지 않으니 연락처로 문의해 주세요.</p>
    </form>
    <aside class="reveal">
      <p class="label">연락처</p>
      ${contacts.length ? `<ul class="contact">${contacts.join('')}</ul>` : '<p class="muted">연락처는 곧 안내드리겠습니다.</p>'}
    </aside>
  </section>`;
}

/* ---------- 선생님 관리 ---------- */
function viewAdmin() {
  const tabs = [['courses', '강좌'], ['notices', '공지'], ['students', '학생 자료']];
  let body = '';
  if (state.adminTab === 'courses') {
    body = `<div class="admin-bar"><p class="label">강좌 — ${state.courses.length}</p><button class="btn btn-sm" type="button" data-edit-course="">새 강좌</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>강좌명</th><th>학년</th><th>과목</th><th>차시</th><th>영상</th><th><span class="sr">관리</span></th></tr></thead><tbody>
      ${state.courses.map(c => `<tr><td><a href="#/course/${esc(c.id)}">${esc(c.title)}</a></td><td>${esc(c.grade)}</td><td>${esc(c.subject)}</td><td>${c.lessons.length}</td><td>${c.lessons.filter(l => youtubeId(l.video)).length}</td>
        <td class="row-actions"><button type="button" class="text-btn" data-edit-course="${esc(c.id)}">수정</button><button type="button" class="text-btn text-btn-danger" data-del-course="${esc(c.id)}">삭제</button></td></tr>`).join('')}
    </tbody></table></div>`;
  } else if (state.adminTab === 'notices') {
    body = `<div class="admin-bar"><p class="label">공지 — ${state.notices.length}</p><button class="btn btn-sm" type="button" data-edit-notice="">새 공지</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>날짜</th><th>제목</th><th><span class="sr">관리</span></th></tr></thead><tbody>
      ${state.notices.map(n => `<tr><td class="nowrap">${fmtDate(n.date)}</td><td>${esc(n.title)}</td>
        <td class="row-actions"><button type="button" class="text-btn" data-edit-notice="${esc(n.id)}">수정</button><button type="button" class="text-btn text-btn-danger" data-del-notice="${esc(n.id)}">삭제</button></td></tr>`).join('')}
    </tbody></table></div>`;
  } else {
    body = `<div class="todo">
      <p class="label">로그인을 연결하면 열리는 기능</p>
      <ol class="plain-num">
        <li>학생·학부모 계정 만들기 (선생님이 초대한 사람만 가입)</li>
        <li>학생별 성적표·오답노트 올리기 — 본인과 보호자만 열람</li>
        <li>시험 점수 입력 → 학생·학부모 화면 그래프에 자동 반영</li>
        <li>상담 신청 접수함</li>
      </ol>
      <p class="muted">학생 개인 정보는 공개되는 사이트 코드가 아니라, 접근 권한이 걸린 데이터베이스에 따로 보관합니다.</p>
    </div>`;
  }
  return `${pageHead('Admin', '선생님 관리', '')}
  <section class="block block-flush">
    <p class="note">아직 잠겨 있지 않은 화면입니다. 여기서 바꾼 내용은 이 브라우저에만 저장되고 다른 사람 화면에는 보이지 않습니다. 실제 운영은 로그인을 연결한 뒤에 합니다.</p>
    <div class="filters tabs" role="tablist">${tabs.map(([k, t]) => `<button type="button" role="tab" class="filter ${state.adminTab === k ? 'on' : ''}" aria-selected="${state.adminTab === k}" data-tab="${k}">${t}</button>`).join('')}</div>
    ${body}
    <div class="admin-foot"><button class="text-btn" type="button" id="resetAll">예시 데이터로 되돌리기</button></div>
  </section>`;
}

function viewNotFound(msg = '페이지를 찾을 수 없습니다') {
  return `${pageHead('404', msg, '')}<section class="block block-flush"><a class="text-link" href="#/">홈으로</a></section>`;
}

/* ---------- 편집 창 ---------- */
function openModal(html, onSubmit) {
  closeModal();
  const wrap = document.createElement('div');
  wrap.className = 'modal-bg';
  wrap.id = 'modal';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(wrap);
  document.body.classList.add('no-scroll');
  markKoreanLabels(wrap);
  const form = wrap.querySelector('form');
  form.addEventListener('submit', e => { e.preventDefault(); if (onSubmit(form) !== false) closeModal(); });
  wrap.querySelector('input, textarea, select')?.focus();
}
function closeModal() { document.getElementById('modal')?.remove(); document.body.classList.remove('no-scroll'); }

const lessonRow = (l = { title: '', video: '' }) => `<div class="lesson-edit"><input name="lt" placeholder="차시 제목" maxlength="60" value="${esc(l.title)}"><input name="lv" placeholder="유튜브 주소 (선택)" value="${esc(l.video)}"><button type="button" class="icon-btn" data-del-lesson aria-label="이 차시 삭제">×</button></div>`;

function editCourse(id) {
  const c = id ? findCourse(id) : { grade: '고2', subject: '', title: '', desc: '', lessons: [{ title: '', video: '' }] };
  openModal(`<form class="form">
    <p class="label">${id ? '강좌 수정' : '새 강좌'}</p>
    <div class="field-row">
      <label class="field"><span>학년</span><select name="grade">${GRADES.map(g => `<option ${g === c.grade ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
      <label class="field"><span>과목</span><input name="subject" required maxlength="20" value="${esc(c.subject)}" placeholder="예: 대수"></label>
    </div>
    <label class="field"><span>강좌명</span><input name="title" required maxlength="40" value="${esc(c.title)}"></label>
    <label class="field"><span>소개</span><textarea name="desc" rows="2" maxlength="120">${esc(c.desc)}</textarea></label>
    <div class="field"><span>차시</span><div id="lessonRows">${c.lessons.map(lessonRow).join('')}</div><button type="button" class="text-btn" id="addLesson">+ 차시 추가</button></div>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>취소</button><button type="submit" class="btn">저장</button></div>
  </form>`, form => {
    const f = new FormData(form);
    const titles = f.getAll('lt'), videos = f.getAll('lv');
    const lessons = titles.map((t, i) => ({ title: String(t).trim(), video: String(videos[i]).trim() })).filter(l => l.title);
    const bad = lessons.find(l => l.video && !youtubeId(l.video));
    if (bad) { toast(`"${bad.title}"의 유튜브 주소를 확인해 주세요.`); return false; }
    const data = { grade: f.get('grade'), subject: String(f.get('subject')).trim(), title: String(f.get('title')).trim(), desc: String(f.get('desc')).trim(), lessons };
    if (!data.title || !data.subject) { toast('강좌명과 과목을 입력해 주세요.'); return false; }
    state.courses = id ? state.courses.map(x => x.id === id ? { ...x, ...data } : x) : [...state.courses, { id: Store.newId('c'), ...data }];
    Store.saveCourses(state.courses);
    render(true);
    toast(id ? '강좌를 수정했습니다.' : '새 강좌를 추가했습니다.');
  });
}

function editNotice(id) {
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const n = id ? state.notices.find(x => x.id === id) : { date: today, title: '', body: '' };
  openModal(`<form class="form">
    <p class="label">${id ? '공지 수정' : '새 공지'}</p>
    <label class="field"><span>날짜</span><input type="date" name="date" required value="${esc(n.date)}"></label>
    <label class="field"><span>제목</span><input name="title" required maxlength="60" value="${esc(n.title)}"></label>
    <label class="field"><span>내용</span><textarea name="body" rows="6" maxlength="2000">${esc(n.body)}</textarea></label>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>취소</button><button type="submit" class="btn">저장</button></div>
  </form>`, form => {
    const f = new FormData(form);
    const data = { date: String(f.get('date')), title: String(f.get('title')).trim(), body: String(f.get('body')).trim() };
    if (!data.title || !data.date) { toast('날짜와 제목을 입력해 주세요.'); return false; }
    const list = id ? state.notices.map(x => x.id === id ? { ...x, ...data } : x) : [...state.notices, { id: Store.newId('n'), ...data }];
    Store.saveNotices(list);
    state.notices = Store.getNotices();
    render(true);
    toast('공지를 저장했습니다.');
  });
}

/* ---------- 움직임: 스크롤하면 천천히 나타나기 ---------- */
const io = 'IntersectionObserver' in window && !reduceMotion
  ? new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  : null;
function watchReveals(root = app) {
  root.querySelectorAll('.reveal:not(.in), .item-media, .split-media, .sheet, .player-empty').forEach(el => io ? io.observe(el) : el.classList.add('in'));
}

/* 한글 이름표는 자간을 좁게 */
function markKoreanLabels(root = document) {
  root.querySelectorAll('.label').forEach(el => el.classList.toggle('kr', /[가-힣]/.test(el.textContent)));
}

/* ---------- 그리기 ---------- */
function render(keepScroll = false) {
  const y = window.scrollY;
  const r = route();
  const views = {
    home: () => viewHome(),
    system: () => viewSystem(),
    courses: () => viewCourses(r.a),
    course: () => viewClassroom(r.a, r.b),
    notice: () => viewNotice(r.a),
    student: () => viewStudent(),
    parent: () => viewParent(),
    consult: () => viewConsult(),
    admin: () => viewAdmin()
  };
  app.innerHTML = (views[r.page] || (() => viewNotFound()))();
  document.body.dataset.page = r.page;
  if (keepScroll) app.querySelectorAll('.reveal, .item-media, .split-media, .sheet, .player-empty').forEach(el => el.classList.add('in'));
  else { app.classList.remove('enter'); void app.offsetWidth; app.classList.add('enter'); }
  watchReveals();
  markKoreanLabels();
  const navKey = r.page === 'course' ? 'courses' : r.page;
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === navKey));
  setMenu(false);
  if (keepScroll) window.scrollTo(0, y);
  else if (r.page === 'notice' && r.a) document.getElementById(`notice-${r.a}`)?.scrollIntoView({ block: 'center' });
  else window.scrollTo(0, 0);
  onScroll();
}

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  const btn = document.getElementById('menuBtn');
  btn.setAttribute('aria-expanded', String(open));
  btn.textContent = open ? '닫기' : '메뉴';
}

/* 첫 화면 위에서는 머리말을 투명하게 */
function onScroll() {
  document.getElementById('topbar').classList.toggle('solid', window.scrollY > 10 || document.body.dataset.page !== 'home');
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- 이벤트 ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const hit = sel => t.closest(sel);
  if (hit('#menuBtn')) { setMenu(!document.body.classList.contains('menu-open')); return; }
  if (hit('[data-filter]') && !hit('[data-tab]')) {
    state.filter = hit('[data-filter]').dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => { const on = b.dataset.filter === state.filter; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    const box = document.getElementById('courseResults');
    box.innerHTML = courseGrid();
    watchReveals(box);
    markKoreanLabels(box);
    return;
  }
  if (hit('[data-locked]')) { toast('로그인 기능을 연결하면 본인과 보호자만 열어볼 수 있습니다.'); return; }
  if (hit('[data-tab]')) { state.adminTab = hit('[data-tab]').dataset.tab; render(true); return; }
  if (hit('[data-edit-course]')) { editCourse(hit('[data-edit-course]').dataset.editCourse); return; }
  if (hit('[data-del-course]')) {
    const c = findCourse(hit('[data-del-course]').dataset.delCourse);
    if (c && confirm(`"${c.title}" 강좌를 삭제할까요?`)) { state.courses = state.courses.filter(x => x.id !== c.id); Store.saveCourses(state.courses); render(true); toast('강좌를 삭제했습니다.'); }
    return;
  }
  if (hit('[data-edit-notice]')) { editNotice(hit('[data-edit-notice]').dataset.editNotice); return; }
  if (hit('[data-del-notice]')) {
    const n = state.notices.find(x => x.id === hit('[data-del-notice]').dataset.delNotice);
    if (n && confirm(`"${n.title}" 공지를 삭제할까요?`)) { state.notices = state.notices.filter(x => x.id !== n.id); Store.saveNotices(state.notices); render(true); toast('공지를 삭제했습니다.'); }
    return;
  }
  if (hit('#addLesson')) { document.getElementById('lessonRows').insertAdjacentHTML('beforeend', lessonRow()); document.querySelector('#lessonRows .lesson-edit:last-child input').focus(); return; }
  if (hit('[data-del-lesson]')) { hit('.lesson-edit').remove(); return; }
  if (hit('[data-close]') || t.id === 'modal') { closeModal(); return; }
  if (hit('#resetAll')) {
    if (confirm('강좌와 공지를 처음 예시 상태로 되돌릴까요? 이 브라우저에서 바꾼 내용이 모두 사라집니다.')) {
      Store.resetAll();
      Object.assign(state, { courses: Store.getCourses(), notices: Store.getNotices(), done: Store.getDoneTasks() });
      render(true);
      toast('예시 데이터로 되돌렸습니다.');
    }
  }
});

document.addEventListener('change', e => {
  if (e.target.matches('[data-task]')) {
    const id = e.target.dataset.task;
    state.done = e.target.checked ? [...new Set([...state.done, id])] : state.done.filter(x => x !== id);
    Store.saveDoneTasks(state.done);
    render(true);
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'courseSearch') {
    state.search = e.target.value;
    const box = document.getElementById('courseResults');
    box.innerHTML = courseGrid();
    box.querySelectorAll('.reveal, .item-media').forEach(el => el.classList.add('in'));
    markKoreanLabels(box);
  }
});

document.addEventListener('submit', e => {
  if (e.target.id !== 'consultForm') return;
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  toast('온라인 접수는 아직 연결 전입니다. 연락처로 문의해 주세요.');
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); setMenu(false); } });
window.addEventListener('hashchange', () => render());

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('footerInfo').textContent = [SITE.academy, SITE.address, SITE.phone].filter(Boolean).join(' · ') || SITE.slogan;
render();
