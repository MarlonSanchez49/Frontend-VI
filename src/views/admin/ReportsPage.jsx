import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // AJUSTA ESTA RUTA si es necesario
import { useAuth } from '../../hooks/useAuth';
import { FaSignOutAlt, FaBook, FaMoneyBillWave, FaBalanceScale, FaChartBar, FaCalendarAlt } from 'react-icons/fa';
import styles from './ReportsPage.module.css';

// --- Datos de Simulación ---
const accountingStats = [
    { label: 'Ingresos Netos', value: '$ 12.5M', icon: FaChartBar, color: 'green' },
    { label: 'Pasivos Totales', value: '$ 4.2M', icon: FaMoneyBillWave, color: 'red' },
    { label: 'Balance General', value: 'Positivo', icon: FaBalanceScale, color: 'blue' },
    { label: 'Último Cierre', value: 'Q3 2025', icon: FaCalendarAlt, color: 'orange' },
];

const recentTransactions = [
    { id: 1, date: '2025-11-28', description: 'Pago a Proveedor A', amount: '-$ 3,500.000', type: 'expense' },
    { id: 2, date: '2025-11-27', description: 'Venta Mayorista', amount: '+$ 8,150.000', type: 'income' },
    { id: 3, date: '2025-11-27', description: 'Pago de Nómina', amount: '-$ 4,700.000', type: 'expense' },
    { id: 4, date: '2025-11-26', description: 'Venta Minorista', amount: '+$ 950.000', type: 'income' },
];

// Componente de Tarjeta de Estadística
// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
        <Icon className={styles.statIcon} />
        <div>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{value}</p>
        </div>
    </div>
);

const AccountingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

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
                
                {/* Header Superior con Logout */}
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.pageTitle}>Contabilidad</h1>
                        <p className={styles.pageSubtitle}>Resumen financiero y gestión de flujo de caja</p>
                    </div>
                    
                    <div className={styles.userControls}>
                        <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                        <span className={styles.userRole}>{user?.role?.name || 'Rol'}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <FaSignOutAlt />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </header>

                {/* 3. Tarjetas de Estadísticas */}
                <section className={styles.statsGrid}>
                    {accountingStats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </section>

                {/* 4. Transacciones Recientes */}
                <section className={styles.transactionsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.listTitle}>Transacciones Recientes</h2>
                        <button className={styles.reportButton}>
                            Ver Reporte Financiero
                        </button>
                    </div>
                    
                    <div className={styles.tableContainer}>
                        <table className={styles.transactionsTable}>
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>DESCRIPCIÓN</th>
                                    <th>MONTO</th>
                                    <th>TIPO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td>{tx.description}</td>
                                        <td className={styles[tx.type]}>{tx.amount}</td>
                                        <td>{tx.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
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

export default AccountingPage;