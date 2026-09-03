import { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";
import { useToast } from "./ToastContext";

const ModalsContext = createContext(null);

// Centraliza os modais que podem ser abertos a partir de varias abas diferentes
// (ex.: "editar membro" tanto pela Tabela quanto por Familias), tal como no app
// original, em que esses modais eram desenhados uma unica vez no shell.
export function ModalsProvider({ children }) {
  const { isAdmin } = useAuth();
  const { members, deleteMember } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [famModalOpen, setFamModalOpen] = useState(false);
  const [famEditing, setFamEditing] = useState(null);

  const [agModalOpen, setAgModalOpen] = useState(false);
  const [agEditing, setAgEditing] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bdayExpanded, setBdayExpanded] = useState(false);

  const openMemberModal = useCallback((member) => { setEditingMember(member || null); setModalOpen(true); }, []);
  const closeMemberModal = useCallback(() => { setModalOpen(false); setEditingMember(null); }, []);

  const openMemberModalById = useCallback((id) => {
    openMemberModal(members.find((m) => String(m.id) === String(id)) || null);
  }, [members, openMemberModal]);

  const openFamiliaModal = useCallback((f) => { setFamEditing(f ? { ...f } : {}); setFamModalOpen(true); }, []);
  const closeFamiliaModal = useCallback(() => { setFamModalOpen(false); setFamEditing(null); }, []);

  const openAdicionarMembroFamilia = useCallback((f) => { setEditingMember({ familia_id: f.id }); setModalOpen(true); }, []);
  const openAgendarVisitaFamilia = useCallback((f) => {
    setAgEditing({ titulo: "Visita Pastoral - " + (f.nome_familia || ""), categoria: "visita" });
    setAgModalOpen(true);
  }, []);

  const openAgendaModal = useCallback((ev) => { setAgEditing(ev || null); setAgModalOpen(true); }, []);
  const closeAgendaModal = useCallback(() => { setAgModalOpen(false); setAgEditing(null); }, []);

  const requestDeleteMember = useCallback((id, name) => {
    if (!isAdmin) { showToast("Apenas administradores podem excluir membros.", true); return; }
    setDeleteConfirm({ id, name, confirmText: "", error: "" });
  }, [isAdmin, showToast]);
  const closeDeleteConfirm = useCallback(() => setDeleteConfirm(null), []);
  const confirmDeleteMember = useCallback(async (confirmText) => {
    if ((confirmText || "").trim().toUpperCase() !== "EXCLUIR") {
      setDeleteConfirm((dc) => (dc ? { ...dc, error: 'Digite "EXCLUIR" para confirmar.' } : dc));
      return;
    }
    await deleteMember(deleteConfirm.id);
    setDeleteConfirm(null);
  }, [deleteConfirm, deleteMember]);

  return (
    <ModalsContext.Provider
      value={{
        modalOpen, editingMember, openMemberModal, openMemberModalById, closeMemberModal,
        famModalOpen, famEditing, openFamiliaModal, closeFamiliaModal, openAdicionarMembroFamilia, openAgendarVisitaFamilia,
        agModalOpen, agEditing, openAgendaModal, closeAgendaModal,
        deleteConfirm, requestDeleteMember, closeDeleteConfirm, confirmDeleteMember,
        bdayExpanded, setBdayExpanded,
      }}
    >
      {children}
    </ModalsContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error("useModals deve ser usado dentro de <ModalsProvider>");
  return ctx;
}
