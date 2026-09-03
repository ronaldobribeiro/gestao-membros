import { CAT_COLORS } from "../config/constants";
import { normalizeName } from "./normalizers";
import { initials } from "./icons";

export function getResponsavelFamilia(f, members) {
  const membros = members.filter((m) => m.familia_id === f.id);
  if (!membros.length) return null;
  const prioridade = ["Pai", "Mãe", "Cônjuge"];
  for (const papel of prioridade) {
    const alvo = membros.find((m) => m.papel_familia === papel);
    if (alvo) return alvo;
  }
  return membros.slice().sort((a, b) => (a.id > b.id ? 1 : -1))[0];
}

export function familiaAvatarColor(f) {
  const str = String(f.nome_familia || f.id || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return CAT_COLORS[hash % CAT_COLORS.length];
}

export function familiaIniciais(f) {
  const nome = String(f.nome_familia || "").replace(/^fam[ií]lia\s+/i, "");
  return initials(nome || f.nome_familia);
}

export function familiaStatus(f) {
  return f.membros && f.membros.length > 0 ? "ativo" : "pendente";
}

export function getFamiliasNomesDuplicados(familias) {
  const counts = new Map();
  familias.forEach((f) => {
    const key = normalizeName(f.nome_familia);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const dup = new Set();
  counts.forEach((c, k) => { if (c > 1) dup.add(k); });
  return dup;
}

export function getFamiliaDuplicidades(members) {
  const nameToFamilias = new Map();
  members.forEach((m) => {
    if (!m.familia_id) return;
    const key = normalizeName(m.nome_completo);
    if (!key) return;
    if (!nameToFamilias.has(key)) nameToFamilias.set(key, new Set());
    nameToFamilias.get(key).add(m.familia_id);
  });
  const familiaIds = new Set();
  const memberKeys = new Set();
  nameToFamilias.forEach((set) => {
    if (set.size > 1) {
      set.forEach((id) => familiaIds.add(id));
    }
  });
  nameToFamilias.forEach((set, key) => { if (set.size > 1) memberKeys.add(key); });
  return { familiaIds, memberKeys };
}

export function getUltimaVisitaFamilia(f, agenda) {
  const nome = normalizeName(f.nome_familia);
  if (!nome) return null;
  const hoje = new Date().toISOString().slice(0, 10);
  const eventos = agenda.filter((ev) => {
    if (ev.categoria !== "visita" || !ev.data_inicio || ev.data_inicio > hoje) return false;
    const alvo = normalizeName(ev.titulo) + " " + normalizeName(ev.descricao || "");
    return alvo.includes(nome);
  });
  if (!eventos.length) return null;
  return eventos.reduce((max, ev) => (ev.data_inicio > max.data_inicio ? ev : max));
}

export function mapsUrlFor(query) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
}

export function autoFamiliaNome(nomeCompleto) {
  const parts = String(nomeCompleto || "").trim().split(/\s+/).filter(Boolean);
  const last = parts.length ? parts[parts.length - 1] : "";
  const titled = last ? last.charAt(0).toUpperCase() + last.slice(1).toLowerCase() : "Nova";
  return "Família " + titled;
}
