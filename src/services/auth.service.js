import { sb } from "../api/supabase";
import { ALLOWLIST_TABLE } from "../config/constants";

export async function checkAccess(email) {
  if (!email) return { authorized: false, isAdmin: false };
  try {
    const { data, error } = await sb.from(ALLOWLIST_TABLE).select("email, admin").ilike("email", email).maybeSingle();
    if (error) {
      console.error("Erro ao verificar autorização de acesso:", error.message);
      return { authorized: false, isAdmin: false };
    }
    if (!data) return { authorized: false, isAdmin: false };
    return { authorized: true, isAdmin: !!data.admin };
  } catch (e) {
    console.error("Erro ao verificar autorização de acesso:", e);
    return { authorized: false, isAdmin: false };
  }
}

export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session || null;
}

export function onAuthStateChange(callback) {
  const { data } = sb.auth.onAuthStateChange(callback);
  return data.subscription;
}

export async function signInWithGoogle() {
  return sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
}

export async function signOut() {
  return sb.auth.signOut();
}
