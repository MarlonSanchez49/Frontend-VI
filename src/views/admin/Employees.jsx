import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import employeeService from '../../services/employeeService';
import { FaSignOutAlt, FaUsers, FaCheckSquare, FaChartLine, FaStar, FaPlus, FaEye, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import styles from './EmployeesPage.module.css'; // Asegúrate que este es el archivo de estilos correcto



const statsData = [
    { label: 'Total Empleados', value: '10', icon: FaUsers, color: 'blue', trend: '+5.0%' },
    { label: 'Empleados Activos', value: '6', icon: FaCheckSquare, color: 'green', trend: '60%' },
    { label: 'Ventas Totales (Mes)', value: '$ 117.925.484', icon: FaChartLine, color: 'orange', trend: '-10.3%' },
    { label: 'Mejor Vendedor', value: 'david', subValue: 'Ventas: $18.875.97', icon: FaStar, color: 'purple' },
];

// --- Componente Modal para Detalles del Empleado (Copiado de Dashboard) ---
const EmployeeDetailModal = ({ user, onClose, onSave, mode, errors }) => {
    const [formData, setFormData] = useState(user);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        // No cerrar el modal aquí para que los errores de validación se puedan mostrar
    };

    const isViewMode = mode === 'view';

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.modalCloseButton}><FaTimes /></button>
                <h2>{mode === 'add' ? 'Añadir Nuevo Empleado' : (isViewMode ? 'Detalles del Empleado' : 'Editar Empleado')}</h2> 
                <div className={styles.modalBody}>
                    <div className={styles.modalField}>
                        <label>Nombre:</label>
                        {isViewMode ? <strong className={styles.modalValue}>{formData.name}</strong> : <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.modalInput} required />}
                        {errors?.name && <span className={styles.validationError}>{errors.name[0]}</span>}
                    </div>
                    {!isViewMode && (
                        <>
                            <div className={styles.modalField}>
                                <label>Email:</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.modalInput} required />
                                {errors?.email && <span className={styles.validationError}>{errors.email[0]}</span>}
                            </div>
                            {mode === 'add' && (
                                <div className={styles.modalField}>
                                    <label>Contraseña:</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.modalInput} required />
                                    {errors?.password && <span className={styles.validationError}>{errors.password[0]}</span>}
                                </div>
                            )}
                        </>
                    )}
                    <div className={styles.modalField}>
                        <label>Cargo (Position):</label>
                        {isViewMode ? <strong className={styles.modalValue}>{formData.position}</strong> : <input type="text" name="position" value={formData.position} onChange={handleChange} className={styles.modalInput} required />}
                        {errors?.position && <span className={styles.validationError}>{errors.position[0]}</span>}
                    </div>
                    <div className={styles.modalField}>
                        <label>Teléfono:</label>
                        {isViewMode ? <strong className={styles.modalValue}>{formData.phone}</strong> : <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={styles.modalInput} />}
                        {errors?.phone && <span className={styles.validationError}>{errors.phone[0]}</span>}
                    </div>
                    <div className={styles.modalField}>
                        <label htmlFor="status">Estado:</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className={styles.statusSelect} disabled={isViewMode}>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                        {errors?.status && <span className={styles.validationError}>{errors.status[0]}</span>}
                    </div>
                </div>
                {/* --- BOTÓN DE GUARDAR AÑADIDO --- */}
                {mode !== 'view' && (
                    <div className={styles.modalFooter}>
                        <button onClick={handleSave} className={`${styles.saveButton} ${styles.addButton}`}>
                            {mode === 'add' ? 'Añadir Empleado' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Componente para Diálogo de Confirmación (Copiado de Dashboard) ---
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

// Componente de Tarjeta de Estadística (para mayor claridad)
// eslint-disable-next-line no-unused-vars
const StatCard = ({ label, value, subValue, icon: Icon, color }) => (
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
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null, 'view', 'edit', 'add'
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getEmployees();
      console.log('Respuesta de la API de empleados:', response.data);

      // Comprobar si la respuesta es un array directamente
      if (Array.isArray(response.data)) {
        setEmployees(response.data);
      } 
      // Comprobar si la respuesta es un objeto que contiene un array en la propiedad 'data'
      else if (response.data && Array.isArray(response.data.data)) {
        setEmployees(response.data.data);
      } 
      // Si no es un formato esperado, establecer como array vacío para evitar que la app se rompa
      else {
        console.warn('La respuesta de la API de empleados no tiene el formato esperado (array). Se recibió:', response.data);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error al obtener los empleados:', error);
      setEmployees([]); // En caso de error, también asegurar que sea un array
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setModalMode('view');
  };

  const handleEdit = (employee) => {
    setValidationErrors(null);
    setSelectedEmployee(employee);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedEmployee(null);
    setValidationErrors(null);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee({ 
      id: null, 
      name: '', 
      email: '', 
      password: '', 
      position: '', // Revertir a position
      status: 'active', // Usar minúsculas por defecto
      phone: '' 
    });
    setModalMode('add');
  };

  const handleSaveEmployee = async (employeeData) => {
    setValidationErrors(null); // Limpiar errores anteriores
    try {
      if (modalMode === 'add') {
        // Construir el objeto solo con los campos necesarios para la creación
        const newEmployeeData = {
          name: employeeData.name,
          email: employeeData.email,
          password: employeeData.password,
          position: employeeData.position,
          status: employeeData.status,
          phone: employeeData.phone,
        };
        await employeeService.createEmployee(newEmployeeData);
        setSuccessMessage(`Empleado "${employeeData.name}" añadido con éxito.`);
      } else { // 'edit' mode
        await employeeService.updateEmployee(employeeData.id, employeeData);
        setSuccessMessage(`Empleado "${employeeData.name}" actualizado con éxito.`);
      }
      
      fetchEmployees(); // Refrescar la lista de empleados
      handleCloseModal();
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error al guardar el empleado:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        console.error('Detalles del error de validación:', error.response.data.errors);
        setValidationErrors(error.response.data.errors);
      }
    }
  };



  const handleDelete = (employee) => {
    setEmployeeToDelete(employee);
  };

  const handleConfirmDelete = () => {
    setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
    setSuccessMessage(`Empleado "${employeeToDelete.name}" eliminado con éxito.`);
    setEmployeeToDelete(null);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000); // El mensaje desaparece después de 3 segundos
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

        {/* Notificación de Éxito */}
        {successMessage && (
            <div className={styles.successNotification}>
                {successMessage}
            </div>
        )}
        
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
            <div className={styles.listHeader}>
                <h2 className={styles.listTitle}>Listado de Personal</h2>
                <button className={styles.addButton} onClick={handleAddEmployee}>
                    <FaPlus /> Añadir Empleado
                </button>
            </div>
            
            <div className={styles.tableContainer}>
                <table className={styles.employeeTable}>
                    <thead>
                        <tr>
                            <th>NOMBRE</th>
                            <th>CARGO (POSITION)</th>
                            <th>TELÉFONO</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id}>
                                <td className={styles.employeeName}>{emp.name}</td>
                                <td>{emp.position}</td>
                                <td>{emp.phone}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[emp.status?.toLowerCase() || '']}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td className={styles.actions}>
                                    <button className={styles.viewButton} onClick={() => handleView(emp)} title="Ver">
                                        <FaEye className={styles.viewIcon} />
                                    </button>
                                    <button className={styles.editButton} onClick={() => handleEdit(emp)} title="Editar">
                                        <FaEdit className={styles.editIcon} />
                                    </button>
                                    <button className={styles.deleteButton} onClick={() => handleDelete(emp)} title="Eliminar">
                                        <FaTrash className={styles.deleteIcon} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        {/* Renderizado condicional del Modal y Diálogo de Confirmación */}
        {modalMode && (
            <EmployeeDetailModal 
                user={selectedEmployee} 
                onClose={handleCloseModal} 
                onSave={handleSaveEmployee}
                mode={modalMode}
                errors={validationErrors}
            />
        )}

        {employeeToDelete && (
            <ConfirmationDialog message={`¿Estás seguro de que deseas eliminar a ${employeeToDelete.name}?`} onConfirm={handleConfirmDelete} onCancel={() => setEmployeeToDelete(null)} />
        )}
        
      </div>
    </div>
  );
};

export default EmployeesPage;