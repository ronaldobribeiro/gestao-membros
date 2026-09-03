import { useAuth } from "../state/AuthContext";
import { DataProvider } from "../state/DataContext";
import LoginView from "./LoginView";
import AdminShell from "./AdminShell";

export default function AdminGate() {
  const { loadingSession, checkingAccess, session } = useAuth();

  if (loadingSession) return <div className="loading-wrap">Carregando…</div>;
  if (checkingAccess) return <div className="loading-wrap">Verificando acesso…</div>;
  if (!session) return <LoginView />;

  return (
    <DataProvider>
      <AdminShell />
    </DataProvider>
  );
}
