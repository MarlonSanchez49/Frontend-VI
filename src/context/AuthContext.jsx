import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/api';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor del Contexto
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          // Si es un token real, intentamos obtener los datos del usuario.
          const response = await apiClient.get('/user');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Si el token no es válido, limpiamos todo.
          console.error("Token inválido, cerrando sesión.", error);
          localStorage.removeItem('authToken');
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []); // <-- Se ejecuta solo una vez al montar el componente

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      // 1. Pide el token
      const loginResponse = await apiClient.post('/login', credentials);
      console.log('Respuesta completa del login:', loginResponse.data); // DEBUG
      const { token: newToken } = loginResponse.data;
      
      // 2. Guarda el token y configúralo en axios
      localStorage.setItem('authToken', newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // 3. Pide la información del usuario
      const userResponse = await apiClient.get('/user');
      const fullUser = userResponse.data;

      // 4. Actualiza el estado global
      setUser(fullUser);
      setIsAuthenticated(true);
      
      return fullUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
        }
    }
    // Limpiar todo al cerrar sesión
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  }), [user, isAuthenticated, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
