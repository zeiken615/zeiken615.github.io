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

/* ---------- 공통 도구 ---------- */
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const gradeKey = g => ({ '고1': 'g1', '고2': 'g2', '고3': 'g3' }[g] || 'g2');
const fmtDate = d => { const [y, m, day] = String(d).split('-'); return y && m && day ? `${y}. ${Number(m)}. ${Number(day)}.` : esc(d); };
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

function pageHead(kicker, title, desc, extra = '') {
  return `<section class="page-head"><div class="wrap"><p class="kicker">${kicker}</p><h1>${title}</h1>${desc ? `<p class="page-desc">${desc}</p>` : ''}${extra}</div></section>`;
}

const previewBanner = who => `<div class="preview-banner" role="note"><b>미리보기</b><span>로그인 기능을 연결하기 전이라, 가상의 ${who} 화면을 보여드립니다. 실제 학생 정보가 아닙니다.</span></div>`;

/* 좌표평면 위에 점수 변화를 그리는 그래프 */
function scoreChart(tests, { w = 520, h = 300, compact = false } = {}) {
  const padL = 40, padR = 36, padT = 24, padB = 40;
  const iw = w - padL - padR, ih = h - padT - padB;
  const min = 50, max = 100;
  const x = i => padL + (tests.length === 1 ? iw / 2 : (iw * i) / (tests.length - 1));
  const y = v => padT + ih - ((v - min) / (max - min)) * ih;
  let grid = '';
  for (let v = min; v <= max; v += 10) {
    grid += `<line x1="${padL}" x2="${w - padR}" y1="${y(v)}" y2="${y(v)}" class="ch-grid"/>`;
    grid += `<text x="${padL - 10}" y="${y(v) + 4}" class="ch-axis" text-anchor="end">${v}</text>`;
  }
  tests.forEach((t, i) => { grid += `<line x1="${x(i)}" x2="${x(i)}" y1="${padT}" y2="${padT + ih}" class="ch-grid ch-grid-v"/>`; });
  const pts = tests.map((t, i) => `${x(i)},${y(t.score)}`).join(' ');
  const area = `M${x(0)},${padT + ih} L${pts.replace(/ /g, ' L')} L${x(tests.length - 1)},${padT + ih} Z`;
  const last = tests.length - 1;
  const labels = tests.map((t, i) => `<text x="${x(i)}" y="${h - 14}" class="ch-axis" text-anchor="middle">${esc(t.name)}</text>`).join('');
  const dots = tests.map((t, i) => `<circle cx="${x(i)}" cy="${y(t.score)}" r="${i === last ? 6 : 4}" class="${i === last ? 'ch-dot ch-dot-last' : 'ch-dot'}"><title>${esc(t.name)} ${t.score}점</title></circle>`).join('');
  const tag = `<g class="ch-tag" transform="translate(${x(last)},${y(tests[last].score)})"><rect x="-46" y="-42" width="54" height="26" rx="6"/><text x="-19" y="-24" text-anchor="middle">${tests[last].score}점</text></g>`;
  return `<svg class="chart${compact ? ' chart-compact' : ''}" viewBox="0 0 ${w} ${h}" role="img" aria-label="시험 점수 변화 그래프: ${tests.map(t => `${esc(t.name)} ${t.score}점`).join(', ')}">${grid}<path d="${area}" class="ch-area"/><polyline points="${pts}" class="ch-line"/>${dots}${tag}${labels}</svg>`;
}

