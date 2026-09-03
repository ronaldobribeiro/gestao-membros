import { pad2, dateToISO } from "./formatters";

export function eventCoversDate(ev, d) {
  const s = new Date(ev.data_inicio + "T00:00:00");
  const e = new Date((ev.data_fim || ev.data_inicio) + "T00:00:00");
  return d >= s && d <= e;
}

export function eventCoversDay(ev, year, month, day) {
  return eventCoversDate(ev, new Date(year, month - 1, day));
}

export function getWeekStart(d) {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function sortEventsByTime(events) {
  return events.slice().sort((a, b) => {
    const ta = a.horario || "";
    const tb = b.horario || "";
    if (ta !== tb) return ta.localeCompare(tb);
    return (a.titulo || "").localeCompare(b.titulo || "");
  });
}

export function isMissingColumnError(error) {
  if (!error) return false;
  const msg = String(error.message || "");
  return error.code === "42703" || error.code === "PGRST204" || /column .* does not exist/i.test(msg) || /could not find .* column/i.test(msg);
}

export { pad2, dateToISO };
