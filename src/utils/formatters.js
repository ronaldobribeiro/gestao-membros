export function fmtDate(d) {
  if (!d) return "—";
  const parts = String(d).split("-");
  if (parts.length !== 3) return d;
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

export function getAge(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  if (isNaN(b)) return null;
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function dateToISO(d) {
  return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}

export function fmtHorario(h) {
  return h ? String(h).slice(0, 5) : "";
}

export function fmtRange(ev) {
  if (!ev.data_fim || ev.data_fim === ev.data_inicio) return fmtDate(ev.data_inicio);
  return fmtDate(ev.data_inicio) + " – " + fmtDate(ev.data_fim);
}

export function daysAgoLabel(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d)) return null;
  const diffMs = new Date().setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0);
  const days = Math.round(diffMs / 86400000);
  if (days < 0) return "Agendada";
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  if (days < 30) return days + " dias atrás";
  const months = Math.round(days / 30);
  if (months < 12) return months + (months === 1 ? " mês atrás" : " meses atrás");
  const years = Math.round(days / 365);
  return years + (years === 1 ? " ano atrás" : " anos atrás");
}

export function toUpper(v) {
  return v === null || v === undefined ? v : String(v).toUpperCase();
}
