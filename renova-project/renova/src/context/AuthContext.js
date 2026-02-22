import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API = process.env.REACT_APP_API_URL || "https://renova-119i.vercel.app/api";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children, onLogin, onLogout }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("renova_token"));
  const [loading, setLoading] = useState(true);

  // On mount, verify existing token
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("renova_token");
        setToken(null);
        setLoading(false);
      });
  }, [token]);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    localStorage.setItem("renova_token", data.token);
    setToken(data.token);
    setUser(data.user);
    if (onLogin) onLogin(data.user);
    return data;
  }, [onLogin]);

  const login = useCallback(async ({ email, password }) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("renova_token", data.token);
    setToken(data.token);
    setUser(data.user);
    if (onLogin) onLogin(data.user);
    return data;
  }, [onLogin]);

  const logout = useCallback(() => {
    localStorage.removeItem("renova_token");
    setToken(null);
    setUser(null);
    if (onLogout) onLogout();
  }, [onLogout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
