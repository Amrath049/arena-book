import { createContext, useContext, useState, ReactNode } from 'react';

interface Player {
  id: string;
  name: string;
  email: string;
  userType: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  player: Player | null;
  token: string | null;
  login: (token: string, player: Player) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [player, setPlayer] = useState<Player | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, newPlayer: Player) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newPlayer));
    setToken(newToken);
    setPlayer(newPlayer);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setPlayer(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, player, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
