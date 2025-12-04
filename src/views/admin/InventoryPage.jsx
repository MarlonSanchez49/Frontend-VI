import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService'; // 1. Importar categoryService
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import styles from './InventoryPage.module.css';

// --- Componente Modal para Detalles/Edición del Producto ---
const ProductModal = ({ product, onClose, onSave, mode, categories }) => { // 4. Recibir categories
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock || '',
        status: product?.status || 'available',
        category_id: product?.category_id || (categories.length > 0 ? categories[0].id : ''),
    });

    useEffect(() => {
        if (categories.length > 0 && !formData.category_id) {
            setFormData(prev => ({ ...prev, category_id: categories[0].id }));
        }
    }, [categories, formData.category_id]);

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
                        {/* 4. Renderizar options dinámicamente */}
                        <select name="category_id" value={formData.category_id} onChange={handleChange} className={styles.modalInput} disabled={isViewMode}>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
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

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // 2. Añadir estado para categories
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // --- Estados para la Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts();
      if (response.data && Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.warn('La respuesta de la API de productos no tiene el formato esperado:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      setProducts([]);
    }
  };
  
  // 3. Crear función para obtener categories
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn('La respuesta de la API de categorías no tiene el formato esperado:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // 3. Llamar a la función
  }, []);

  // Efecto para resetear la página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


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
      category_id: categories.length > 0 ? categories[0].id : '',
    });
    setModalMode('add');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const dataToSend = { ...productData, category_id: parseInt(productData.category_id, 10) };
      if (modalMode === 'add') {
        await productService.createProduct(dataToSend);
        setSuccessMessage(`Producto "${productData.name}" añadido con éxito.`);
      } else {
        await productService.updateProduct(selectedProduct.id, dataToSend);
        setSuccessMessage(`Producto "${productData.name}" actualizado.`);
      }
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error detallado al guardar el producto:", error.response || error);
      let message = 'Ocurrió un error al guardar el producto.';
      if (error.response && error.response.status === 422) {
        const validationErrors = Object.values(error.response.data.errors).flat().join(' ');
        message = `Error de validación: ${validationErrors}`;
      }
      setErrorMessage(message);
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 5000);
  };

  const handleConfirmDelete = async () => {
    try {
      await productService.deleteProduct(productToDelete.id);
      setSuccessMessage(`Producto "${productToDelete.name}" eliminado con éxito.`);
      fetchProducts();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      setErrorMessage('No se pudo eliminar el producto.');
    }
    setProductToDelete(null);
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Lógica de Paginación ---
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className={styles.dashboardLayout}>
      
      <Sidebar />

      <div className={styles.mainContent}>

        {successMessage && (
            <div className={styles.successNotification}>
                {successMessage}
            </div>
        )}

        {errorMessage && (
            <div className={styles.errorNotification}>
                {errorMessage}
            </div>
        )}
        
        <header className={styles.header}>
            <div className={styles.titleGroup}>
                <h1 className={styles.pageTitle}>Inventario General</h1>
            </div>
            <div className={styles.userControls}>
                <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Rol'}</span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    <FaSignOutAlt /> Cerrar sesión
                </button>
            </div>
        </header>

        <section className={styles.inventorySection}>
          
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
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.productName}>{product.name}</td>
                    <td>{product.description}</td>
                    {/* 5. Mostrar nombre de categoría dinámicamente */}
                    <td>{getCategoryName(product.category_id)}</td>
                    <td>{product.stock}</td>
                    <td>$ {Math.round(product.price)}</td>
                    <td>{product.status === 'available' ? 'Disponible' : 'No Disponible'}</td>
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
          
          {/* --- Controles de Paginación --- */}
          <div></div>
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
                categories={categories} // 6. Pasar categories al modal
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

export default InventoryPage;