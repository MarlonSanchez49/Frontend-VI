import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

// --- Datos de Simulación para la Lista de Personal ---
const initialStaff = [
    { id: 101, name: 'Carlos Rivas', role: 'Vendedor', status: 'Activo' },
    { id: 102, name: 'Lucía Méndez', role: 'Cajero', status: 'Activo' },
    { id: 103, name: 'Jorge Campos', role: 'Bodeguero', status: 'Descansando' },
];

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
                        <span>Rol:</span> <strong>{user.role}</strong>
                    </div>
                    <div className={`${styles.modalInfoRow} ${styles.modalField}`}>
                        <label htmlFor="status">Estado:</label>
                        <select id="status" value={user.status} onChange={handleStatusChange} className={styles.statusSelect}>
                            <option value="Activo">Activo</option>
                            <option value="Descansando">Descansando</option>
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
                        <th>ROL</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {staff.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.role}</td>
                            <td>
                                <span className={`${styles.statusBadge} ${styles[employee.status.toLowerCase()]}`}>
                                    {employee.status}
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

    // --- Estados para la gestión de personal ---
    const [staff, setStaff] = useState(initialStaff);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    // Simulamos que no hay datos para mostrar en la gráfica
    const chartData = []; 
    
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

    const handleUpdateStatus = (employeeId, newStatus) => {
        const updatedStaff = staff.map(emp => 
            emp.id === employeeId ? { ...emp, status: newStatus } : emp
        );
        setStaff(updatedStaff);
        // Actualiza también el empleado seleccionado en el modal para reflejar el cambio
        if (selectedStaff && selectedStaff.id === employeeId) {
            setSelectedStaff({ ...selectedStaff, status: newStatus });
        }
    };

    // --- Handlers para la eliminación ---
    const handleDeleteClick = (employee) => {
        setStaffToDelete(employee);
    };

    const handleConfirmDelete = () => {
        setStaff(staff.filter(emp => emp.id !== staffToDelete.id));
        setStaffToDelete(null); // Cierra el diálogo de confirmación
    };

    const handleCancelDelete = () => {
        setStaffToDelete(null);
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

            {/* Sección de Gestión de Personal */}
            <StaffList staff={staff} onView={handleViewStaff} onDelete={handleDeleteClick} />

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