/*
  데이터 저장 담당.
  지금은 이 브라우저(localStorage)에만 저장합니다.
  나중에 로그인·데이터베이스를 연결할 때는 이 파일의 함수 안쪽만 바꾸면 됩니다.
*/
const Store = (() => {
  const KEYS = { courses: 'dhl-courses-v2', notices: 'dhl-notices-v2', tasks: 'dhl-tasks-v2' };
  const clone = v => JSON.parse(JSON.stringify(v));
  const read = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? clone(fallback); }
    catch { return clone(fallback); }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };
  const newId = prefix => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  return {
    newId,
    getCourses: () => read(KEYS.courses, SAMPLE_COURSES),
    saveCourses: list => write(KEYS.courses, list),
    getNotices: () => read(KEYS.notices, SAMPLE_NOTICES).sort((a, b) => b.date.localeCompare(a.date)),
    saveNotices: list => write(KEYS.notices, list),
    getDoneTasks: () => read(KEYS.tasks, []),
    saveDoneTasks: list => write(KEYS.tasks, list),
    resetAll: () => { Object.values(KEYS).forEach(k => { try { localStorage.removeItem(k); } catch {} }); }
  };
})();
