export const H = 3600e3;

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Prihvaća i zarez i točku (npr. "62,5").
export function num(v) {
  const n = parseFloat(String(v ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}
export const fmt = (n) => (Math.round(n * 100) / 100).toString().replace('.', ',');

const DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
export function fmtDate(ms) {
  const d = new Date(ms);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.`;
}
export function fmtDay(ms) {
  const d = new Date(ms);
  return `${DAYS[d.getDay()]}, ${d.getDate()}. ${d.getMonth() + 1}.`;
}
export function fmtTime(ms) {
  const d = new Date(ms);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}
export function fmtHours(h) {
  if (h < 1) return 'manje od sat vremena';
  if (h < 72) return `~${Math.round(h)} h`;
  return `~${Math.round(h / 24)} dana`;
}
export function ago(ms, now = Date.now()) {
  const h = (now - ms) / H;
  if (h < 1) return 'prije manje od sat vremena';
  if (h < 24) return `prije ${Math.round(h)} h`;
  const d = Math.round(h / 24);
  return d === 1 ? 'jučer' : `prije ${d} dana`;
}
export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
