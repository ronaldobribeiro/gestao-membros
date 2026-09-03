import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { checkAccess, getSession, onAuthStateChange, signInWithGoogle, signOut } from "../services/auth.service";
import { IDLE_LIMIT_MS } from "../config/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const idleTimerRef = useRef(null);
  const idleWatcherStarted = useRef(false);

  const handleLogout = useCallback(async () => {
    clearTimeout(idleTimerRef.current);
    await signOut();
  }, []);

  const resetIdleTimer = useCallback(() => {
    if (!session) return;
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      handleLogout();
    }, IDLE_LIMIT_MS);
  }, [session, handleLogout]);

  useEffect(() => {
    if (!session || idleWatcherStarted.current) return;
    idleWatcherStarted.current = true;
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((evt) => document.addEventListener(evt, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach((evt) => document.removeEventListener(evt, resetIdleTimer));
      clearTimeout(idleTimerRef.current);
      idleWatcherStarted.current = false;
    };
  }, [session, resetIdleTimer]);

  useEffect(() => {
    let active = true;

    async function init() {
      const currentSession = await getSession();
      if (!active) return;
      if (currentSession) {
        setCheckingAccess(true);
        const { authorized, isAdmin: admin } = await checkAccess(currentSession.user.email);
        if (!active) return;
        setCheckingAccess(false);
        if (!authorized) {
          setLoginError("A conta " + (currentSession.user.email || "") + " não está autorizada a acessar este sistema. Fale com o administrador para liberar seu acesso.");
          await signOut();
          setSession(null);
        } else {
          setSession(currentSession);
          setIsAdmin(admin);
        }
      } else {
        setSession(null);
      }
      setLoadingSession(false);
    }
    init();

    const subscription = onAuthStateChange(async (_event, newSession) => {
      if (newSession) {
        setCheckingAccess(true);
        const { authorized, isAdmin: admin } = await checkAccess(newSession.user.email);
        setCheckingAccess(false);
        if (!authorized) {
          setLoginError("A conta " + (newSession.user.email || "") + " não está autorizada a acessar este sistema. Fale com o administrador para liberar seu acesso.");
          setSession(null);
          await signOut();
          return;
        }
        setLoginError("");
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
      setSession(newSession);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setLoggingIn(true);
    setLoginError("");
    const { error } = await signInWithGoogle();
    if (error) {
      setLoggingIn(false);
      setLoginError(error.message || "Não foi possível iniciar o login com Google.");
    }
    // Em caso de sucesso o navegador e redirecionado ao Google; ao voltar,
    // onAuthStateChange assume a sessao automaticamente.
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAdmin,
        loadingSession,
        checkingAccess,
        loginError,
        loggingIn,
        handleGoogleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
