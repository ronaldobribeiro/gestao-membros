import { sb } from "../api/supabase";
import { MIN_TABLE, PROC_TABLE } from "../config/constants";

export async function getVinculos() {
  const [minRes, procRes] = await Promise.all([
    sb.from(MIN_TABLE).select("*"),
    sb.from(PROC_TABLE).select("*"),
  ]);
  if (minRes.error) throw new Error("Erro ao carregar ministerios: " + minRes.error.message);
  if (procRes.error) throw new Error("Erro ao carregar processos: " + procRes.error.message);
  return { vinculosMinisterios: minRes.data || [], vinculosProcessos: procRes.data || [] };
}

export async function toggleVinculo(tipo, membroId, valor, checked) {
  const table = tipo === "ministerio" ? MIN_TABLE : PROC_TABLE;
  const col = tipo === "ministerio" ? "ministerio" : "processo";
  if (checked) {
    const { data, error } = await sb.from(table).insert({ membro_id: membroId, [col]: valor }).select().single();
    if (error) throw new Error("Erro ao vincular: " + error.message);
    return { added: data };
  }
  const { error } = await sb.from(table).delete().eq("membro_id", membroId).eq(col, valor);
  if (error) throw new Error("Erro ao remover: " + error.message);
  return { removed: { membroId, valor } };
}

// Garante que todo membro tenha ao menos o processo "Acolher" por padrao.
export async function ensureDefaultAcolher(members, vinculosProcessos) {
  const withProcess = new Set(vinculosProcessos.map((v) => v.membro_id));
  const missing = members.filter((m) => !withProcess.has(m.id));
  if (missing.length === 0) return [];
  const rows = missing.map((m) => ({ membro_id: m.id, processo: "Acolher" }));
  const { data, error } = await sb.from(PROC_TABLE).insert(rows).select();
  if (error) throw new Error("Erro ao definir Acolher padrao: " + error.message);
  return data || [];
}
