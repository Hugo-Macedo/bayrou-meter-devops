import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("bm_token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    let stop = false;
    (async () => {
      if (!token) return setLoading(false);
      try {
        const me = await api.me();
        if (!stop) setUser(me.user);
      } catch {
        localStorage.removeItem("bm_token");
        setToken("");
      } finally {
        if (!stop) setLoading(false);
      }
    })();
    return () => { stop = true; };
  }, [token]);

  const login = async ({ email, pseudo }) => {
    const { token, user : _user } = await api.login({ email, pseudo });
    localStorage.setItem("bm_token", token);
    setToken(token);
    try {
      const me = await api.me();
      setUser(me.user);
    } catch {
      setUser(_user);
    }
  };

  const signup = async ({ email, pseudo }) => {
    await api.signup({ email, pseudo });
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem("bm_token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ token, user, loading, login, signup, logout, isSignedIn: !!user }}>
      {children}
    </AuthCtx.Provider>
  );
}
