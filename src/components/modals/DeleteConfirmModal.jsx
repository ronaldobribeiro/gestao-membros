import { useEffect, useRef } from "react";
import { useModals } from "../../state/ModalsContext";
import Modal from "../Modal";

export default function DeleteConfirmModal() {
  const { deleteConfirm, closeDeleteConfirm, confirmDeleteMember } = useModals();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    confirmDeleteMember(inputRef.current?.value || "");
  }

  return (
    <Modal title="Confirmar exclusão" onClose={closeDeleteConfirm} maxWidth={420}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p style={{ margin: "0 0 16px", color: "var(--slate)", fontSize: 14 }}>
            Para excluir <strong>{deleteConfirm.name}</strong> da base de membros, digite <strong>EXCLUIR</strong> abaixo. Essa ação não pode ser desfeita.
          </p>
          <div className="field full">
            <label htmlFor="delconfirm-text">Digite EXCLUIR para confirmar</label>
            <input id="delconfirm-text" ref={inputRef} type="text" autoComplete="off" required defaultValue={deleteConfirm.confirmText || ""} />
          </div>
          {deleteConfirm.error ? <p style={{ margin: "8px 0 0", color: "var(--danger)", fontSize: 13 }}>{deleteConfirm.error}</p> : null}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-ghost" onClick={closeDeleteConfirm}>Cancelar</button>
          <button type="submit" className="btn btn-gold" style={{ background: "var(--danger)", borderColor: "var(--danger)" }}>Excluir</button>
        </div>
      </form>
    </Modal>
  );
}
