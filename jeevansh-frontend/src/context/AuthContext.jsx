import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jeevansh_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    const savedDonor = localStorage.getItem('jeevansh_donor');
    if (savedDonor) {
      try { return { ...JSON.parse(savedDonor), role: 'donor' }; } catch { return null; }
    }
    const savedBank = localStorage.getItem('jeevansh_bank');
    if (savedBank) {
      try { return { ...JSON.parse(savedBank), role: 'bank' }; } catch { return null; }
    }
    return null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('jeevansh_user', JSON.stringify(userData));
    if (userData.role === 'donor') {
      localStorage.setItem('jeevansh_donor', JSON.stringify(userData));
    }
    if (userData.role === 'bank') {
      localStorage.setItem('jeevansh_bank', JSON.stringify(userData));
    }
  };

  const loginDonor = (data) => {
    const donorUser = { ...(data.donor || data), role: 'donor', token: data.token };
    login(donorUser);
  };

  const loginBank = (data) => {
    const bankUser = { ...(data.bank || data), role: 'bank', token: data.token };
    login(bankUser);
  };

  const updateUser = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      localStorage.setItem('jeevansh_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jeevansh_user');
    localStorage.removeItem('jeevansh_donor');
    localStorage.removeItem('jeevansh_bank');
  };

  const donor = user?.role === 'donor' ? user : null;
  const bank = user?.role === 'bank' ? user : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated: !!user,
        login,
        loginDonor,
        loginBank,
        updateUser,
        logout,
        donor,
        bank,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => useContext(AuthContext);