import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role?.name || user?.role || '';

  // 1. Verificar si está autenticado
  if (!isAuthenticated) {
    // Redirigir a login, guardando la ubicación a la que intentaba acceder
    return <Navigate to="/login" replace />;
  }

  // 2. Verificar si el rol está permitido (si se especificaron roles)
  if (allowedRoles) {
    const userRole = user?.role?.name || user?.role || '';
    // Comparamos en minúsculas para ser más robustos (ej: 'Admin' vs 'admin')
    const hasAccess = allowedRoles.some(allowed => allowed.toLowerCase() === userRole.toLowerCase());

    if (!hasAccess) {
      // Si el usuario no tiene el rol permitido, lo redirigimos a la raíz.
      return <Navigate to="/" replace />;
    }
  }

  // 3. Si todo está en orden, renderizar el contenido de la ruta
  return <Outlet />;
};

export default ProtectedRoute;
