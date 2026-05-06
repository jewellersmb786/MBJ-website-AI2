import React, { createContext, useContext, useState } from 'react';

const UserPhoneContext = createContext({ phone: '', setPhone: () => {}, clearPhone: () => {} });

export function UserPhoneProvider({ children }) {
  const [phone, setPhoneState] = useState(() => {
    try {
      const saved = localStorage.getItem('user_phone');
      if (saved) return saved;
      // Migrate from legacy wishlist_phone key
      const legacy = localStorage.getItem('wishlist_phone');
      if (legacy) {
        localStorage.setItem('user_phone', legacy);
        localStorage.removeItem('wishlist_phone');
        return legacy;
      }
      return '';
    } catch { return ''; }
  });

  const setPhone = (p) => {
    const clean = p ? String(p).replace(/[^0-9]/g, '') : '';
    setPhoneState(clean);
    try {
      if (clean) localStorage.setItem('user_phone', clean);
      else localStorage.removeItem('user_phone');
    } catch {}
  };

  const clearPhone = () => setPhone('');

  return (
    <UserPhoneContext.Provider value={{ phone, setPhone, clearPhone }}>
      {children}
    </UserPhoneContext.Provider>
  );
}

export const useUserPhone = () => useContext(UserPhoneContext);
