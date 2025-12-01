import React, { useState } from 'react';
import styles from './InventoryTable.module.css';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaSignOutAlt, FaBox, FaChartBar, FaUsers, FaQuestionCircle } from 'react-icons/fa';

// Datos de ejemplo basados en tu captura de pantalla
const initialProducts = [
  { id: 1, name: 'Aguardiente Amarillo', quantity: 92, minQuantity: 30, cost: '28.270', price: '42.500' },
  { id: 2, name: 'Vodka Oddka', quantity: 17, minQuantity: 8, cost: '42.150', price: '76.750' },
  { id: 3, name: 'Whisky Jeremiah Weed', quantity: 21, minQuantity: 12, cost: '39.800', price: '69.100' },
  { id: 4, name: 'Ron Caldas 700ML', quantity: 73, minQuantity: 10, cost: '28.350', price: '52.990' },
  { id: 5, name: 'Buchanans Master 18 Años', quantity: 7, minQuantity: 5, cost: '35.150', price: '82.450' },
];

const InventoryTable = () => {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Funcionalidades de la tabla ---

  const handleView = (id) => {
    alert(`Ver detalles del producto ID: ${id}`);
    // Aquí iría la lógica para redirigir o abrir un modal de vista
  };

  const handleEdit = (id) => {
    alert(`Editar producto ID: ${id}`);
    // Aquí iría la lógica para redirigir o abrir un formulario de edición
  };

  const handleDelete = (id) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto ID: ${id}?`)) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleAddProduct = () => {
    alert('Abrir formulario para Añadir Producto');
    // Aquí iría la lógica para abrir un modal o redirigir a la página de creación
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.dashboardContainer}>
      
      {/* Navbar Lateral Izquierda */}
      <nav className={styles.sidebar}>
        <div className={styles.logo}>V</div>
        <div className={styles.navItems}>
          {/* Item activo (Inventario - basado en el color azul claro) */}
          <div className={`${styles.navItem} ${styles.active}`} title="Inventario">
            <FaBox />
          </div>
          <div className={styles.navItem} title="Estadísticas">
            <FaChartBar />
          </div>
          <div className={styles.navItem} title="Usuarios">
            <FaUsers />
          </div>
        </div>
        <div className={`${styles.navItem} ${styles.helpItem}`} title="Ayuda">
          <FaQuestionCircle />
        </div>
      </nav>

      {/* Contenido Principal */}
      <div className={styles.mainContent}>
        
        {/* Header Superior */}
        <header className={styles.header}>
          <button className={styles.logoutButton}>
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </header>

        {/* Sección de Inventario General */}
        <section className={styles.inventorySection}>
          <h2 className={styles.sectionTitle}>Inventario General</h2>
          
          {/* Barra de Búsqueda y Botón Añadir */}
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

          {/* Tabla de Productos */}
          <div className={styles.tableContainer}>
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>PRODUCTO</th>
                  <th>CANTIDAD</th>
                  <th>CANTIDAD MIN.</th>
                  <th>COSTO</th>
                  <th>PRECIO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className={styles.productName}>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>{product.minQuantity}</td>
                    <td>$ {product.cost}</td>
                    <td>$ {product.price}</td>
                    <td className={styles.actions}>
                      <button className={styles.actionButton} onClick={() => handleView(product.id)} title="Ver Producto">
                        <FaEye className={styles.viewIcon} />
                      </button>
                      <button className={styles.actionButton} onClick={() => handleEdit(product.id)} title="Editar Producto">
                        <FaEdit className={styles.editIcon} />
                      </button>
                      <button className={styles.actionButton} onClick={() => handleDelete(product.id)} title="Eliminar Producto">
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
      </div>
    </div>
  );
};

export default InventoryTable;