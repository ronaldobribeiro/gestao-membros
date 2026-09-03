import { useState } from "react";
import { useModals } from "../../state/ModalsContext";
import { useData } from "../../state/DataContext";
import Modal from "../Modal";
import MemberFormField from "../MemberFormField";
import { FIELDS, PAPEL_FAMILIA_OPCOES } from "../../config/constants";
import { toUpper } from "../../utils/formatters";
import { handleUpperInput } from "../../hooks/useUppercaseInput";

export default function MemberModal() {
  const { editingMember, closeMemberModal } = useModals();
  const { members, familias, saveMemberComFamilia, removeMemberFromFamilia } = useData();

  const m = editingMember || {};
  const isEdit = !!m.id;
  const visibleFields = FIELDS.filter((f) => isEdit || !f.editOnly);
  const familiaAtual = m.familia_id ? (familias.find((f) => f.id === m.familia_id)?.nome_familia || "") : "";
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const payload = {};
    visibleFields.forEach((f) => {
      let v = fd.get(f.key);
      if (v === "") v = null;
      if (v !== null && (f.type === "text" || f.type === "email")) v = toUpper(v);
      payload[f.key] = v;
    });
    const vinculoNome = toUpper(form.elements["vincular_membro"]?.value || "");
    const papelFamilia = form.elements["papel_familia"]?.value || "";
    setSaving(true);
    await saveMemberComFamilia(payload, vinculoNome, papelFamilia, m.id, m.familia_id);
    setSaving(false);
    closeMemberModal();
  }

  return (
    <Modal title={isEdit ? "Editar membro" : "Novo membro"} onClose={closeMemberModal}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            {visibleFields.map((f) => (
              <MemberFormField key={f.key} field={f} defaultValue={m[f.key]} />
            ))}

            <div className="field full">
              <label htmlFor="fld-vincular-membro">Vincular a um membro da família (opcional)</label>
              <input
                id="fld-vincular-membro"
                name="vincular_membro"
                type="text"
                list="membros-familia-datalist"
                placeholder="Digite o nome de um cônjuge, filho(a) etc. já cadastrado"
                autoComplete="off"
                onInput={handleUpperInput}
              />
              <datalist id="membros-familia-datalist">
                {members.filter((mb) => mb.id !== m.id).map((mb) => (
                  <option key={mb.id} value={mb.nome_completo} />
                ))}
              </datalist>
              {familiaAtual ? (
                <div className="sub-cell" style={{ marginTop: 6 }}>
                  Já vinculado a: <strong>{familiaAtual}</strong>
                  {isEdit ? (
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ marginLeft: 6 }}
                      onClick={() => { removeMemberFromFamilia(m.id); closeMemberModal(); }}
                    >
                      Remover vínculo
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="sub-cell" style={{ marginTop: 6 }}>Nenhuma família vinculada ainda.</div>
              )}
            </div>

            <div className="field">
              <label htmlFor="fld-papel-familia">Papel na família</label>
              <select id="fld-papel-familia" name="papel_familia" defaultValue={m.papel_familia || ""}>
                <option value="">—</option>
                {PAPEL_FAMILIA_OPCOES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={closeMemberModal}>Cancelar</button>
          <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
