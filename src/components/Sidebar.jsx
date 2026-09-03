import { useState } from "react";
import { useAuth } from "../state/AuthContext";
import logoIcon from "../assets/logo_icon.png";
import { DashboardIcon, TabelaIcon, MinisteriosIcon, FamiliasIcon, AgendamentosIcon, ImpressaoIcon, LogoutIcon, ToggleIcon } from "./icons/NavIcons";

const TABS = [
  { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { id: "tabela", label: "Tabela Analítica", Icon: TabelaIcon },
  { id: "ministerios", label: "Ministérios", Icon: MinisteriosIcon },
  { id: "familias", label: "Famílias", Icon: FamiliasIcon },
  { id: "agendamentos", label: "Agendamentos", Icon: AgendamentosIcon },
  { id: "impressao", label: "Impressão", Icon: ImpressaoIcon },
];

export default function Sidebar({ activeTab, onChangeTab }) {
  const { session, handleLogout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("gm_sidebar_collapsed") === "1"; } catch (e) { return false; }
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem("gm_sidebar_collapsed", next ? "1" : "0"); } catch (e) { /* ignora */ }
      return next;
    });
  }

  return (
    <aside className={"sidebar gm-noprint" + (collapsed ? " collapsed" : "")}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-mark"><img src={logoIcon} alt="Logo IPI Cavallari" /></div>
          <div className="brand-text">
            <div className="brand-name">Gestão de Membros</div>
            <div className="brand-sub">IPI CAVALLARI</div>
          </div>
        </div>
        <button type="button" className="sidebar-toggle" title={collapsed ? "Expandir menu" : "Recolher menu"} onClick={toggleCollapsed}>
          <ToggleIcon />
        </button>
      </div>

      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={"nav-item " + (activeTab === t.id ? "active" : "")}
          title={t.label}
          onClick={() => onChangeTab(t.id)}
        >
          <span className="nav-icon"><t.Icon /></span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}

      <div className="sidebar-footer">
        <div className="user-chip">{session?.user?.email}</div>
        <button type="button" className="btn btn-ghost btn-sm" title="Sair" onClick={handleLogout}>
          <span className="nav-icon"><LogoutIcon /></span>
          <span className="btn-label">Sair</span>
        </button>
      </div>
    </aside>
  );
}
