import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import supplierService from '../../services/supplierService'; // Asumimos que este servicio existe
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import styles from './SuppliersPage.module.css'; // Usaremos un nuevo archivo de estilos

// --- Componente Modal para Proveedores ---
const SupplierModal = ({ supplier, onClose, onSave, mode }) => {
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        address: supplier?.address || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const isViewMode = mode === 'view';

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.modalCloseButton}>&times;</button>
                <h2>{mode === 'add' ? 'Añadir Proveedor' : (isViewMode ? 'Detalles del Proveedor' : 'Editar Proveedor')}</h2>
                <div className={styles.modalBody}>
                    <div className={styles.modalField}><label>Nombre:</label><input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isViewMode} /></div>
                    <div className={styles.modalField}><label>Teléfono:</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={isViewMode} /></div>
                    <div className={styles.modalField}><label>Email:</label><input type="email" name="email" value={formData.email} onChange={handleChange} disabled={isViewMode} /></div>
                    <div className={styles.modalField}><label>Dirección:</label><textarea name="address" value={formData.address} onChange={handleChange} disabled={isViewMode} /></div>
                </div>
                {!isViewMode && (
                    <div className={styles.modalFooter}>
                        <button onClick={handleSave} className={styles.saveButton}>
                            {mode === 'add' ? 'Añadir Proveedor' : 'Guardar Cambios'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Componente para Diálogo de Confirmación ---
const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
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

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [modalMode, setModalMode] = useState(null); // null, 'view', 'edit', 'add'
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const fetchSuppliers = async () => {
        try {
            const response = await supplierService.getSuppliers();
            const data = response.data.data || response.data || [];
            setSuppliers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al obtener los proveedores:', error);
            setSuppliers([]);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAdd = () => {
        setSelectedSupplier(null);
        setModalMode('add');
    };

    const handleView = (supplier) => {
        setSelectedSupplier(supplier);
        setModalMode('view');
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setModalMode('edit');
    };

    const handleDelete = (supplier) => {
        setSupplierToDelete(supplier);
    };

    const handleCloseModal = () => {
        setModalMode(null);
        setSelectedSupplier(null);
    };

    const handleSaveSupplier = async (supplierData) => {
        try {
            if (modalMode === 'add') {
                await supplierService.createSupplier(supplierData);
                setSuccessMessage(`Proveedor "${supplierData.name}" añadido con éxito.`);
            } else {
                await supplierService.updateSupplier(selectedSupplier.id, supplierData);
                setSuccessMessage(`Proveedor "${supplierData.name}" actualizado.`);
            }
            fetchSuppliers();
        } catch (error) {
            console.error("Error al guardar el proveedor:", error);
        }
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleConfirmDelete = async () => {
        try {
            await supplierService.deleteSupplier(supplierToDelete.id);
            setSuccessMessage(`Proveedor "${supplierToDelete.name}" eliminado.`);
            fetchSuppliers();
        } catch (error) {
            console.error("Error al eliminar el proveedor:", error);
        }
        setSupplierToDelete(null);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                {successMessage && <div className={styles.successNotification}>{successMessage}</div>}
                
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.pageTitle}>Gestión de Proveedores</h1>
                    </div>
                    <div className={styles.userControls}>
                        <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}><FaSignOutAlt /> Cerrar sesión</button>
                    </div>
                </header>

                <section className={styles.listSection}>
                    <div className={styles.controls}>
                        <div className={styles.searchBox}>
                            <FaSearch className={styles.searchIcon} />
                            <input type="text" placeholder="Buscar proveedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <button className={styles.addButton} onClick={handleAdd}><FaPlus /> Añadir Proveedor</button>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>NOMBRE</th>
                                    <th>TELÉFONO</th>
                                    <th>EMAIL</th>
                                    <th>DIRECCIÓN</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td>{supplier.name}</td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.email}</td>
                                        <td>{supplier.address}</td>
                                        <td className={styles.actions}>
                                            <button className={styles.viewButton} onClick={() => handleView(supplier)} title="Ver">
                                                <FaEye className={styles.viewIcon} />
                                            </button>
                                            <button className={styles.editButton} onClick={() => handleEdit(supplier)} title="Editar">
                                                <FaEdit className={styles.editIcon} />
                                            </button>
                                            <button className={styles.deleteButton} onClick={() => handleDelete(supplier)} title="Eliminar">
                                                <FaTrash className={styles.deleteIcon} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredSuppliers.length === 0 && <p className={styles.noResults}>No se encontraron proveedores.</p>}
                </section>

                {modalMode && (
                    <SupplierModal
                        supplier={selectedSupplier}
                        onClose={handleCloseModal}
                        onSave={handleSaveSupplier}
                        mode={modalMode}
                    />
                )}

                {supplierToDelete && (
                    <ConfirmationDialog
                        message={`¿Seguro que deseas eliminar a "${supplierToDelete.name}"?`}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setSupplierToDelete(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default SuppliersPage;