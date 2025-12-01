import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/api';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor del Contexto
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  // Sincronizar el estado con localStorage
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Si es un token falso, establecemos el usuario falso.
        if (token === 'dummy-auth-token-for-offline-mode') {
          setUser({ id: 99, name: 'Test Admin', role: { name: 'Admin' } });
          setIsAuthenticated(true);
          return;
        }

        // Si es un token real, intentamos obtener los datos del usuario.
        try {
          const response = await apiClient.get('/user');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Si el token no es válido, limpiamos todo.
          console.error("Token inválido, cerrando sesión.", error);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
          delete apiClient.defaults.headers.common['Authorization'];
        }
      } else {
        // Asegurarse de que todo esté limpio si no hay token.
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
      }
    };

    initAuth();
  }, [token]); // Depender solo de `token` para evitar re-ejecuciones innecesarias.
  
  // Función de Login
  const login = async (credentials) => {
    // 1. Pide el token
    const loginResponse = await apiClient.post('/login', credentials);
    const { token: newToken } = loginResponse.data;
    
    // 2. Guarda el token y configúralo en axios para la siguiente petición
    localStorage.setItem('authToken', newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // 3. Pide la información completa del usuario
    const userResponse = await apiClient.get('/user');
    const fullUser = userResponse.data;

    // 4. Actualiza el estado global
    setUser(fullUser);
    setToken(newToken); // Esto dispara el useEffect para la persistencia
    
    return fullUser; // Devuelve el usuario completo
  };
  
    // Función de Login de prueba (offline)
  const offlineLogin = () => {
    const dummyUser = {
        id: 99,
        name: 'Test Admin',
        role: { name: 'Admin' } // Estandarizado para que coincida con la estructura del Dashboard
    };
    const dummyToken = 'dummy-auth-token-for-offline-mode';
    localStorage.setItem('authToken', dummyToken);
    setUser(dummyUser);
    setToken(dummyToken);
  };

  // Función de Logout
  const logout = async () => {
    if (token && token !== 'dummy-auth-token-for-offline-mode') {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
        }
    }
    // Limpiar todo al cerrar sesión
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    offlineLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
