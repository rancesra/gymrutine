import { createContext } from 'react'

// Contexto de la sesión. Lo llena AuthProvider y se lee con useAuth().
export const AuthContext = createContext(null)