import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/productService';
import employeeService from '../../services/employeeService';
import salesService from '../../services/salesService'; // Cambiado a salesService
import reportsService from '../../services/reportsService';
import { FaSignOutAlt, FaExclamationTriangle } from 'react-icons/fa'; // Corregido: Eliminada importación duplicada
import MovementsChart from '../../components/admin/MovementsChart'; // Import MovementsChart
import styles from './Dashboard.module.css';

// --- Helper para normalizar la respuesta de la API ---
const getDataFromResponse = (response) => {
    if (response && response.data) {
        return response.data.data || response.data || [];
    }
    return [];
};

// --- Componente Modal para Detalles del Empleado ---
const StaffDetailModal = ({ user, onClose, onUpdateStatus }) => {
    if (!user) return null;

    const handleStatusChange = (e) => {
        onUpdateStatus(user.id, e.target.value);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.modalCloseButton}>&times;</button>
                <h2>Detalles del Empleado</h2> 
                <div className={styles.modalBody}>
                    <div className={styles.modalInfoRow}>
                        <span>Nombre:</span> <strong>{user.name}</strong>
                    </div>
                    <div className={styles.modalInfoRow}>
                        <span>Cargo:</span> <strong>{user.position || 'N/A'}</strong>
                    </div>
                    <div className={`${styles.modalInfoRow} ${styles.modalField}`}>
                        <label htmlFor="status">Estado:</label>
                        <select id="status" value={user.status} onChange={handleStatusChange} className={styles.statusSelect}>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Componente para Diálogo de Confirmación ---
const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContent} ${styles.confirmDialog}`}>
                <p>{message}</p>
                <div className={styles.confirmButtons}>
                    <button onClick={onConfirm} className={styles.confirmButtonYes}>Sí, eliminar</button>
                    <button onClick={onCancel} className={styles.confirmButtonNo}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente para la Lista de Personal ---
const StaffList = ({ staff, onView, onDelete }) => (
    <section className={styles.staffSection}>
        <h2 className={styles.summaryTitle}>Gestión de Personal</h2>
        <div className={styles.tableContainer}>
            <table className={styles.summaryTable}>
                <thead>
                    <tr>
                        <th>NOMBRE</th>
                        <th>CARGO</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.position || 'N/A'}</td>
                            <td>
                                <span className={`${styles.statusBadge} ${styles[employee.status?.toLowerCase() || 'inactivo']}`}>
                                    {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className={styles.actionButtons}>
                                <button onClick={() => onView(employee)} className={styles.viewButton}>Ver</button>
                                <button onClick={() => onDelete(employee)} className={styles.deleteButton}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
);

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // --- Estados para los datos del dashboard ---
    const [staffData, setStaffData] = useState([]);
    const [inventorySummaryData, setInventorySummaryData] = useState([]);
    const [lowStockCount, setLowStockCount] = useState(0);
    
    // Estados para el gráfico de productos más vendidos por mes
    const [bestSellingByMonth, setBestSellingByMonth] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1, // Mes actual (1-12)
        year: new Date().getFullYear(),   // Año actual
    });
    const [chartLoading, setChartLoading] = useState(true);
    
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    // --- Estados para la paginación del inventario ---
    const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
    const INVENTORY_ITEMS_PER_PAGE = 10;

    // --- Estados para la paginación de personal ---
    const [staffCurrentPage, setStaffCurrentPage] = useState(1);
    const STAFF_PER_PAGE = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar empleados
                const employeesResponse = await employeeService.getEmployees();
                setStaffData(getDataFromResponse(employeesResponse));

                // Cargar productos para el resumen
                const productsResponse = await productService.getProducts();
                const products = getDataFromResponse(productsResponse);
                setInventorySummaryData(products);
                
                // Calcular productos con bajo stock desde la lista de productos ya obtenida
                const LOW_STOCK_THRESHOLD = 10; // Puedes ajustar este valor
                const lowStockProducts = products.filter(p => p.stock < LOW_STOCK_THRESHOLD);
                setLowStockCount(lowStockProducts.length);

            } catch (error) {
                console.error("Error al cargar los datos del dashboard:", error);
                const errorMessage = error.response?.data?.message || error.message || "No se pudieron cargar los datos. Revise la conexión con el servidor.";
                setError(`Error: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // useEffect para cargar los datos del gráfico cuando cambia la fecha
    useEffect(() => {
        const fetchChartData = async () => {
            setChartLoading(true);
            try {
                // 1. Obtener todas las ventas
                const response = await salesService.getSales();
                const allSales = getDataFromResponse(response);

                // DEBUG: Muestra todas las ventas recibidas de la API
                console.log("Ventas recibidas de la API:", allSales);

                // 2. Filtrar ventas por el mes y año seleccionados
                const filteredSales = allSales.filter(sale => {
                    const saleDate = new Date(sale.created_at);
                    return saleDate.getFullYear() === selectedDate.year && (saleDate.getMonth() + 1) === selectedDate.month;
                });

                // DEBUG: Muestra las ventas después de filtrar por fecha
                console.log(`Ventas filtradas para ${selectedDate.month}/${selectedDate.year}:`, filteredSales);

                // 3. Procesar los datos para agregar las cantidades de productos
                const productQuantities = {};
                filteredSales.forEach(sale => { 
                    // Corregido: Buscar productos en 'sale_products' y asegurarse de que exista.
                    const productsInSale = sale.sale_products || sale.products || [];
                    
                    productsInSale.forEach(item => {
                        // Lógica más robusta para encontrar el nombre del producto
                        const productName = item.product?.name || item.name; // Intenta item.product.name, si no, item.name
                        const quantity = item.quantity;

                        if (productName && quantity) {
                            productQuantities[productName] = (productQuantities[productName] || 0) + Number(quantity);
                        }
                    });
                });

                // 4. Convertir el objeto a un array y ordenar
                const sortedProducts = Object.keys(productQuantities)
                    .map(name => ({
                        name: name,
                        total_quantity: productQuantities[name]
                    }))
                    .sort((a, b) => b.total_quantity - a.total_quantity);

                // DEBUG: Imprimir los datos procesados para ver qué se enviará a la gráfica
                console.log("Datos procesados para la gráfica:", sortedProducts);

                setBestSellingByMonth(sortedProducts.slice(0, 10)); // Mostrar los 10 más vendidos
            } catch (error) {
                console.error("Error al cargar los productos más vendidos del mes:", error);
                setBestSellingByMonth([]); // Limpiar datos en caso de error
            } finally {
                setChartLoading(false);
            }
        };
        fetchChartData();
    }, [selectedDate]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    // --- Handlers para el modal de personal ---
    const handleViewStaff = (employee) => {
        setSelectedStaff(employee);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedStaff(null);
    };

    const handleUpdateStatus = async (employeeId, newStatus) => {
        try {
            const employeeToUpdate = staffData.find(emp => emp.id === employeeId);
            if (!employeeToUpdate) return;

            // 1. Preparamos los datos a enviar.
            const updatedData = { ...employeeToUpdate, status: newStatus };

            // 2. Llamamos al servicio para actualizar en el backend.
            await employeeService.updateEmployee(employeeId, updatedData);

            // 3. Actualizamos el estado local para reflejar el cambio.
            setStaffData(staffData.map(emp => (emp.id === employeeId ? updatedData : emp)));
            setSelectedStaff(updatedData); // Actualiza también el estado del modal si está abierto
        } catch (error) {
            console.error("Error al actualizar el estado del empleado:", error);
        }
    };

    // --- Handlers para la eliminación ---
    const handleDeleteClick = (employee) => {
        setStaffToDelete(employee);
    };

    const handleConfirmDelete = async () => {
        try {
            await employeeService.deleteEmployee(staffToDelete.id);
            setStaffData(staffData.filter(emp => emp.id !== staffToDelete.id));
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
        }
        setStaffToDelete(null); 
    };

    const handleCancelDelete = () => {
        setStaffToDelete(null);
    };

    // Preparar datos y opciones para la gráfica por separado
    const chartData = {
        labels: bestSellingByMonth.map(p => p.name),
        datasets: [
            {
                label: 'Cantidad Vendida',
                data: bestSellingByMonth.map(p => p.total_quantity),
                backgroundColor: bestSellingByMonth.map((_, index) => `hsla(${index * 40}, 70%, 60%, 0.6)`),
                borderColor: bestSellingByMonth.map((_, index) => `hsla(${index * 40}, 70%, 60%, 1)`),
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                },
                max: 100,
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    };

    // --- Lógica de paginación para el inventario ---
    const inventoryTotalPages = Math.ceil(inventorySummaryData.length / INVENTORY_ITEMS_PER_PAGE);
    const inventoryStartIndex = (inventoryCurrentPage - 1) * INVENTORY_ITEMS_PER_PAGE;
    const inventoryEndIndex = inventoryStartIndex + INVENTORY_ITEMS_PER_PAGE;
    const paginatedInventory = inventorySummaryData.slice(inventoryStartIndex, inventoryEndIndex);

    // --- Lógica de paginación para el personal ---
    const staffTotalPages = Math.ceil(staffData.length / STAFF_PER_PAGE);
    const staffStartIndex = (staffCurrentPage - 1) * STAFF_PER_PAGE;
    const staffEndIndex = staffStartIndex + STAFF_PER_PAGE;
    const paginatedStaff = staffData.slice(staffStartIndex, staffEndIndex);


    return (
        <div className={styles.dashboardContent}>
            <header className={styles.header}>
                <div className={styles.userControls}>
                    <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                    <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Cargo'}</span>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <FaSignOutAlt /> Cerrar sesión
                    </button>
                </div>
            </header>

            {loading && <div className={styles.loading}>Cargando datos...</div>}
            {error && <div className={styles.error}><FaExclamationTriangle /> {error}</div>}

            {!loading && !error && (
            <>
            <section className={styles.contentGrid}>
                {/* Tarjeta para el gráfico de productos más vendidos */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeaderWithControls}>
                        <h2 className={styles.chartTitle}>Productos más vendidos por Mes</h2>
                        <div className={styles.datePickerControls}>
                            <select name="month" value={selectedDate.month} onChange={handleDateChange} className={styles.monthYearSelect}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                            <select name="year" value={selectedDate.year} onChange={handleDateChange} className={styles.monthYearSelect}>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.chartWrapper}>
                        {chartLoading ? (
                            <div className={styles.loading}>Cargando gráfico...</div>
                        ) : bestSellingByMonth.length > 0 ? (
                            <MovementsChart chartData={chartData} options={chartOptions} />
                        ) : (
                            <div className={styles.noData}>
                                No hay datos de ventas para el mes seleccionado.
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI Card de Bajo Stock */}
                <Link to="/admin/inventory" className={`${styles.kpiCard} ${styles.lowStockCard}`}>
                    <div className={styles.kpiIcon}>
                        <FaExclamationTriangle />
                    </div>
                    <div className={styles.kpiContent}>
                        <p className={styles.kpiValue}>{lowStockCount}</p>
                        <h2 className={styles.kpiTitle}>Productos con Bajo Stock</h2>
                    </div>
                </Link>

            </section>

            {/* Sección de Gestión de Personal */}
            <StaffList staff={paginatedStaff} onView={handleViewStaff} onDelete={handleDeleteClick} />

            {/* Controles de Paginación para el Personal */}
            {staffTotalPages > 1 && (
                <div className={styles.paginationControls}>
                    <button
                        onClick={() => setStaffCurrentPage((prev) => prev - 1)}
                        disabled={staffCurrentPage === 1}
                        className={styles.paginationButton}
                    >
                        Anterior
                    </button>
                    <div className={styles.pageNumbers}>
                        {Array.from({ length: staffTotalPages }, (_, i) => i + 1).map(
                            (pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => setStaffCurrentPage(pageNumber)}
                                className={`${styles.pageNumberButton} ${staffCurrentPage === pageNumber ? styles.activePage : ""}`}
                            >
                                {pageNumber}
                            </button>
                            )
                        )}
                    </div>
                    <button
                        onClick={() => setStaffCurrentPage((prev) => prev + 1)}
                        disabled={staffCurrentPage >= staffTotalPages}
                        className={styles.paginationButton}
                    >
                        Siguiente
                    </button>
                </div>
            )}

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
                            {paginatedInventory.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.stock}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.status === 'available' ? styles.disponible : styles.nodisponible}`}>
                                            {item.status === 'available' ? 'Disponible' : 'No Disponible'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Controles de Paginación para el Inventario (Movidos aquí) */}
                    {inventoryTotalPages > 1 && (
                        <div className={styles.paginationControls}>
                            <button
                                onClick={() => setInventoryCurrentPage((prev) => prev - 1)}
                                disabled={inventoryCurrentPage === 1}
                                className={styles.paginationButton}
                            >
                                Anterior
                            </button>
                            <div className={styles.pageNumbers}>
                                {Array.from({ length: inventoryTotalPages }, (_, i) => i + 1).map(
                                    (pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setInventoryCurrentPage(pageNumber)}
                                        className={`${styles.pageNumberButton} ${inventoryCurrentPage === pageNumber ? styles.activePage : ""}`}
                                    >
                                        {pageNumber}
                                    </button>
                                    )
                                )}
                            </div>
                            <button
                                onClick={() => setInventoryCurrentPage((prev) => prev + 1)}
                                disabled={inventoryCurrentPage >= inventoryTotalPages}
                                className={styles.paginationButton}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </section>
            </>
            )}

            {/* Renderizado condicional del Modal y Diálogo de Confirmación */}
            {isModalOpen && (
                <StaffDetailModal 
                    user={selectedStaff} 
                    onClose={handleCloseModal} 
                    onUpdateStatus={handleUpdateStatus} 
                />
            )}

            {staffToDelete && (
                <ConfirmationDialog message={`¿Estás seguro de que deseas eliminar a ${staffToDelete.name}?`} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />
            )}
        </div>
    );
};

export default Dashboard;