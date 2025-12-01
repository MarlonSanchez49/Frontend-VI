import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useAuth } from '../hooks/useAuth';

const adminLinks = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Empleados', href: '/admin/employees' },
  { name: 'Inventario', href: '/admin/inventory' },
  { name: 'Contabilidad', href: '/admin/accounting' },
];

const Sidebar = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true }); // Asegura la redirección inmediata
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.title}>Mi Empresa</div>
      <nav className={styles.nav}>
        <div>
          {adminLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
