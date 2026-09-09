import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

const STORAGE_USER = 'dh_user';
const STORAGE_TOKEN = 'dh_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_USER);
    const savedToken = localStorage.getItem(STORAGE_TOKEN);
    if (!savedUser || !savedToken) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setToken(savedToken);
    } catch {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      setLoading(false);
      return;
    }
    authApi.me().then(({ data }) => {
      const synced = { ...data, wallet_balance: data.wallet_balance ?? 0 };
      localStorage.setItem(STORAGE_USER, JSON.stringify(synced));
      setUser(synced);
    }).catch(() => {
      localStorage.removeItem(STORAGE_USER);
      localStorage.removeItem(STORAGE_TOKEN);
      setToken(null);
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const loginUser = (userData, realToken) => {
    const userWithWallet = { ...userData, wallet_balance: userData.wallet_balance ?? 0 };
    if (realToken) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(userWithWallet));
      localStorage.setItem(STORAGE_TOKEN, realToken);
      setToken(realToken);
    }
    setUser(userWithWallet);
  };

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    const backendUser = { ...data.user, wallet_balance: data.user.wallet_balance ?? 0 };
    loginUser(backendUser, data.access_token);
    return backendUser;
  };

  const register = async (data) => {
    const { data: result } = await authApi.register(data);
    const backendUser = { ...result.user, wallet_balance: result.user.wallet_balance ?? 0 };
    loginUser(backendUser, result.access_token);
    return backendUser;
  };

  const updateWallet = (amount) => {
    if (!user) return;
    const updated = { ...user, wallet_balance: amount };
    localStorage.setItem(STORAGE_USER, JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, login, register, updateWallet, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
