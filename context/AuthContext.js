"use client";

import { createContext, useContext, useState, useEffect } from "react";
import authService from "@/services/auth.service";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar la aplicación
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Función de login
  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const userData = await authService.getMe();
    setUser(userData);
    return response;
  };

  // Función de registro
  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    const userData = await authService.getMe();
    setUser(userData);
    return response;
  };

  // Función de logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Verificar si el usuario es Admin
  const isAdmin = () => {
    return user?.role === "Admin";
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
