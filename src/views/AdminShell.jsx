import { useState } from "react";
import { ModalsProvider, useModals } from "../state/ModalsContext";
import Sidebar from "../components/Sidebar";
import DashboardView from "./DashboardView";
import TabelaView from "./TabelaView";
import MinisteriosView from "./MinisteriosView";
import FamiliasView from "./FamiliasView";
import AgendaView from "./AgendaView";
import ImpressaoView from "./ImpressaoView";
import MemberModal from "../components/modals/MemberModal";
import FamiliaModal from "../components/modals/FamiliaModal";
import AgendaModal from "../components/modals/AgendaModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";

const VIEWS = {
  dashboard: DashboardView,
  tabela: TabelaView,
  ministerios: MinisteriosView,
  familias: FamiliasView,
  agendamentos: AgendaView,
  impressao: ImpressaoView,
};

// Modais que podem ser abertos a partir de qualquer aba (membro, familia, evento,
// confirmacao de exclusao). O modal de "aniversariantes ampliado" e especifico do
// Dashboard e e renderizado por ele mesmo, pois depende dos filtros daquela tela.
function ShellModals() {
  const { modalOpen, famModalOpen, agModalOpen, deleteConfirm } = useModals();
  return (
    <>
      {modalOpen ? <MemberModal /> : null}
      {famModalOpen ? <FamiliaModal /> : null}
      {agModalOpen ? <AgendaModal /> : null}
      {deleteConfirm ? <DeleteConfirmModal /> : null}
    </>
  );
}

export default function AdminShell() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const ActiveView = VIEWS[activeTab] || DashboardView;

  return (
    <ModalsProvider>
      <div className="shell">
        <Sidebar activeTab={activeTab} onChangeTab={setActiveTab} />
        <main className="main">
          <ActiveView />
        </main>
      </div>
      <ShellModals />
    </ModalsProvider>
  );
}
