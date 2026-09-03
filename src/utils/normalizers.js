export function normalizeIgreja(v) {
  if (!v) return "";
  const s = String(v).toLowerCase();
  if (s.includes("cavallari")) return "IPI Cavallari";
  if (s.includes("vera cruz")) return "Congregação Vera Cruz";
  return String(v).trim();
}

export function normalizeSituacao(v) {
  if (!v) return "";
  const s = String(v).toLowerCase().trim();
  if (s.startsWith("ativ")) return "Ativo";
  if (s.startsWith("inativ")) return "Inativo";
  return String(v).trim();
}

export function normalizeTipoMembro(v) {
  if (!v) return "";
  const s = String(v).toLowerCase();
  if (s.includes("não profess") || s.includes("nao profess")) return "Não professos";
  if (s.includes("frequent")) return "Frequentes";
  if (s.includes("profess")) return "Membro Professo";
  return String(v).trim();
}

export function normalizeRecebidoPor(v) {
  if (!v) return "";
  const s = String(v).toLowerCase();
  const hasBatismo = s.includes("batismo");
  const hasProfissao = s.includes("profiss");
  if (hasBatismo && hasProfissao) return "Batismo e Profissão de Fé";
  if (s.includes("transfer")) return "Transferência";
  if (s.includes("jurisdi")) return "Jurisdição";
  if (hasBatismo) return "Batismo";
  if (s.includes("frequent")) return "Frequentes";
  return String(v).trim();
}

export function normalizeSexo(v) {
  if (!v) return "";
  const s = String(v).toLowerCase().trim();
  if (s.includes("homem") || s.startsWith("masc") || s === "m") return "Masculino";
  if (s.includes("mulher") || s.startsWith("fem") || s === "f") return "Feminino";
  return String(v).trim();
}

export function normalizeName(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function memberMatchesTipo(m, tipo) {
  return m.status_membro === tipo;
}

export function normalizeMember(m) {
  return {
    ...m,
    membresia_igreja: normalizeIgreja(m.membresia_igreja),
    situacao_membro: normalizeSituacao(m.situacao_membro),
    status_membro: normalizeTipoMembro(m.status_membro),
    recebido_por: normalizeRecebidoPor(m.recebido_por),
    sexo: normalizeSexo(m.sexo),
  };
}
