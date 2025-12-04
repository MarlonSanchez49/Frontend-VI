import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { FaSignOutAlt } from 'react-icons/fa'; // Mantener FaSignOutAlt
import styles from './AccountingPage.module.css';
import accountingService from '../../services/accountingService'; // Importar el nuevo servicio
import paymentMethodService from '../../services/paymentMethodService'; // Importar el servicio de métodos de pago

const AccountingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sales, setSales] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);
    const [errorSales, setErrorSales] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
    const [errorPaymentMethods, setErrorPaymentMethods] = useState(null);

    const [selectedDate, setSelectedDate] = useState(new Date()); // Nuevo estado para la fecha seleccionada

    useEffect(() => {
        const fetchAccountingData = async () => {
            // Fetch Sales
            try {
                setLoadingSales(true);
                const salesResponse = await accountingService.getSales();
                setSales(salesResponse.data.data || salesResponse.data || []);
            } catch (err) {
                console.error("Error fetching sales:", err);
                setErrorSales("Error al cargar las ventas.");
            } finally {
                setLoadingSales(false);
            }

            // Fetch Payment Methods
            try {
                setLoadingPaymentMethods(true);
                const pmResponse = await paymentMethodService.getPaymentMethods();
                setPaymentMethods(pmResponse.data.data || pmResponse.data || []);
            } catch (err) {
                console.error("Error fetching payment methods:", err);
                setErrorPaymentMethods("Error al cargar los métodos de pago.");
            } finally {
                setLoadingPaymentMethods(false);
            }
        };
        fetchAccountingData();
    }, []); // El efecto se ejecuta una vez al montar

    // Función para calcular ingresos netos para una fecha específica
    const calculateRevenueForDate = (dateToFilter, allSales) => {
        if (!allSales || allSales.length === 0) return 0;

        const filterDayString = new Date(dateToFilter).toISOString().split('T')[0];

        const filteredSales = allSales.filter(sale => {
            const saleDateString = new Date(sale.created_at).toISOString().split('T')[0];
            return saleDateString === filterDayString;
        });

        return filteredSales.reduce((sum, sale) => sum + Number(sale.total), 0);
    };

    // Ventas filtradas para la tabla
    const getFilteredSalesForDisplay = () => {
        if (!sales || sales.length === 0) return [];
        const filterDayString = selectedDate.toISOString().split('T')[0];

        return sales.filter(sale => {
            const saleDateString = new Date(sale.created_at).toISOString().split('T')[0];
            return saleDateString === filterDayString;
        });
    };

    const filteredSalesForDisplay = getFilteredSalesForDisplay();
    const currentDailyRevenue = calculateRevenueForDate(selectedDate, sales);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // Combinar estados de carga y error
    const isLoading = loadingSales || loadingPaymentMethods;
    const isError = errorSales || errorPaymentMethods;

    if (isLoading) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar />
                <div className={styles.mainContent}>
                    <p>Cargando datos contables...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar />
                <div className={styles.mainContent}>
                    <p className={styles.errorMessage}>{isError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.pageTitle}>Contabilidad</h1>
                        <p className={styles.pageSubtitle}>Resumen financiero y gestión de flujo de caja</p>
                    </div>
                    <div className={styles.userControls}>
                        <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                        <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Cargo'}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <FaSignOutAlt /> Cerrar sesión
                        </button>
                    </div>
                </header>

                <section className={styles.transactionsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.listTitle}>Ventas del Día</h2>
                        <div className={styles.dateFilterContainer}>
                            <label htmlFor="dateFilter" className={styles.dateFilterLabel}>Filtrar por Fecha:</label>
                            <input
                                type="date"
                                id="dateFilter"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setSelectedDate(new Date(e.target.value + 'T00:00:00Z'));
                                }}
                                className={styles.dateFilterInput}
                            />
                        </div>
                    </div>
                    <div className={styles.totalDailyRevenue}>
                        <strong>Ingresos Netos del día seleccionado:</strong>{' '}
                        {Number(currentDailyRevenue).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.transactionsTable}>
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>DESCRIPCIÓN</th>
                                    <th>TOTAL</th>
                                    <th>MÉTODO PAGO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalesForDisplay.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>No hay ventas para la fecha seleccionada.</td>
                                    </tr>
                                ) : (
                                    filteredSalesForDisplay.map((sale) => {
                                        const paymentMethodName = paymentMethods.find(
                                            (pm) => pm.id === sale.metodo_pago_id
                                        )?.name || 'Desconocido';
                                        return (
                                            <tr key={sale.id}>
                                                <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                                                <td>Venta #{sale.id}</td>
                                                <td className={styles.income}>
                                                    {Number(sale.total).toLocaleString("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </td>
                                                <td>{paymentMethodName}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AccountingPage;
