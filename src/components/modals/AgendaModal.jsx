import { useState } from "react";
import { useModals } from "../../state/ModalsContext";
import { useData } from "../../state/DataContext";
import Modal from "../Modal";
import { AG_CATEGORIAS } from "../../config/constants";
import { fmtHorario, toUpper } from "../../utils/formatters";
import { handleUpperInput } from "../../hooks/useUppercaseInput";

export default function AgendaModal() {
  const { agEditing, closeAgendaModal } = useModals();
  const { saveAgendaEvent } = useData();
  const [saving, setSaving] = useState(false);

  const ev = agEditing || {};
  const isEdit = !!ev.id;

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      titulo: toUpper(fd.get("titulo")),
      categoria: fd.get("categoria") || null,
      data_inicio: fd.get("data_inicio"),
      data_fim: fd.get("data_fim") || null,
      horario: fd.get("horario") || null,
      descricao: fd.get("descricao") ? toUpper(fd.get("descricao")) : null,
    };
    setSaving(true);
    await saveAgendaEvent(payload, ev.id);
    setSaving(false);
    closeAgendaModal();
  }

  return (
    <Modal title={isEdit ? "Editar evento" : "Novo evento"} onClose={closeAgendaModal}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="ag-fld-titulo">Título *</label>
              <input id="ag-fld-titulo" name="titulo" type="text" defaultValue={ev.titulo || ""} required onInput={handleUpperInput} />
            </div>
            <div className="field">
              <label htmlFor="ag-fld-categoria">Categoria</label>
              <select id="ag-fld-categoria" name="categoria" defaultValue={ev.categoria || ""}>
                <option value="">Sem categoria</option>
                {AG_CATEGORIAS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ag-fld-inicio">Data de início *</label>
              <input id="ag-fld-inicio" name="data_inicio" type="date" defaultValue={ev.data_inicio || ""} required />
            </div>
            <div className="field">
              <label htmlFor="ag-fld-horario">Horário</label>
              <input id="ag-fld-horario" name="horario" type="time" defaultValue={fmtHorario(ev.horario)} />
            </div>
            <div className="field">
              <label htmlFor="ag-fld-fim">Data de fim (opcional, se for mais de um dia)</label>
              <input id="ag-fld-fim" name="data_fim" type="date" defaultValue={ev.data_fim || ""} />
            </div>
            <div className="field full">
              <label htmlFor="ag-fld-descricao">Comentário</label>
              <textarea
                id="ag-fld-descricao" name="descricao" rows={4} defaultValue={ev.descricao || ""} onInput={handleUpperInput}
                style={{ width: "100%", padding: "11px 13px", border: "1px solid var(--line-2)", borderRadius: 9, fontSize: 14, background: "var(--cream)", color: "var(--ink)", fontFamily: "inherit", resize: "vertical" }}
              />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={closeAgendaModal}>Cancelar</button>
          <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
