import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { FaSignOutAlt, FaUsers, FaCheckSquare, FaChartLine, FaStar } from 'react-icons/fa';
import styles from './EmployeesPage.module.css';

// --- Datos de Simulación ---
const employeeData = [
  { id: 1, name: 'john doe', role: 'Gerente', sales: 5.88, hours: 155, status: 'Vacaciones' },
  { id: 2, name: 'david morrison', role: 'Vendedor Senior', sales: 18.88, hours: 126, status: 'Activo' },
  { id: 3, name: 'kevin ryan', role: 'Vendedor Junior', sales: 6.80, hours: 151, status: 'Activo' },
  { id: 4, name: 'don romer', role: 'Vendedor Junior', sales: 8.34, hours: 158, status: 'Vacaciones' },
  { id: 5, name: 'derek powell', role: 'Vendedor Junior', sales: 5.47, hours: 144, status: 'Activo' },
  { id: 6, name: 'david russell', role: 'Gerente', sales: 14.11, hours: 122, status: 'Activo' },
];

const statsData = [
    { label: 'Total Empleados', value: '10', icon: FaUsers, color: 'blue', trend: '+5.0%' },
    { label: 'Empleados Activos', value: '6', icon: FaCheckSquare, color: 'green', trend: '60%' },
    { label: 'Ventas Totales (Mes)', value: '$ 117.925.484', icon: FaChartLine, color: 'orange', trend: '-10.3%' },
    { label: 'Mejor Vendedor', value: 'david', subValue: 'Ventas: $18.875.97', icon: FaStar, color: 'purple' },
];


// Componente de Tarjeta de Estadística (para mayor claridad)
const StatCard = ({ label, value, subValue, icon: Icon, color, trend }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
        <Icon className={styles.statIcon} />
        <div className={styles.statContent}>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{value}</p>
            {subValue && <p className={styles.statSubValue}>{subValue}</p>}
        </div>
    </div>
);

const EmployeesPage = () => {
  const [employees, setEmployees] = useState(employeeData);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleView = (id) => {
    alert(`Ver detalles del empleado ID: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar este empleado?`)) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.dashboardLayout}>
      
      {/* 1. Navbar Lateral Izquierda */}
      <Sidebar />

      {/* 2. Contenido Principal */}
      <div className={styles.mainContent}>
        
        {/* Header Superior */}
        <header className={styles.header}>
            <div className={styles.titleGroup}>
                <h1 className={styles.pageTitle}>Gestión de Empleados</h1>
                <p className={styles.pageSubtitle}>Información de rendimiento y datos del personal</p>
            </div>
            <div className={styles.userControls}>
                <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                <span className={styles.userRole}>{user?.role?.name || 'Rol'}</span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </header>

        {/* 3. Tarjetas de Estadísticas */}
        <section className={styles.statsGrid}>
            {statsData.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </section>

        {/* 4. Listado de Personal */}
        <section className={styles.employeeListSection}>
            <h2 className={styles.listTitle}>Listado de Personal</h2>
            
            <div className={styles.tableContainer}>
                <table className={styles.employeeTable}>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>ROL</th>
                            <th>VENTAS</th>
                            <th>HORAS</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id}>
                                <td className={styles.employeeName}>{emp.name}</td>
                                <td>{emp.role}</td>
                                <td className={styles.salesValue}>${emp.sales}M</td>
                                <td>{emp.hours} hrs</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[emp.status.toLowerCase()]}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className={styles.actions}>
                                    <button className={styles.actionButton} onClick={() => handleView(emp.id)}>
                                        Ver
                                    </button>
                                    <span className={styles.actionDivider}>|</span>
                                    <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(emp.id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
        
      </div>
    </div>
  );
};

export default EmployeesPage;