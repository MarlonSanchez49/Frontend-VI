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
import Inventory from '../views/admin/Inventory';
import AccountingPage from '../views/admin/AccountingPage';

// Vistas de Empleado
import PosPage from '../views/pos/PosPage';

// Página de Not Found
import NotFoundPage from '../views/NotFoundPage';

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
    // Rutas protegidas para Administradores
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['Admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'employees', element: <Employees /> },
          { path: 'inventory', element: <Inventory /> },
          { path: 'accounting', element: <AccountingPage /> },
           // Redirección por defecto para /admin
          { path: '', element: <Navigate to="dashboard" replace /> }
        ]
      }
    ]
  },
  {
    // Rutas protegidas para Empleados
    path: '/pos',
    element: <ProtectedRoute allowedRoles={['Empleado', 'Admin', 'worker']} />, // Permitimos a Admin y Worker también acceder al POS
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
