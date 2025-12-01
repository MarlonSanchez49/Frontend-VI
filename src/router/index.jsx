import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import AdminLayout from '../layouts/AdminLayout';

// Vistas Públicas
import LoginPage from '../views/LoginPage';

// Vistas de Admin
import AdminDashboard from '../views/admin/Dashboard';
import Employees from '../views/admin/Employees';
import Inventory from '../views/admin/Inventory';
import Accounting from '../views/admin/Accounting';

// Vistas de Empleado
import PosPage from '../views/pos/PosPage';

// Página de Not Found
import NotFoundPage from '../views/NotFoundPage';

// Componente para la redirección inicial
const Root = () => {
    // Aquí puedes agregar lógica para redirigir basado en el estado de autenticación
    // Por ahora, redirigimos siempre a /login si no hay una ruta específica.
    return <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
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
          { path: 'accounting', element: <Accounting /> },
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
