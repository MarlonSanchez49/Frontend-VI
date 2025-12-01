import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle, FaFire, FaSignOutAlt } from 'react-icons/fa';
import styles from './Dashboard.module.css';

// --- Datos de Simulación para el Resumen de Inventario ---
const inventorySummary = [
    { id: 2, name: 'Vodka Oddka', quantity: 17, status: 'Normal' },
    { id: 5, name: 'Buchanans Master 18 Años', quantity: 7, status: 'Bajo Stock' },
    { id: 4, name: 'Ron Caldas 700ML', quantity: 73, status: 'Normal' },
    { id: 1, name: 'Aguardiente Amarillo', quantity: 92, status: 'Normal' },
];

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Simulamos que no hay datos para mostrar en la gráfica
    const chartData = []; 
    
    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className={styles.dashboardContent}>
            {/* Header con información de usuario y logout */}
            <header className={styles.header}>
                <div className={styles.userControls}>
                    <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                    <span className={styles.userRole}>{user?.role?.name || 'Rol'}</span>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <FaSignOutAlt /> Cerrar sesión
                    </button>
                </div>
            </header>

            <section className={styles.contentGrid}>
                {/* Gráfico de Barras */}
                <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>Productos más vendidos (Cantidad)</h2>
                    <div className={styles.chartWrapper}>
                        {/* La simulación para "No hay datos de ventas para mostrar." */}
                        {chartData.length === 0 ? (
                            <div className={styles.noData}>No hay datos de ventas para mostrar.</div>
                        ) : (
                            // ... Lógica del gráfico si hubiera datos ...
                            null
                        )}
                    </div>
                </div>

                {/* Empleado del Mes */}
                <div className={styles.employeeCard}>
                    <h2 className={styles.employeeTitle}>Empleado del Mes</h2>
                    <div className={styles.employeeAvatar}>
                        <FaUserCircle />
                    </div>
                    <p className={styles.employeeName}>Nombre Empleado</p>
                    <p className={styles.employeeRole}>Vendedor Estrella</p>
                    <FaFire className={styles.employeeFireIcon} />
                </div>
            </section>

            {/* Sección de Resumen de Inventario */}
            <section className={styles.inventorySummary}>
                <h2 className={styles.summaryTitle}>Resumen de Inventario</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.summaryTable}>
                        <thead>
                            <tr>
                                <th>PRODUCTO</th>
                                <th>CANTIDAD</th>
                                <th>ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventorySummary.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[item.status.toLowerCase().replace(' ', '')]}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Dashboard; 