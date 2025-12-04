import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar'; // Asegúrate que la ruta sea correcta
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/productService'; // Importar el servicio
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import styles from './InventoryPage.module.css'; // Asumo que este es el archivo de estilos correcto

// --- Componente Modal para Detalles/Edición del Producto ---
const ProductModal = ({ product, onClose, onSave, mode }) => {
    // Usamos un estado local para los campos del formulario para no mutar el estado principal directamente
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock || '',
        status: product?.status || 'available',
        category_id: product?.category_id || 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'category_id' ? parseInt(value, 10) : value 
        }));
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
                <h2>{mode === 'add' ? 'Añadir Nuevo Producto' : (isViewMode ? 'Detalles del Producto' : 'Editar Producto')}</h2>
                <div className={styles.modalBody}>
                    <div className={styles.modalField}>
                        <label>Nombre:</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.modalInput} disabled={isViewMode} />
                    </div>
                    <div className={styles.modalField}>
                        <label>Descripción:</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className={styles.modalInput} disabled={isViewMode} />
                    </div>
                    <div className={styles.modalField}>
                        <label>Categoría:</label>
                        <select name="category_id" value={formData.category_id} onChange={handleChange} className={styles.modalInput} disabled={isViewMode}>
                            <option value={1}>Licores</option>
                            <option value={2}>Cervezas</option>
                            <option value={3}>Otros</option>
                        </select>
                    </div>
                    <div className={styles.modalField}>
                        <label>Existencias (Stock):</label>
                        <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={styles.modalInput} disabled={isViewMode} />
                    </div>
                    <div className={styles.modalField}>
                        <label>Precio (Valor):</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.modalInput} disabled={isViewMode} />
                    </div>
                    <div className={styles.modalField}>
                        <label>Estado:</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={styles.modalInput} disabled={isViewMode}>
                            <option value="available">Disponible</option>
                            <option value="not available">No Disponible</option>
                        </select>
                    </div>
                </div>
                {mode !== 'view' && (
                    <div className={styles.modalFooter}>
                        <button onClick={handleSave} className={styles.saveButton}>
                            {mode === 'add' ? 'Añadir Producto' : 'Guardar Cambios'}
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

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null, 'view', 'edit', 'add'
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      console.log('Respuesta de la API de productos:', response.data);

      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      }
      else {
        console.warn('La respuesta de la API de productos no tiene el formato esperado (array). Se recibió:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      setProducts([]); // En caso de error, también asegurar que sea un array
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Funcionalidades CRUD ---

  const handleView = (product) => {
    setSelectedProduct(product);
    setModalMode('view');
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
  };

  const handleAddProduct = () => {
    setSelectedProduct({ 
      id: null,
      name: '', 
      description: '',
      price: '',
      stock: '', 
      status: 'available',
      category_id: 1,
    });
    setModalMode('add');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (modalMode === 'add') {
        await productService.createProduct(productData);
        setSuccessMessage(`Producto "${productData.name}" añadido con éxito.`);
      } else { // Modo 'edit'
        await productService.updateProduct(selectedProduct.id, productData);
        setSuccessMessage(`Producto "${productData.name}" actualizado.`);
      }
      await fetchProducts();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
    handleCloseModal();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleConfirmDelete = async () => {
    try {
      await productService.deleteProduct(productToDelete.id);
      setSuccessMessage(`Producto "${productToDelete.name}" eliminado con éxito.`);
      fetchProducts();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
    setProductToDelete(null);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.dashboardLayout}>
      
      <Sidebar />

      <div className={styles.mainContent}>

        {successMessage && (
            <div className={styles.successNotification}>
                {successMessage}
            </div>
        )}
        
        <header className={styles.header}>
            <div className={styles.userControls}>
                <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Rol'}</span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </header>

        <section className={styles.inventorySection}>
          <h2 className={styles.sectionTitle}>Inventario General</h2>
          
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.addButton} onClick={handleAddProduct}>
              <FaPlus /> Añadir Producto
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>DESCRIPCIÓN</th>
                  <th>CATEGORÍA</th>
                  <th>STOCK</th>
                  <th>PRECIO</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.productName}>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.category_id === 1 ? 'Licores' : (product.category_id === 2 ? 'Cervezas' : 'Otros')}</td>
                    <td>{product.stock}</td>
                    <td>$ {product.price}</td>
                    <td>{product.status}</td>
                    <td className={styles.actions}>
                      <button className={styles.viewButton} onClick={() => handleView(product)} title="Ver Producto">
                        <FaEye className={styles.viewIcon} />
                      </button>
                      <button className={styles.editButton} onClick={() => handleEdit(product)} title="Editar Producto">
                        <FaEdit className={styles.editIcon} />
                      </button>
                      <button className={styles.deleteButton} onClick={() => handleDelete(product)} title="Eliminar Producto">
                        <FaTrash className={styles.deleteIcon} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <p className={styles.noResults}>No se encontraron productos.</p>
          )}

        </section>
        
        {modalMode && (
            <ProductModal 
                product={selectedProduct}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                mode={modalMode}
            />
        )}

        {productToDelete && (
            <ConfirmationDialog 
                message={`¿Estás seguro de que deseas eliminar "${productToDelete.name}"?`}
                onConfirm={handleConfirmDelete}
                onCancel={() => setProductToDelete(null)}
            />
        )}
      </div>
    </div>
  );
};

export default Inventory;