import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { connectSocket, disconnectSocket } from "../socket/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      connectSocket(storedToken);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, token } = res.data;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    setUser(user);
    setToken(token);
    connectSocket(token);

    return user;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    const { user, token } = res.data;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);

    setUser(user);
    setToken(token);
    connectSocket(token);

    return user;
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);