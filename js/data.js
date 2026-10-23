/*
  사이트 기본 정보와 처음에 보이는 예시 데이터.
  학원 정보는 SITE에서 바꾸면 사이트 전체에 반영됩니다.
  빈 칸('')으로 두면 그 항목은 화면에 나오지 않습니다.
  ※ 이 파일은 공개됩니다. 학생 실명·성적 같은 개인 정보는 절대 넣지 마세요.
*/
const SITE = {
  name: 'DHL MATH',
  teacher: '이동훈',
  slogan: '시험을 분석하고, 틀린 이유를 찾고, 다음 시험에서 증명합니다.',
  academy: '',       // 예: 'OO학원 고등관'
  address: '',       // 예: '경기도 용인시 수지구 ...'
  phone: '',         // 예: '031-000-0000'
  kakao: '',         // 카카오톡 채널 주소 (https://pf.kakao.com/...)
  hours: ''          // 예: '평일 14:00–22:00'
};

const GRADES = ['고1', '고2', '고3'];

/* 강좌 예시. video에 유튜브 주소를 넣으면 강의실에서 바로 재생됩니다. */
const SAMPLE_COURSES = [
  {
    id: 'c1', grade: '고1', subject: '공통수학1', title: '공통수학1 개념 완성',
    desc: '다항식부터 행렬까지, 교과서 개념을 그림과 도형으로 이해하고 기본 유형을 정리합니다.',
    lessons: [
      { title: '다항식의 연산', video: '' },
      { title: '항등식과 나머지정리', video: '' },
      { title: '인수분해', video: '' },
      { title: '복소수와 이차방정식', video: '' },
      { title: '이차방정식과 이차함수', video: '' },
      { title: '여러 가지 방정식과 부등식', video: '' },
      { title: '경우의 수, 순열과 조합', video: '' },
      { title: '행렬과 그 연산', video: '' }
    ]
  },
  {
    id: 'c2', grade: '고1', subject: '공통수학2', title: '공통수학2 개념 완성',
    desc: '좌표평면 위의 도형, 집합과 명제, 함수를 하나의 흐름으로 연결합니다.',
    lessons: [
      { title: '평면좌표와 직선의 방정식', video: '' },
      { title: '원의 방정식', video: '' },
      { title: '도형의 이동', video: '' },
      { title: '집합', video: '' },
      { title: '명제', video: '' },
      { title: '함수와 합성함수, 역함수', video: '' },
      { title: '유리함수와 무리함수', video: '' }
    ]
  },
  {
    id: 'c3', grade: '고2', subject: '대수', title: '대수 개념과 내신 유형',
    desc: '지수·로그, 삼각함수, 수열을 그래프로 먼저 보고, 학교 시험에 나오는 형태로 연습합니다.',
    lessons: [
      { title: '지수와 로그', video: '' },
      { title: '지수함수와 로그함수', video: '' },
      { title: '삼각함수의 뜻과 그래프', video: '' },
      { title: '사인법칙과 코사인법칙', video: '' },
      { title: '등차수열과 등비수열', video: '' },
      { title: '수열의 합', video: '' },
      { title: '수학적 귀납법', video: '' }
    ]
  },
  {
    id: 'c4', grade: '고2', subject: '미적분Ⅰ', title: '미적분Ⅰ 그래프로 읽기',
    desc: '극한과 연속, 미분과 적분을 그래프의 움직임으로 이해하고 활용 문제까지 이어갑니다.',
    lessons: [
      { title: '함수의 극한', video: '' },
      { title: '함수의 연속', video: '' },
      { title: '미분계수와 도함수', video: '' },
      { title: '도함수의 활용', video: '' },
      { title: '부정적분과 정적분', video: '' },
      { title: '정적분의 활용', video: '' }
    ]
  },
  {
    id: 'c5', grade: '고2', subject: '내신 대비', title: '내신 기출 분석과 변형 문제',
    desc: '시험 범위의 기출을 분석하고, 같은 원리를 바꿔 낸 변형 문제로 실전 감각을 만듭니다.',
    lessons: [
      { title: '시험 범위 핵심 정리', video: '' },
      { title: '기출 경향 분석', video: '' },
      { title: '변형 문제 풀이 1', video: '' },
      { title: '변형 문제 풀이 2', video: '' },
      { title: '자주 틀리는 유형 정리', video: '' }
    ]
  },
  {
    id: 'c6', grade: '고3', subject: '수능 대비', title: '수능 실전 모의고사',
    desc: '시간 배분과 풀이 순서를 점검하고, 회차별 해설로 약한 단원을 찾아냅니다.',
    lessons: [
      { title: '실전 운영 전략', video: '' },
      { title: '실전 모의고사 1회 해설', video: '' },
      { title: '실전 모의고사 2회 해설', video: '' },
      { title: '실전 모의고사 3회 해설', video: '' }
    ]
  },
  {
    id: 'c7', grade: '고3', subject: '심화', title: '고난도 문항 분석',
    desc: '고난도 문항의 발상과 풀이 구조를 쪼개 보고, 같은 구조의 문제로 다시 연습합니다.',
    lessons: [
      { title: '고난도 문항을 읽는 법', video: '' },
      { title: '함수 추론 문항', video: '' },
      { title: '수열 추론 문항', video: '' },
      { title: '도형 활용 문항', video: '' }
    ]
  }
];

