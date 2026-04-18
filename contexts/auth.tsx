import { AuthUser, deleteUser, getSessionUser, loginUser, logoutUser, registerUser } from '@/db/queries';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getSessionUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.success) setUser(result.user);
    return result.success ? { success: true } : { success: false, error: result.error };
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await registerUser(name, email, password);
    if (result.success) setUser(result.user);
    return result.success ? { success: true } : { success: false, error: result.error };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteUser(user.id);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
