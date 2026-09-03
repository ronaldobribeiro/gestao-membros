import { sb } from "../api/supabase";
import { FAM_TABLE, TABLE } from "../config/constants";
import { isMissingColumnError } from "../utils/agendaHelpers";
import { autoFamiliaNome } from "../utils/familyHelpers";
import { normalizeName } from "../utils/normalizers";

export async function getFamilias() {
  const { data, error } = await sb.from(FAM_TABLE).select("*").order("nome_familia", { ascending: true });
  if (error) throw new Error("Erro ao carregar famílias: " + error.message);
  return data || [];
}

// Salva uma familia; se as colunas extras (bairro/lider/grupo) ainda nao existirem
// na tabela do Supabase, tenta novamente sem elas e sinaliza isso ao chamador.
export async function saveFamilia(payload, id) {
  const extras = ["bairro_familia", "lider_familia", "grupo_familia"];
  let data, error;
  if (id) ({ data, error } = await sb.from(FAM_TABLE).update(payload).eq("id", id).select().single());
  else ({ data, error } = await sb.from(FAM_TABLE).insert(payload).select().single());

  let colunasExtrasIndisponiveis = false;
  if (error && isMissingColumnError(error)) {
    colunasExtrasIndisponiveis = true;
    const payloadSemExtras = { ...payload };
    extras.forEach((k) => delete payloadSemExtras[k]);
    if (id) ({ data, error } = await sb.from(FAM_TABLE).update(payloadSemExtras).eq("id", id).select().single());
    else ({ data, error } = await sb.from(FAM_TABLE).insert(payloadSemExtras).select().single());
  }
  if (error) throw new Error("Erro ao salvar família: " + error.message);
  return { data, colunasExtrasIndisponiveis };
}

export async function deleteFamilia(id) {
  const { error } = await sb.from(FAM_TABLE).delete().eq("id", id);
  if (error) throw new Error("Erro ao excluir família: " + error.message);
}

export async function removeMemberFromFamilia(memberId) {
  const { error } = await sb.from(TABLE).update({ familia_id: null, papel_familia: null }).eq("id", memberId);
  if (error) throw new Error("Erro ao desvincular: " + error.message);
}

// Garante que o membro-alvo (encontrado pelo nome digitado no formulario) esta
// vinculado a uma familia: reaproveita a familia atual se ja existir uma, ou
// cria uma nova familia automaticamente a partir do sobrenome do membro.
export async function resolveFamiliaViaVinculo({ familiaAtualId, targetMember, familias, onFamiliaCriada, onMembroAtualizado }) {
  if (!targetMember) return null;
  if (targetMember.familia_id) return targetMember.familia_id;

  if (familiaAtualId) {
    const { error } = await sb.from(TABLE).update({ familia_id: familiaAtualId }).eq("id", targetMember.id);
    if (error) throw new Error("Erro ao vincular " + (targetMember.nome_completo || "membro") + ": " + error.message);
    onMembroAtualizado?.(targetMember.id, familiaAtualId);
    return familiaAtualId;
  }

  const nome = autoFamiliaNome(targetMember.nome_completo);
  const { data, error } = await sb.from(FAM_TABLE).insert({ nome_familia: nome }).select().single();
  if (error) throw new Error("Erro ao criar família: " + error.message);
  onFamiliaCriada?.(data);

  const { error: err2 } = await sb.from(TABLE).update({ familia_id: data.id }).eq("id", targetMember.id);
  if (err2) throw new Error("Erro ao vincular " + (targetMember.nome_completo || "membro") + ": " + err2.message);
  onMembroAtualizado?.(targetMember.id, data.id);
  return data.id;
}

export function findMemberByName(members, nomeDigitado, excludeId) {
  return members.find((mb) => normalizeName(mb.nome_completo) === normalizeName(nomeDigitado) && (!excludeId || mb.id !== excludeId));
}
