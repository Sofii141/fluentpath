import { createContext, useContext, useCallback } from "react";
import { useLocalStorage } from "../lib/useLocalStorage";
import { api } from "../lib/api";

const AuthContext = createContext(null);

/** Holds the logged-in user + token, persisted so you stay signed in. */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useLocalStorage("englishup.auth", { token: null, user: null });

  const register = useCallback(async (email, password, name) => {
    const { token, user } = await api.register(email, password, name);
    setAuth({ token, user });
    return user;
  }, [setAuth]);

  const login = useCallback(async (email, password) => {
    const { token, user } = await api.login(email, password);
    setAuth({ token, user });
    return user;
  }, [setAuth]);

  const logout = useCallback(() => setAuth({ token: null, user: null }), [setAuth]);

  return (
    <AuthContext.Provider value={{ ...auth, isAuthed: !!auth.token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
