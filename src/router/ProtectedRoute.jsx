import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth(); // Incluir 'loading'

  // 0. Si está cargando, mostrar un indicador
  if (loading) {
    return <div>Loading...</div>; // O un spinner/componente de carga más sofisticado
  }

  // 1. Verificar si está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar si el rol está permitido (usando role_id)
  if (allowedRoles) {
    const userRoleId = user?.role_id;
    const hasAccess = allowedRoles.includes(userRoleId);

    if (!hasAccess) {
      // Si no tiene acceso, redirige a la página principal.
      // Podrías redirigir a una página de 'no autorizado' si lo prefieres.
      return <Navigate to="/" replace />;
    }
  }

  // 3. Si todo está en orden, renderizar el contenido
  return <Outlet />;
};

export default ProtectedRoute;