/* ---------- 홈 ---------- */
function viewHome() {
  const counts = GRADES.map(g => state.courses.filter(c => c.grade === g).length);
  const notices = state.notices.slice(0, 3);
  const gradeInfo = [
    ['고1', '공통수학1 · 2', '개념의 뼈대를 세우는 해', '교과서 개념을 그림으로 이해하고, 내신 기본 유형을 빠짐없이 정리합니다.'],
    ['고2', '대수 · 미적분Ⅰ', '내신 점수가 갈리는 해', '학교별 기출을 분석하고, 변형 문제와 오답노트로 같은 실수를 끊어냅니다.'],
    ['고3', '수능 대비', '실전을 완성하는 해', '시간 배분과 풀이 순서를 점검하고, 고난도 문항의 구조를 연습합니다.']
  ];
  return `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="kicker">고등 수학 · ${esc(SITE.teacher)} 선생님</p>
        <h1 class="display">틀린 문제에는<br><mark>이유</mark>가 있습니다.</h1>
        <p class="lead">${esc(SITE.slogan)}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/consult">상담 신청하기</a>
          <a class="btn btn-ghost" href="#/system">성적 관리 방식 보기 →</a>
        </div>
      </div>
      <figure class="hero-card">
        <figcaption><span class="dot"></span>한 학생의 점수 변화 <small>예시</small></figcaption>
        ${scoreChart(DEMO_STUDENT.tests)}
        <div class="hero-card-foot"><span>시험 분석 → 변형 문제 → 오답노트</span><b>+${DEMO_STUDENT.tests.at(-1).score - DEMO_STUDENT.tests[0].score}점</b></div>
      </figure>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="sec-head"><p class="kicker">HOW WE TEACH</p><h2>수업 하나가 끝나도,<br>관리는 계속됩니다.</h2></div>
      <ol class="cycle">
        <li><span class="cycle-no">01</span><h3>시험 분석</h3><p>학교 시험과 테스트를 문항별로 나눠 보고, 어디서 점수가 빠졌는지 찾습니다.</p></li>
        <li><span class="cycle-no">02</span><h3>변형 문제</h3><p>틀린 문제와 같은 원리를 숫자와 조건만 바꿔 다시 풀게 합니다.</p></li>
        <li><span class="cycle-no">03</span><h3>오답노트</h3><p>학생마다 다른 오답을 모아, 다시 풀 때까지 따라갑니다.</p></li>
        <li><span class="cycle-no">04</span><h3>성적 보고서</h3><p>무엇이 좋아졌고 무엇이 남았는지, 학부모님께 쉬운 말로 알려드립니다.</p></li>
      </ol>
    </div>
  </section>

  <section class="section section-tint">
    <div class="wrap">
      <div class="sec-head sec-head-row"><div><p class="kicker">PROGRAM</p><h2>학년마다 목표가 다릅니다.</h2></div><a class="link-more" href="#/courses">전체 강좌 보기 →</a></div>
      <div class="grade-grid">
        ${gradeInfo.map(([g, subj, t, d], i) => `
        <a class="grade-card ${gradeKey(g)}" href="#/courses/${encodeURIComponent(g)}">
          <div class="grade-top"><span class="grade-badge">${g}</span><span class="grade-subj">${subj}</span></div>
          <h3>${t}</h3><p>${d}</p>
          <span class="grade-count">강좌 ${counts[i]}개 →</span>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap teacher">
      <div class="teacher-visual" aria-hidden="true">
        <svg viewBox="0 0 240 240"><defs><pattern id="gridp" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="tv-grid"/></pattern></defs><rect width="240" height="240" fill="url(#gridp)"/><path d="M20 200 Q 80 200 110 140 T 220 40" class="tv-curve"/><circle cx="110" cy="140" r="6" class="tv-dot"/><text x="120" y="160" class="tv-label">그림으로 먼저</text></svg>
      </div>
      <div>
        <p class="kicker">TEACHER</p>
        <h2>${esc(SITE.teacher)} 선생님</h2>
        <p class="lead">식을 외우기 전에 그림으로 먼저 봅니다.<br>그래프와 도형으로 이해한 개념은 문제가 바뀌어도 흔들리지 않습니다.</p>
        <ul class="checks">
          <li>문항별 시험 분석과 학생별 오답 관리</li>
          <li>기출을 바꿔 만든 변형 문제로 실전 연습</li>
          <li>학부모님께 드리는 쉬운 말 성적 보고서</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section section-tint">
    <div class="wrap">
      <div class="sec-head sec-head-row"><div><p class="kicker">NOTICE</p><h2>공지사항</h2></div><a class="link-more" href="#/notice">전체 보기 →</a></div>
      <ul class="notice-mini">
        ${notices.length ? notices.map(n => `<li><a href="#/notice/${esc(n.id)}"><time>${fmtDate(n.date)}</time><span>${esc(n.title)}</span></a></li>`).join('') : '<li class="empty">등록된 공지가 없습니다.</li>'}
      </ul>
    </div>
  </section>

  <section class="cta">
    <div class="wrap cta-inner">
      <div><h2>지금 성적에서 무엇이 막혀 있는지,<br>함께 찾아보겠습니다.</h2><p>학년과 최근 시험 결과를 알려주시면 상담 때 바로 이야기 나눌 수 있습니다.</p></div>
      <a class="btn btn-light" href="#/consult">상담 신청하기</a>
    </div>
  </section>`;
}

/* ---------- 성적 관리 소개 ---------- */
function viewSystem() {
  const s = DEMO_STUDENT;
  return `${pageHead('SYSTEM', '성적 관리는 이렇게 합니다', '시험이 끝나면 점수만 알려드리지 않습니다. 왜 틀렸는지 찾고, 다시 풀게 하고, 그 과정을 보고서로 남깁니다.')}
  <section class="section">
    <div class="wrap">
      <div class="flow">
        <div class="flow-step"><span class="cycle-no">01</span><h3>문항별 시험 분석</h3><p>문항마다 정답률과 난이도를 나누어, 반 전체가 어려워한 문제와 학생 혼자 틀린 문제를 구분합니다.</p></div>
        <div class="flow-arrow" aria-hidden="true">→</div>
        <div class="flow-step"><span class="cycle-no">02</span><h3>변형 문제 제작</h3><p>틀린 문제의 원리는 그대로 두고 숫자와 조건을 바꿔, 진짜 이해했는지 확인합니다.</p></div>
        <div class="flow-arrow" aria-hidden="true">→</div>
        <div class="flow-step"><span class="cycle-no">03</span><h3>개인 오답노트</h3><p>학생마다 틀린 문항이 다르기 때문에, 오답노트도 한 명씩 따로 만듭니다.</p></div>
        <div class="flow-arrow" aria-hidden="true">→</div>
        <div class="flow-step"><span class="cycle-no">04</span><h3>성적 보고서</h3><p>점수 변화와 앞으로의 계획을 쉬운 말로 정리해 학부모님께 보내드립니다.</p></div>
      </div>
    </div>
  </section>
  <section class="section section-tint">
    <div class="wrap report-demo">
      <div>
        <p class="kicker">REPORT PREVIEW</p>
        <h2>보고서에는 이런 내용이 담깁니다</h2>
        <ul class="checks">
          <li>시험별 점수 변화를 한눈에 보는 그래프</li>
          <li>단원별로 자주 틀린 부분과 다시 푼 결과</li>
          <li>선생님이 직접 쓴 학습 의견과 다음 목표</li>
        </ul>
        <p class="muted">오른쪽은 가상의 학생으로 만든 예시입니다.</p>
      </div>
      <article class="paper">
        <header class="paper-head"><span>성적 보고서 · 예시</span><b>${esc(s.name)} · ${esc(s.grade)}</b></header>
        ${scoreChart(s.tests, { compact: true })}
        <table class="mini-table"><thead><tr><th>단원</th><th>틀린 문항</th><th>상태</th></tr></thead><tbody>
          ${s.wrongNotes.map(w => `<tr><td>${esc(w.unit)}</td><td>${w.count}문항</td><td><span class="pill ${w.status === '완료' ? 'pill-ok' : ''}">${esc(w.status)}</span></td></tr>`).join('')}
        </tbody></table>
        <blockquote>${esc(s.comment)}</blockquote>
      </article>
    </div>
  </section>`;
}

/* ---------- 강좌 목록 ---------- */
function courseCard(c) {
  const withVideo = c.lessons.filter(l => youtubeId(l.video)).length;
  return `<article class="course-card ${gradeKey(c.grade)}">
    <a href="#/course/${esc(c.id)}" class="course-link">
      <div class="course-top"><span class="grade-badge">${esc(c.grade)}</span><span class="course-subj">${esc(c.subject)}</span></div>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.desc)}</p>
      <div class="course-foot"><span>${c.lessons.length}개 차시${withVideo ? ` · 영상 ${withVideo}개` : ''}</span><span class="go">강의실 →</span></div>
    </a>
  </article>`;
}

function courseGrid() {
  const q = state.search.trim().toLowerCase();
  const list = state.courses.filter(c =>
    (state.filter === '전체' || c.grade === state.filter) &&
    (!q || `${c.title} ${c.subject} ${c.desc} ${c.lessons.map(l => l.title).join(' ')}`.toLowerCase().includes(q)));
  return `<p class="count-note">강좌 ${list.length}개</p>
    <div class="course-grid">${list.length ? list.map(courseCard).join('') : '<p class="empty">조건에 맞는 강좌가 없습니다. 다른 학년을 고르거나 검색어를 바꿔 보세요.</p>'}</div>`;
}

function viewCourses(grade) {
  if (grade && ['전체', ...GRADES].includes(decodeURIComponent(grade))) state.filter = decodeURIComponent(grade);
  return `${pageHead('COURSES', '강좌', '학년과 과목별로 강좌를 찾아보세요. 각 강좌의 강의실에서 차시별 복습 영상을 볼 수 있습니다.')}
  <section class="section section-tight">
    <div class="wrap">
      <div class="toolbar">
        <div class="chips" role="group" aria-label="학년 선택">
          ${['전체', ...GRADES].map(g => `<button type="button" class="chip ${state.filter === g ? 'on' : ''}" data-filter="${g}" aria-pressed="${state.filter === g}">${g}</button>`).join('')}
        </div>
        <label class="search"><span class="sr">강좌 검색</span><input id="courseSearch" type="search" placeholder="강좌명, 단원으로 검색" value="${esc(state.search)}"></label>
      </div>
      <div id="courseResults">${courseGrid()}</div>
    </div>
  </section>`;
}

/* ---------- 강의실 ---------- */
function viewClassroom(id, lessonNo) {
  const c = findCourse(id);
  if (!c) return viewNotFound('강좌를 찾을 수 없습니다.');
  const idx = Math.min(Math.max((Number(lessonNo) || 1) - 1, 0), Math.max(c.lessons.length - 1, 0));
  const lesson = c.lessons[idx];
  const vid = lesson ? youtubeId(lesson.video) : '';
  const player = vid
    ? `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${vid}" title="${esc(lesson.title)}" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
    : `<div class="player player-empty"><div><span class="play-icon" aria-hidden="true">▶</span><p>이 차시 영상은 준비 중입니다.</p><small>관리 화면에서 유튜브 주소를 넣으면 이곳에서 바로 재생됩니다.</small></div></div>`;
  return `<section class="page-head page-head-sm ${gradeKey(c.grade)}"><div class="wrap">
      <a class="back" href="#/courses">← 강좌 목록</a>
      <div class="course-top"><span class="grade-badge">${esc(c.grade)}</span><span class="course-subj">${esc(c.subject)}</span></div>
      <h1>${esc(c.title)}</h1><p class="page-desc">${esc(c.desc)}</p>
    </div></section>
  <section class="section section-tight">
    <div class="wrap classroom">
      <div>
        ${lesson ? `${player}
        <div class="lesson-now"><span class="lesson-no">${pad(idx + 1)}</span><h2>${esc(lesson.title)}</h2></div>
        <div class="lesson-nav">
          ${idx > 0 ? `<a class="btn btn-ghost btn-sm" href="#/course/${esc(c.id)}/${idx}">← 이전 차시</a>` : '<span></span>'}
          ${idx < c.lessons.length - 1 ? `<a class="btn btn-primary btn-sm" href="#/course/${esc(c.id)}/${idx + 2}">다음 차시 →</a>` : ''}
        </div>` : '<p class="empty">아직 등록된 차시가 없습니다.</p>'}
      </div>
      <aside class="panel">
        <h3 class="panel-title">차시 목록 <small>${c.lessons.length}개</small></h3>
        <ol class="lesson-list">
          ${c.lessons.map((l, i) => `<li><a href="#/course/${esc(c.id)}/${i + 1}" class="${i === idx ? 'on' : ''}" ${i === idx ? 'aria-current="true"' : ''}><span class="lesson-no">${pad(i + 1)}</span><span>${esc(l.title)}</span>${youtubeId(l.video) ? '<i class="has-video" title="영상 있음">▶</i>' : ''}</a></li>`).join('')}
        </ol>
      </aside>
    </div>
  </section>`;
}

