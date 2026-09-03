import { useState } from "react";
import { useModals } from "../../state/ModalsContext";
import { useData } from "../../state/DataContext";
import { useToast } from "../../state/ToastContext";
import Modal from "../Modal";

export default function FamiliaModal() {
  const { famEditing, closeFamiliaModal } = useModals();
  const { saveFamilia } = useData();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const f = famEditing || {};
  const isEdit = !!f.id;

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      nome_familia: String(fd.get("nome_familia") || "").trim(),
      endereco_familia: fd.get("endereco_familia") ? String(fd.get("endereco_familia")).trim() : null,
      bairro_familia: fd.get("bairro_familia") ? String(fd.get("bairro_familia")).trim() : null,
      lider_familia: fd.get("lider_familia") ? String(fd.get("lider_familia")).trim() : null,
      grupo_familia: fd.get("grupo_familia") ? String(fd.get("grupo_familia")).trim() : null,
    };
    if (!payload.nome_familia) { showToast("Informe o nome da família.", true); return; }
    setSaving(true);
    const ok = await saveFamilia(payload, f.id);
    setSaving(false);
    if (ok) closeFamiliaModal();
  }

  return (
    <Modal title={isEdit ? "Editar família" : "Nova família"} onClose={closeFamiliaModal}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="fam-fld-nome">Nome da família *</label>
              <input id="fam-fld-nome" name="nome_familia" type="text" defaultValue={f.nome_familia || ""} placeholder="Ex.: Família Alves" required />
            </div>
            <div className="field full">
              <label htmlFor="fam-fld-endereco">Endereço</label>
              <input id="fam-fld-endereco" name="endereco_familia" type="text" defaultValue={f.endereco_familia || ""} />
            </div>
            <div className="field">
              <label htmlFor="fam-fld-bairro">Bairro</label>
              <input id="fam-fld-bairro" name="bairro_familia" type="text" defaultValue={f.bairro_familia || ""} />
            </div>
            <div className="field">
              <label htmlFor="fam-fld-lider">Líder de célula/grupo</label>
              <input id="fam-fld-lider" name="lider_familia" type="text" defaultValue={f.lider_familia || ""} />
            </div>
            <div className="field full">
              <label htmlFor="fam-fld-grupo">Nome do grupo/célula</label>
              <input id="fam-fld-grupo" name="grupo_familia" type="text" defaultValue={f.grupo_familia || ""} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={closeFamiliaModal}>Cancelar</button>
          <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </form>
    </Modal>
  );
}
