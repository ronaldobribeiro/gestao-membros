import { sb } from "../api/supabase";
import { TABLE } from "../config/constants";
import { normalizeMember } from "../utils/normalizers";

export async function getMembers() {
  const { data, error } = await sb.from(TABLE).select("*").order("nome_completo", { ascending: true });
  if (error) throw new Error("Erro ao carregar membros: " + error.message);
  return (data || []).map(normalizeMember);
}

export async function saveMember(payload, id) {
  const query = id
    ? sb.from(TABLE).update(payload).eq("id", id)
    : sb.from(TABLE).insert(payload);
  const { error } = await query;
  if (error) throw new Error("Erro ao salvar: " + error.message);
}

export async function deleteMember(id) {
  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) throw new Error("Erro ao excluir: " + error.message);
}
