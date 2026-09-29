import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('stealthvault_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('stealthvault_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('stealthvault_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    // Store password hash (in production, this would be done server-side)
    const userWithPassword = {
      ...newUser,
      passwordHash: await hashPassword(password),
    };

    users.push(userWithPassword);
    localStorage.setItem('stealthvault_users', JSON.stringify(users));

    // Set current user
    setUser(newUser);
    localStorage.setItem('stealthvault_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get users from storage
    const users = JSON.parse(localStorage.getItem('stealthvault_users') || '[]');
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Set current user (without password)
    const { passwordHash, ...userWithoutPassword } = user;
    setUser(userWithoutPassword);
    localStorage.setItem('stealthvault_user', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stealthvault_user');
  };

  // Simple password hashing (in production, use bcrypt on server-side)
const hashPassword = async (password: string): Promise<string> => {
  if (!window.crypto || !window.crypto.subtle) {
    // Fallback simple hash (for development only)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash.toString();
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

  const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
