import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';

// Vistas Públicas
import MainPage from '../views/MainPage';
import LoginPage from '../views/LoginPage';

// Vistas de Admin
import AdminDashboard from '../views/admin/Dashboard';
import Employees from '../views/admin/Employees';
import InventoryPage from '../views/admin/InventoryPage';
import AccountingPage from '../views/admin/AccountingPage';

// Vistas de Empleado
import PosPage from '../views/pos/PosPage';

// Página de Not Found
import NotFoundPage from '../views/NotFoundPage';
import AppRedirect from './AppRedirect';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/app-redirect',
    element: <AppRedirect />,
  },
  {
    // Rutas protegidas para Administradores
    path: '/admin',
    element: <ProtectedRoute allowedRoles={[1]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'employees', element: <Employees /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'accounting', element: <AccountingPage /> },
           // Redirección por defecto para /admin
          { path: '', element: <Navigate to="dashboard" replace /> }
        ]
      }
    ]
  },
  {
    // Rutas protegidas para Empleados y Admins
    path: '/pos',
    element: <ProtectedRoute allowedRoles={[2, 1]} />, // Empleado (2), Admin (1)
    children: [
        { path: '', element: <PosPage /> }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />,
  }
]);

export default router;