const SAMPLE_NOTICES = [
  { id: 'n1', date: '2026-10-20', title: '2학기 기말고사 대비 일정 안내', body: '학교별 시험 범위에 맞춰 대비 수업 일정이 정해지면 이곳에 안내드립니다. (예시 공지)' },
  { id: 'n2', date: '2026-10-13', title: '중간고사 성적 분석 보고서 발송', body: '중간고사 응시 학생의 개인 성적 분석 보고서를 순서대로 보내드리고 있습니다. (예시 공지)' },
  { id: 'n3', date: '2026-10-06', title: '온라인 강의실 시범 운영', body: '강좌별 복습 영상을 온라인 강의실에서 볼 수 있도록 준비하고 있습니다. (예시 공지)' }
];

/* 학생·학부모 화면 미리보기용 가상 학생. 실제 학생 정보가 아닙니다. */
const DEMO_STUDENT = {
  name: '예시 학생',
  grade: '고2',
  courses: [{ id: 'c3', done: 5 }, { id: 'c5', done: 2 }],
  tasks: [
    { id: 't1', text: '대수 · 수열의 합 복습 영상 보기', due: '오늘' },
    { id: 't2', text: '오답노트 3문항 다시 풀기', due: '오늘' },
    { id: 't3', text: '변형 문제 세트 B 풀기', due: '금요일' }
  ],
  tests: [
    { name: '3월 진단', score: 62 },
    { name: '4월 주간', score: 68 },
    { name: '중간고사', score: 74 },
    { name: '6월 주간', score: 71 },
    { name: '7월 주간', score: 80 },
    { name: '9월 주간', score: 84 }
  ],
  wrongNotes: [
    { unit: '삼각함수의 그래프', count: 4, status: '다시 풀기 남음' },
    { unit: '수열의 합', count: 3, status: '완료' },
    { unit: '사인법칙과 코사인법칙', count: 2, status: '다시 풀기 남음' }
  ],
  reports: [
    { title: '9월 주간 테스트 성적표', date: '2026-09-27' },
    { title: '2학기 중간고사 분석 보고서', date: '2026-10-13' }
  ],
  comment: '9월 들어 계산 실수가 눈에 띄게 줄었습니다. 삼각함수 그래프를 그려 보며 푸는 습관이 자리 잡고 있어서, 기말고사 전까지 같은 방식으로 이어가 보려고 합니다.'
};

/* 처음 오시는 분 안내 순서. 학원 실제 절차에 맞게 고쳐 주세요. */
const ADMISSION = [
  { title: '상담 신청', desc: '학년과 최근 시험 결과를 알려주세요. 상담 전에 미리 살펴봅니다.' },
  { title: '진단 테스트', desc: '지금 실력과 약한 단원을 확인합니다.' },
  { title: '반 안내', desc: '실력과 목표에 맞는 수업을 안내해 드립니다.' },
  { title: '수업 시작', desc: '수업과 함께 시험 분석, 오답노트 관리가 시작됩니다.' }
];

/*
  실제 숫자와 후기. 확인된 내용만 넣어 주세요. 비어 있으면 홈에 나오지 않습니다.
  STATS 예: { value: '1,200', unit: '문항', label: '올해 만든 변형 문제' }
  REVIEWS 예: { text: '후기 내용', who: '고2 김OO 학부모', tag: '2학기 중간고사' }
  ※ 학생 실명은 쓰지 말고 성만 남겨 주세요.
*/
const STATS = [];
const REVIEWS = [];
