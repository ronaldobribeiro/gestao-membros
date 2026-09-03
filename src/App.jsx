import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./state/AuthContext";
import { ToastProvider } from "./state/ToastContext";
import Toast from "./components/Toast";
import CadastroPublicoView from "./views/CadastroPublicoView";
import AdminGate from "./views/AdminGate";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/cadastro" element={<CadastroPublicoView />} />
        <Route
          path="/*"
          element={
            <AuthProvider>
              <AdminGate />
            </AuthProvider>
          }
        />
      </Routes>
      <Toast />
    </ToastProvider>
  );
}
