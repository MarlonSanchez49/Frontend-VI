import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

import logo from '../../public/logo.png'; // Asegúrate de tener logo.png en src/assets/
// Importar los íconos de la barra lateral
import { 
    FaChartBar, // Gráfico para Dashboard
    FaUsers,    // Personas para Empleados
    FaBox,      // Caja para Inventario
    FaBook,     // Libro para Contabilidad
    FaChartPie, // Gráfico para Reportes
    FaQuestionCircle, // Ícono para Ayuda
} from 'react-icons/fa';

// Definición de enlaces y sus íconos
const adminLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: FaChartBar, title: 'Dashboard' },
  { name: 'Empleados', href: '/admin/employees', icon: FaUsers, title: 'Empleados' },
  { name: 'Inventario', href: '/admin/inventory', icon: FaBox, title: 'Inventario' },
  { name: 'Contabilidad', href: '/admin/accounting', icon: FaBook, title: 'Contabilidad' },
];

const Sidebar = () => {
  return (
    <div className={styles.sidebar}>
      
      {/* 1. Logo 'V' */}
      <div className={styles.logoContainer}>
        <NavLink to="/admin/dashboard" title="VertexInventory" className={styles.logoLink}>
            <img src={logo} alt="VertexInventory Logo" className={styles.logoIcon} />
        </NavLink>
      </div>

      {/* 2. Navegación Principal */}
      <nav className={styles.nav}>
        {adminLinks.map((link) => (
          // Usamos 'link.icon' para renderizar el componente de ícono
          <NavLink
            key={link.name}
            to={link.href}
            title={link.title}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <link.icon />
          </NavLink>
        ))}
      </nav>
      
      {/* 3. Botón/Sección de Alerta/Ayuda (Rojo en la parte inferior) */}
      <div className={styles.helpContainer}>
        {/* Link a WhatsApp (usar .env con VITE_WHATSAPP_NUMBER) */}
        {(() => {
          const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '573107899187';
          const DEFAULT_MESSAGE = encodeURIComponent('Hola, necesito ayuda.');
          const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`;
          return (
            <a href={waLink} target="_blank" rel="noreferrer" title="Ayuda / Alerta" className={styles.helpItem}>
              <FaQuestionCircle />
            </a>
          );
        })()}
      </div>
      
      {/* NOTA: El botón 'Cerrar Sesión' se traslada al Header Superior en el diseño de íconos. */}
    </div>
  );
};

export default Sidebar;