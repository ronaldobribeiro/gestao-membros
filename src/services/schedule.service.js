import { sb } from "../api/supabase";
import { AG_TABLE } from "../config/constants";
import { isMissingColumnError } from "../utils/agendaHelpers";

export async function getAgenda() {
  const { data, error } = await sb.from(AG_TABLE).select("*").order("data_inicio", { ascending: true });
  if (error) throw new Error("Erro ao carregar agenda: " + error.message);
  return data || [];
}

export async function saveAgendaEvent(payload, id) {
  let error;
  if (id) ({ error } = await sb.from(AG_TABLE).update(payload).eq("id", id));
  else ({ error } = await sb.from(AG_TABLE).insert(payload));

  let colunasExtrasIndisponiveis = false;
  if (error && isMissingColumnError(error) && ("horario" in payload || "categoria" in payload)) {
    colunasExtrasIndisponiveis = true;
    const payloadSemExtras = { ...payload };
    delete payloadSemExtras.horario;
    delete payloadSemExtras.categoria;
    if (id) ({ error } = await sb.from(AG_TABLE).update(payloadSemExtras).eq("id", id));
    else ({ error } = await sb.from(AG_TABLE).insert(payloadSemExtras));
  }
  if (error) throw new Error("Erro ao salvar evento: " + error.message);
  return { colunasExtrasIndisponiveis };
}

export async function deleteAgendaEvent(id) {
  const { error } = await sb.from(AG_TABLE).delete().eq("id", id);
  if (error) throw new Error("Erro ao excluir evento: " + error.message);
}
