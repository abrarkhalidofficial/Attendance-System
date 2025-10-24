import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);