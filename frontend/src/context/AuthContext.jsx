import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('dh_user');
    const savedToken = sessionStorage.getItem('dh_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        sessionStorage.removeItem('dh_user');
        sessionStorage.removeItem('dh_token');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, realToken) => {
    const userWithWallet = { ...userData, wallet_balance: userData.wallet_balance ?? 0 };
    if (realToken) {
      sessionStorage.setItem('dh_user', JSON.stringify(userWithWallet));
      sessionStorage.setItem('dh_token', realToken);
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
    sessionStorage.setItem('dh_user', JSON.stringify(updated));
    setUser(updated);
  };

  const logout = () => {
    sessionStorage.removeItem('dh_user');
    sessionStorage.removeItem('dh_token');
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
