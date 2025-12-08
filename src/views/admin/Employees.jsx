import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import employeeService from '../../services/employeeService';
import { FaSignOutAlt, FaUsers, FaCheckSquare, FaPlus, FaEye, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import styles from './EmployeesPage.module.css'; // Asegúrate que este es el archivo de estilos correcto



// --- Componente Modal para Detalles del Empleado (Copiado de Dashboard) ---
const EmployeeDetailModal = ({ user, onClose, onSave, mode, errors }) => {
  const [formData, setFormData] = useState(user || {
    name: '', email: '', password: '', position: '', status: 'active', phone: '', photo: null
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo || null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    setFormData(user || { name: '', email: '', password: '', position: '', status: 'active', phone: '', photo: null });
    setPhotoPreview(user?.photo || null);
    setPhotoFile(null);
    // detener cámara cuando cambia el usuario/modal
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    };
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Nota: la subida de archivos por input fue eliminada — ahora solo cámara

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('La cámara no está disponible en este dispositivo/navegador.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Comprueba permisos y conexión.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const handleCaptureFromCamera = () => {
    try {
      const video = videoRef.current;
      if (!video) return;
      const canvas = canvasRef.current || document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          alert('Error al capturar la imagen.');
          return;
        }
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type });
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        stopCamera();
      }, 'image/jpeg', 0.9);
      // guardar referencia al canvas para posible uso futuro
      canvasRef.current = canvas;
    } catch (err) {
      console.error('Error capturando desde cámara:', err);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
  };

  const handleSave = () => {
    const payload = { ...formData };
    if (photoFile) payload.photoFile = photoFile;
    // incluir preview (URL de blob) para uso optimista en la tabla
    if (photoPreview) payload.photoPreview = photoPreview;
    onSave(payload);
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
            <label>Foto:</label>
            {isViewMode ? (
              photoPreview ? <img src={photoPreview} alt="Foto empleado" className={styles.employeePhotoPreview} /> : <span className={styles.modalValue}>Sin foto</span>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexDirection: 'column', width: '100%' }}>
                  <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'center' }}>
                    <button type="button" onClick={() => (cameraActive ? stopCamera() : startCamera())} className={styles.addButton}>
                      {cameraActive ? 'Detener cámara' : 'Usar cámara'}
                    </button>
                  </div>

                  {cameraActive && (
                    <div className={styles.cameraWrapper}>
                      <video ref={videoRef} className={styles.cameraVideo} playsInline muted />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button type="button" onClick={handleCaptureFromCamera} className={styles.saveButton}>Capturar</button>
                        <button type="button" onClick={stopCamera} className={styles.removePhotoButton}>Cancelar</button>
                      </div>
                    </div>
                  )}

                  {photoPreview && (
                    <div className={styles.photoPreviewWrapper}>
                      <img src={photoPreview} alt="Previsualización" className={styles.employeePhotoPreview} />
                      <button type="button" onClick={handleRemovePhoto} className={styles.removePhotoButton}>Quitar</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {errors?.photo && <span className={styles.validationError}>{errors.photo[0]}</span>}
          </div>

          <div className={styles.modalField}>
            <label>Nombre:</label>
            {isViewMode ? <strong className={styles.modalValue}>{formData.name}</strong> : <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={styles.modalInput} required />}
            {errors?.name && <span className={styles.validationError}>{errors.name[0]}</span>}
          </div>

          {!isViewMode && (
            <>
              <div className={styles.modalField}>
                <label>Email:</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className={styles.modalInput} required />
                {errors?.email && <span className={styles.validationError}>{errors.email[0]}</span>}
              </div>
              {mode === 'add' && (
                <div className={styles.modalField}>
                  <label>Contraseña:</label>
                  <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className={styles.modalInput} required />
                  {errors?.password && <span className={styles.validationError}>{errors.password[0]}</span>}
                </div>
              )}
            </>
          )}

          <div className={styles.modalField}>
            <label>Cargo (Position):</label>
            {isViewMode ? <strong className={styles.modalValue}>{formData.position}</strong> : <input type="text" name="position" value={formData.position || ''} onChange={handleChange} className={styles.modalInput} required />}
            {errors?.position && <span className={styles.validationError}>{errors.position[0]}</span>}
          </div>

          <div className={styles.modalField}>
            <label>Teléfono:</label>
            {isViewMode ? <strong className={styles.modalValue}>{formData.phone}</strong> : <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className={styles.modalInput} />}
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
  const [statsData, setStatsData] = useState([
    { label: 'Total Empleados', value: '0', icon: FaUsers, color: 'blue' },
    { label: 'Empleados Activos', value: '0', icon: FaCheckSquare, color: 'green' },
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null, 'view', 'edit', 'add'
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState(null);

  // --- Estados para la Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const EMPLOYEES_PER_PAGE = 5;

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Este efecto se ejecuta cuando la lista de empleados cambia
    if (employees && employees.length > 0) {
        const totalEmployees = employees.length;
        const activeEmployees = employees.filter(emp => emp.status === 'active').length;

        setStatsData(prevStats => [
            { ...prevStats[0], value: totalEmployees.toString() },
            { ...prevStats[1], value: activeEmployees.toString() },
        ]);
    }
  }, [employees]);

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
          // incluir foto si se ha seleccionado
          ...(employeeData.photoFile ? { photoFile: employeeData.photoFile } : {}),
        };
        const response = await employeeService.createEmployee(newEmployeeData);
        // intentar obtener el empleado creado desde la respuesta
        let created = response?.data?.data || response?.data;
        if (!created) {
          // fallback optimista
          created = {
            id: Date.now(), // id temporal
            name: newEmployeeData.name,
            email: newEmployeeData.email,
            position: newEmployeeData.position,
            status: newEmployeeData.status,
            phone: newEmployeeData.phone,
          };
        }
        // si backend no devolvió photo, usar preview local si existe
        if ((!created.photo && !created.photo_url) && employeeData.photoPreview) {
          created.photo = employeeData.photoPreview;
        }
        // añadir al estado local para mostrar inmediatamente
        setEmployees(prev => [created, ...(prev || [])]);
        setSuccessMessage(`Empleado "${employeeData.name}" añadido con éxito.`);
      } else { // 'edit' mode
        const response = await employeeService.updateEmployee(employeeData.id, employeeData);
        let updated = response?.data?.data || response?.data;
        if (!updated) {
          // fallback: usar datos enviados
          updated = { ...employeeData };
        }
        if ((!updated.photo && !updated.photo_url) && employeeData.photoPreview) {
          updated.photo = employeeData.photoPreview;
        }
        // actualizar en la lista local
        setEmployees(prev => (prev || []).map(emp => (emp.id === updated.id ? { ...emp, ...updated } : emp)));
        setSuccessMessage(`Empleado "${employeeData.name}" actualizado con éxito.`);
      }
      // refrescar en background para sincronizar con backend
      fetchEmployees();
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

  const handleConfirmDelete = async () => {
    try {
      await employeeService.deleteEmployee(employeeToDelete.id);
      setSuccessMessage(`Empleado "${employeeToDelete.name}" eliminado con éxito.`);
      fetchEmployees(); // Refrescar la lista desde la API
    } catch (error) {
      console.error("Error al eliminar el empleado:", error);
      // Aquí se podría establecer un mensaje de error en el estado para mostrarlo en la UI
    }
    setEmployeeToDelete(null);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // --- Lógica de Paginación ---
  const totalPages = Math.ceil(employees.length / EMPLOYEES_PER_PAGE);
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;
  const endIndex = startIndex + EMPLOYEES_PER_PAGE;
  const paginatedEmployees = employees.slice(startIndex, endIndex);

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
                <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Rol'}</span>
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
                      {paginatedEmployees.map((emp) => {
                        const photoUrl = emp.photo || emp.photo_url || null;
                        return (
                        <tr key={emp.id}>
                          <td className={styles.employeeName}>
                            <div className={styles.nameWithPhoto}>
                              {photoUrl ? (
                                <img src={photoUrl} alt={`Foto ${emp.name}`} className={styles.avatarImage} />
                              ) : (
                                <div className={styles.avatarFallback}>{(emp.name || 'U').charAt(0).toUpperCase()}</div>
                              )}
                              <span>{emp.name}</span>
                            </div>
                          </td>
                          <td>{emp.position}</td>
                          <td>{emp.phone}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[emp.status?.toLowerCase() || '']}`}>
                              {emp.status === 'active' ? 'Activo' : 'Inactivo'}
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
                        );
                      })}
                    </tbody>
                </table>
            </div>

            {/* --- Controles de Paginación --- */}
            {totalPages > 1 && (
              <div className={styles.paginationControls}>
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Anterior
                </button>
                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`${styles.pageNumberButton} ${currentPage === pageNumber ? styles.activePage : ""}`}
                      >
                        {pageNumber}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= totalPages}
                  className={styles.paginationButton}
                >
                  Siguiente
                </button>
              </div>
            )}
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