/* ---------- 공지 ---------- */
function viewNotice(openId) {
  return `${pageHead('NOTICE', '공지사항', '')}
  <section class="section section-tight"><div class="wrap narrow">
    ${state.notices.length ? `<div class="notice-list">${state.notices.map(n => `
      <details class="notice" ${n.id === openId ? 'open' : ''} id="notice-${esc(n.id)}">
        <summary><time>${fmtDate(n.date)}</time><span>${esc(n.title)}</span></summary>
        <div class="notice-body">${esc(n.body).replace(/\n/g, '<br>')}</div>
      </details>`).join('')}</div>` : '<p class="empty">등록된 공지가 없습니다.</p>'}
  </div></section>`;
}

/* ---------- 학생 ---------- */
function viewStudent() {
  const s = DEMO_STUDENT;
  const done = s.tasks.filter(t => state.done.includes(t.id)).length;
  const last = s.tests.at(-1), prev = s.tests.at(-2);
  return `${pageHead('STUDENT', '학생 학습관', '오늘 할 일, 듣고 있는 강좌, 시험 결과와 오답노트를 한곳에서 확인합니다.')}
  <section class="section section-tight"><div class="wrap">
    ${previewBanner('학생')}
    <div class="stats">
      <div class="stat"><small>오늘 할 일</small><strong>${done}<span> / ${s.tasks.length}</span></strong></div>
      <div class="stat"><small>최근 시험 (${esc(last.name)})</small><strong>${last.score}<span>점</span></strong><em class="${last.score >= prev.score ? 'up' : 'down'}">지난번보다 ${last.score >= prev.score ? '+' : ''}${last.score - prev.score}점</em></div>
      <div class="stat"><small>다시 풀 오답</small><strong>${s.wrongNotes.filter(w => w.status !== '완료').reduce((a, w) => a + w.count, 0)}<span>문항</span></strong></div>
    </div>
    <div class="dash">
      <div class="dash-main">
        <div class="panel">
          <h3 class="panel-title">오늘 할 일</h3>
          ${s.tasks.map(t => `<label class="task ${state.done.includes(t.id) ? 'done' : ''}"><input type="checkbox" data-task="${t.id}" ${state.done.includes(t.id) ? 'checked' : ''}><span>${esc(t.text)}</span><small>${esc(t.due)}</small></label>`).join('')}
        </div>
        <div class="panel">
          <h3 class="panel-title">시험 점수 변화</h3>
          ${scoreChart(s.tests, { compact: true })}
        </div>
      </div>
      <div class="dash-side">
        <div class="panel">
          <h3 class="panel-title">이어서 듣기</h3>
          ${s.courses.map(sc => { const c = findCourse(sc.id); if (!c) return ''; const pct = Math.round(sc.done / c.lessons.length * 100); return `<a class="progress-item" href="#/course/${esc(c.id)}/${Math.min(sc.done + 1, c.lessons.length)}"><div><b>${esc(c.title)}</b><span>${sc.done} / ${c.lessons.length}차시</span></div><div class="bar"><i style="width:${pct}%"></i></div></a>`; }).join('')}
        </div>
        <div class="panel">
          <h3 class="panel-title">내 오답노트</h3>
          <ul class="rows">${s.wrongNotes.map(w => `<li><span>${esc(w.unit)}</span><span class="pill ${w.status === '완료' ? 'pill-ok' : ''}">${w.count}문항 · ${esc(w.status)}</span></li>`).join('')}</ul>
        </div>
        <div class="panel">
          <h3 class="panel-title">성적표</h3>
          <ul class="rows">${s.reports.map(r => `<li><span>${esc(r.title)}<small>${fmtDate(r.date)}</small></span><button type="button" class="btn btn-ghost btn-sm" data-locked>열기</button></li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </div></section>`;
}

/* ---------- 학부모 ---------- */
function viewParent() {
  const s = DEMO_STUDENT;
  const first = s.tests[0], last = s.tests.at(-1);
  return `${pageHead('PARENTS', '학부모 페이지', '자녀의 시험 결과와 학습 상황, 선생님 의견을 확인하실 수 있습니다.')}
  <section class="section section-tight"><div class="wrap">
    ${previewBanner('학부모')}
    <div class="dash">
      <div class="dash-main">
        <div class="panel">
          <h3 class="panel-title">${esc(s.name)}의 점수 변화</h3>
          <p class="muted">${esc(first.name)} ${first.score}점에서 ${esc(last.name)} ${last.score}점이 되었습니다.</p>
          ${scoreChart(s.tests, { compact: true })}
        </div>
        <div class="panel letter">
          <h3 class="panel-title">선생님 의견</h3>
          <p>${esc(s.comment)}</p>
          <p class="sign">— ${esc(SITE.teacher)} 드림</p>
        </div>
      </div>
      <div class="dash-side">
        <div class="panel">
          <h3 class="panel-title">이번 주 학습</h3>
          <ul class="rows">
            <li><span>할 일 완료</span><b>${s.tasks.filter(t => state.done.includes(t.id)).length} / ${s.tasks.length}</b></li>
            <li><span>다시 풀 오답</span><b>${s.wrongNotes.filter(w => w.status !== '완료').reduce((a, w) => a + w.count, 0)}문항</b></li>
          </ul>
        </div>
        <div class="panel">
          <h3 class="panel-title">받은 보고서</h3>
          <ul class="rows">${s.reports.map(r => `<li><span>${esc(r.title)}<small>${fmtDate(r.date)}</small></span><button type="button" class="btn btn-ghost btn-sm" data-locked>열기</button></li>`).join('')}</ul>
        </div>
        <a class="panel panel-link" href="#/consult"><b>상담이 필요하신가요?</b><span>상담 신청하기 →</span></a>
      </div>
    </div>
  </div></section>`;
}

/* ---------- 상담 신청 ---------- */
function viewConsult() {
  const contacts = [
    SITE.phone && `<li><small>전화</small><a href="tel:${esc(SITE.phone.replace(/[^\d+]/g, ''))}">${esc(SITE.phone)}</a></li>`,
    SITE.kakao && `<li><small>카카오톡</small><a href="${esc(SITE.kakao)}" target="_blank" rel="noopener">채널로 문의하기</a></li>`,
    SITE.hours && `<li><small>상담 시간</small><span>${esc(SITE.hours)}</span></li>`,
    SITE.address && `<li><small>위치</small><span>${esc(SITE.academy ? SITE.academy + ' · ' : '')}${esc(SITE.address)}</span></li>`
  ].filter(Boolean);
  return `${pageHead('CONSULT', '상담 신청', '학년과 최근 시험 결과를 남겨주시면, 상담 때 바로 이야기 나눌 수 있도록 미리 살펴보겠습니다.')}
  <section class="section section-tight"><div class="wrap consult">
    <form class="panel form" id="consultForm" novalidate>
      <div class="field-row">
        <label class="field"><span>학생 이름</span><input name="name" required maxlength="20" autocomplete="off"></label>
        <label class="field"><span>학년</span><select name="grade">${GRADES.map(g => `<option>${g}</option>`).join('')}<option>중3</option></select></label>
      </div>
      <label class="field"><span>보호자 연락처</span><input name="phone" required inputmode="tel" maxlength="20" placeholder="010-0000-0000"></label>
      <label class="field"><span>궁금한 점</span><textarea name="memo" rows="4" maxlength="500" placeholder="예: 최근 내신 점수, 어려워하는 단원, 원하는 상담 시간"></textarea></label>
      <label class="agree"><input type="checkbox" name="agree" required><span>상담을 위해 입력한 정보를 수집·이용하는 데 동의합니다.</span></label>
      <button class="btn btn-primary" type="submit">상담 신청하기</button>
      <p class="muted form-note">온라인 접수는 연결 작업 중입니다. 지금은 신청 내용이 전송되지 않으니, 옆의 연락처로 문의해 주세요.</p>
    </form>
    <aside class="panel">
      <h3 class="panel-title">연락처</h3>
      ${contacts.length ? `<ul class="contact">${contacts.join('')}</ul>` : '<p class="muted">연락처는 곧 안내드리겠습니다.</p>'}
    </aside>
  </div></section>`;
}

/* ---------- 선생님 관리 ---------- */
function viewAdmin() {
  const tabs = [['courses', '강좌'], ['notices', '공지'], ['students', '학생 자료']];
  let body = '';
  if (state.adminTab === 'courses') {
    body = `<div class="admin-bar"><h2>강좌 ${state.courses.length}개</h2><button class="btn btn-primary btn-sm" type="button" data-edit-course="">+ 새 강좌</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>강좌명</th><th>학년</th><th>과목</th><th>차시</th><th>영상</th><th><span class="sr">관리</span></th></tr></thead><tbody>
      ${state.courses.map(c => `<tr><td><a href="#/course/${esc(c.id)}">${esc(c.title)}</a></td><td>${esc(c.grade)}</td><td>${esc(c.subject)}</td><td>${c.lessons.length}</td><td>${c.lessons.filter(l => youtubeId(l.video)).length}</td>
        <td class="row-actions"><button type="button" class="btn btn-ghost btn-sm" data-edit-course="${esc(c.id)}">수정</button><button type="button" class="btn btn-danger btn-sm" data-del-course="${esc(c.id)}">삭제</button></td></tr>`).join('')}
    </tbody></table></div>`;
  } else if (state.adminTab === 'notices') {
    body = `<div class="admin-bar"><h2>공지 ${state.notices.length}개</h2><button class="btn btn-primary btn-sm" type="button" data-edit-notice="">+ 새 공지</button></div>
    <div class="table-wrap"><table class="table"><thead><tr><th>날짜</th><th>제목</th><th><span class="sr">관리</span></th></tr></thead><tbody>
      ${state.notices.map(n => `<tr><td class="nowrap">${fmtDate(n.date)}</td><td>${esc(n.title)}</td>
        <td class="row-actions"><button type="button" class="btn btn-ghost btn-sm" data-edit-notice="${esc(n.id)}">수정</button><button type="button" class="btn btn-danger btn-sm" data-del-notice="${esc(n.id)}">삭제</button></td></tr>`).join('')}
    </tbody></table></div>`;
  } else {
    body = `<div class="todo">
      <h2>로그인을 연결하면 열리는 기능</h2>
      <ol>
        <li>학생·학부모 계정 만들기 (선생님이 초대한 사람만 가입)</li>
        <li>학생별 성적표·오답노트 PDF 올리기 — 본인과 보호자만 열람</li>
        <li>시험 점수 입력 → 학생·학부모 화면 그래프에 자동 반영</li>
        <li>상담 신청 접수함</li>
      </ol>
      <p class="muted">학생 개인 정보는 공개되는 사이트 코드가 아니라, 접근 권한이 걸린 데이터베이스에 따로 보관합니다.</p>
    </div>`;
  }
  return `${pageHead('ADMIN', '선생님 관리', '')}
  <section class="section section-tight"><div class="wrap">
    <div class="warn" role="note"><b>아직 잠겨 있지 않은 화면입니다.</b> 여기서 바꾼 내용은 이 브라우저에만 저장되고 다른 사람 화면에는 보이지 않습니다. 실제 운영은 로그인을 연결한 뒤에 합니다.</div>
    <div class="tabs" role="tablist">${tabs.map(([k, t]) => `<button type="button" role="tab" class="tab ${state.adminTab === k ? 'on' : ''}" aria-selected="${state.adminTab === k}" data-tab="${k}">${t}</button>`).join('')}</div>
    <div class="panel">${body}</div>
    <div class="admin-foot"><button class="btn btn-ghost btn-sm" type="button" id="resetAll">예시 데이터로 되돌리기</button></div>
  </div></section>`;
}

function viewNotFound(msg = '페이지를 찾을 수 없습니다.') {
  return `${pageHead('404', msg, '')}<section class="section section-tight"><div class="wrap"><a class="btn btn-primary" href="#/">홈으로</a></div></section>`;
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
  const form = wrap.querySelector('form');
  form.addEventListener('submit', e => { e.preventDefault(); if (onSubmit(form) !== false) closeModal(); });
  wrap.querySelector('input, textarea, select')?.focus();
}
function closeModal() { document.getElementById('modal')?.remove(); document.body.classList.remove('no-scroll'); }

const lessonRow = (l = { title: '', video: '' }) => `<div class="lesson-edit"><input name="lt" placeholder="차시 제목" maxlength="60" value="${esc(l.title)}"><input name="lv" placeholder="유튜브 주소 (선택)" value="${esc(l.video)}"><button type="button" class="icon-btn" data-del-lesson aria-label="이 차시 삭제">×</button></div>`;

function editCourse(id) {
  const c = id ? findCourse(id) : { grade: '고2', subject: '', title: '', desc: '', lessons: [{ title: '', video: '' }] };
  openModal(`<form class="form">
    <h2>${id ? '강좌 수정' : '새 강좌'}</h2>
    <div class="field-row">
      <label class="field"><span>학년</span><select name="grade">${GRADES.map(g => `<option ${g === c.grade ? 'selected' : ''}>${g}</option>`).join('')}</select></label>
      <label class="field"><span>과목</span><input name="subject" required maxlength="20" value="${esc(c.subject)}" placeholder="예: 대수"></label>
    </div>
    <label class="field"><span>강좌명</span><input name="title" required maxlength="40" value="${esc(c.title)}"></label>
    <label class="field"><span>소개</span><textarea name="desc" rows="2" maxlength="120">${esc(c.desc)}</textarea></label>
    <div class="field"><span>차시</span><div id="lessonRows">${c.lessons.map(lessonRow).join('')}</div><button type="button" class="btn btn-ghost btn-sm" id="addLesson">+ 차시 추가</button></div>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>취소</button><button type="submit" class="btn btn-primary">저장</button></div>
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
    <h2>${id ? '공지 수정' : '새 공지'}</h2>
    <label class="field"><span>날짜</span><input type="date" name="date" required value="${esc(n.date)}"></label>
    <label class="field"><span>제목</span><input name="title" required maxlength="60" value="${esc(n.title)}"></label>
    <label class="field"><span>내용</span><textarea name="body" rows="6" maxlength="2000">${esc(n.body)}</textarea></label>
    <div class="modal-actions"><button type="button" class="btn btn-ghost" data-close>취소</button><button type="submit" class="btn btn-primary">저장</button></div>
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
  const navKey = r.page === 'course' ? 'courses' : r.page;
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === navKey));
  setMenu(false);
  if (keepScroll) window.scrollTo(0, y);
  else if (r.page === 'notice' && r.a) document.getElementById(`notice-${r.a}`)?.scrollIntoView({ block: 'center' });
  else window.scrollTo(0, 0);
}

function setMenu(open) {
  document.getElementById('nav').classList.toggle('open', open);
  document.getElementById('menuBtn').setAttribute('aria-expanded', String(open));
  document.getElementById('menuBtn').setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
}

/* ---------- 이벤트 ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const hit = sel => t.closest(sel);
  if (hit('#menuBtn')) { setMenu(!document.getElementById('nav').classList.contains('open')); return; }
  if (hit('[data-filter]')) {
    state.filter = hit('[data-filter]').dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => { const on = b.dataset.filter === state.filter; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    document.getElementById('courseResults').innerHTML = courseGrid();
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
    document.getElementById('courseResults').innerHTML = courseGrid();
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
