import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente de redirección post-login.
 * Este componente se encarga de redirigir al usuario a su dashboard
 * correspondiente una vez que el estado de autenticación se ha cargado.
 */
const AppRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Si el estado de autenticación aún está cargando, no hacer nada todavía.
  // Podríamos mostrar un spinner aquí si quisiéramos.
  if (loading) {
    return <div>Loading...</div>;
  }

  // Si por alguna razón el usuario no está autenticado en este punto,
  // lo enviamos de vuelta a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir basado en el role_id.
  if (user?.role_id === 1) { // 1 = Admin
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // Para cualquier otro rol (ej. 2 = Empleado), redirigir al POS.
  return <Navigate to="/pos" replace />;
};

export default AppRedirect;
