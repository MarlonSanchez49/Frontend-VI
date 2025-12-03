import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import movementsService from '../../services/movementsService';
import { useAuth } from '../../hooks/useAuth';
import styles from './PosPage.module.css';

const PosPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleDetails, setSaleDetails] = useState({ tableNumber: '', paymentMethod: 'Efectivo' });
  const [amountReceived, setAmountReceived] = useState('');
    const [nequiVoucher, setNequiVoucher] = useState('');
    
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [tableToDeleteName, setTableToDeleteName] = useState('');  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [availableTables, setAvailableTables] = useState(() => {
    const savedAvailableTables = localStorage.getItem('availableTables');
    return savedAvailableTables ? JSON.parse(savedAvailableTables) : ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4'];
  });
  const [currentTable, setCurrentTable] = useState(availableTables[0]);
  const [tables, setTables] = useState(() => {
    const savedTables = localStorage.getItem('posTables');
    if (savedTables) {
      return JSON.parse(savedTables);
    }
    const initialTables = {};
    availableTables.forEach(table => {
      initialTables[table] = [];
    });
    return initialTables;
  });
  // Sincronizar availableTables con localStorage
  useEffect(() => {
    localStorage.setItem('availableTables', JSON.stringify(availableTables));
  }, [availableTables]);

  const cart = tables[currentTable] || [];

  // El carrito actual es el carrito de la mesa seleccionada
  const handleAddTable = () => {
    const tableNumbers = availableTables.map(name => parseInt(name.replace('Mesa ', ''))).filter(num => !isNaN(num));
    const nextTableNumber = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;
    const newTableName = `Mesa ${nextTableNumber}`;
    setAvailableTables(prev => [...prev, newTableName]);
    setTables(prev => ({
      ...prev,
      [newTableName]: []
    }));
    setCurrentTable(newTableName);
  };

      const handleDeleteTable = (tableName) => {

        if (availableTables.length <= 1) {

          alert('No puedes eliminar la última mesa. Debe haber al menos una mesa.');

          return;

        }

        setTableToDeleteName(tableName);

        setShowConfirmDialog(true);

      };

    

      const confirmDeleteTable = () => {

        // Perform the actual deletion

        setAvailableTables(prev => prev.filter(name => name !== tableToDeleteName));

        setTables(prev => {

          const newTables = { ...prev };

          delete newTables[tableToDeleteName];

          return newTables;

        });

    

        if (currentTable === tableToDeleteName) {

          setCurrentTable(availableTables.filter(name => name !== tableToDeleteName)[0]);

        }

        setTableToDeleteName('');

        setShowConfirmDialog(false);

      };

    

      const cancelDeleteTable = () => {

        setTableToDeleteName('');

        setShowConfirmDialog(false);

      };

    

      useEffect(() => {

        localStorage.setItem('posTables', JSON.stringify(tables));
  }, [tables, currentTable]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    // Mock data to allow for frontend development without a backend
    const mockProducts = [
      { id: 1, name: 'Tacos al Pastor', price: 25, imageUrl: 'https://via.placeholder.com/150/FFC0CB/000000?text=Taco+Pastor' },
      { id: 2, name: 'Gringa', price: 45, imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?text=Gringa' },
      { id: 3, name: 'Queso Fundido', price: 60, imageUrl: 'https://via.placeholder.com/150/FFFFE0/000000?text=Queso' },
      { id: 4, name: 'Agua de Horchata', price: 20, imageUrl: 'https://via.placeholder.com/150/90EE90/000000?text=Horchata' },
      { id: 5, name: 'Cerveza', price: 35, imageUrl: 'https://via.placeholder.com/150/D3D3D3/000000?text=Cerveza' },
      { id: 6, name: 'Volcan', price: 30, imageUrl: 'https://via.placeholder.com/150/FFA07A/000000?text=Volcan' },
      { id: 7, name: 'Tacos de Suadero', price: 25, imageUrl: 'https://via.placeholder.com/150/E6E6FA/000000?text=Taco+Suadero' },
      { id: 8, name: 'Tacos de Longaniza', price: 25, imageUrl: 'https://via.placeholder.com/150/FFDAB9/000000?text=Taco+Longaniza' },
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const results = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleAddToCart = (product) => {
    setTables(prevTables => {
      const currentTableCart = prevTables[currentTable] || [];
      const existing = currentTableCart.find(item => item.id === product.id);

      let updatedCart;
      if (existing) {
        updatedCart = currentTableCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...currentTableCart, { ...product, quantity: 1 }];
      }
      return {
        ...prevTables,
        [currentTable]: updatedCart
      };
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setTables(prevTables => {
      const currentTableCart = prevTables[currentTable] || [];
      let updatedCart;

      if (newQuantity <= 0) {
        updatedCart = currentTableCart.filter(item => item.id !== productId);
      } else {
        updatedCart = currentTableCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      return {
        ...prevTables,
        [currentTable]: updatedCart
      };
    });
  };
  
  const handleSaleInputChange = (e) => {
      const { name, value } = e.target;
      setSaleDetails(prev => {
        // Si el método de pago cambia a algo diferente de Nequi, limpiamos el comprobante
        if (name === 'paymentMethod' && value !== 'Nequi') {
          setNequiVoucher('');
        }
        return { ...prev, [name]: value };
      });
  }

    const calculateTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const total = calculateTotal();
  const handleSelectTable = (table) => {
    setCurrentTable(table);
    // Asegurarse de que el número de mesa para la venta actual refleje la mesa seleccionada.
    setSaleDetails(prev => ({ ...prev, tableNumber: table }));
  };
  
  const handleCancelSale = () => {
    setTables(prevTables => ({
      ...prevTables,
      [currentTable]: []
    }));
    setSaleDetails(prev => ({ ...prev, tableNumber: currentTable, paymentMethod: prev.paymentMethod })); // Mantener paymentMethod actual
    setAmountReceived('');
    setNequiVoucher('');
    setSubmitError(null);
    setSubmitSuccess('');
  };

  const handleFinalizeSale = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess('');
    const movementData = {
      employee_id: user.id,
      movement_type: 'salida',
      details: cart.map(item => ({ product_id: item.id, quantity: item.quantity, unit_price: item.price })),
      ...saleDetails,
      ...(saleDetails.paymentMethod === 'Nequi' && { nequiVoucher }), // Añadir el comprobante si es Nequi
            total: total // Usar el nuevo total sin impuestos
          };
    try {
      // await movementsService.createMovement(movementData); // Descomentar para producción
      setSubmitSuccess('¡Venta registrada con éxito!');
      // Limpiar el carrito de la mesa actual
      setTables(prevTables => ({
        ...prevTables,
        [currentTable]: []
      }));
      setSaleDetails({ tableNumber: currentTable, paymentMethod: saleDetails.paymentMethod });
      setAmountReceived(''); // Limpiar el campo de monto recibido
      setNequiVoucher(''); // Limpiar el comprobante Nequi
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setSubmitError('Error al registrar la venta. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.loading}>Cargando productos...</div>;

  return (
    <div className={styles.mainWrapper}>
      <main className={styles.mainGrid}>

        {/* Global Header */}
        <header className={styles.globalHeader}>
          <h1 className={styles.posTitle}>POS System</h1>
          <div className={styles.headerRightSection}>
            {/* SE ELIMINÓ LA SECCIÓN DE NOTIFICACIONES */}
            <div className={styles.userProfileSection}>
              <img alt="User avatar" className={styles.userAvatar} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbSH3fNlDFKkA_N9FqcdWSFGGAYU4E0DFdOkj5oFwL9GXuo6nGj-j7ABCTNV_Hfs68eVxEABic47vmFe3kGuhTaExYCTQrbpS6HryGPsS_BB4xVnWEdk3qL9pw-2nlXwaK4XWWLsi3Errxaq3lqV9Q0Q2wVVkKGidWRZin-DKP1_cGd5mrx03NdBOPn_NUrv9ToRXGFFwe1ZzRNEMRzkCqmcKWqie18kffJdKycK6Avgw6fYn99IpOZ91o8ea8PW6cuMVt4_p_HIx9"/>
              <p className={styles.userName}>{user?.name || 'Test Admin'}</p>
              <button className={styles.logoutButton} onClick={handleLogout}>
                <span className={styles.logoutButtonText}>Cerrar Sesion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Products Column */}
        <div className={styles.productPanel}>
          {/* Section for table selection buttons */}
          <div className={styles.tableSelectionContainer}>
            <div className={styles.tableSelection}>
              {availableTables.map((table, index) => (
                <div key={table} className={styles.tableButtonContainer}>
                  <button
                    className={`${styles.tableButton} ${currentTable === table ? styles.activeTableButton : ''}`}
                    onClick={() => handleSelectTable(table)}
                  >
                    {table}
                  </button>
                  {index >= 4 && (
                    <button
                      className={styles.deleteTableButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTable(table);
                      }}
                    >
                      <span className="material-symbols-outlined">-</span>
                    </button>
                  )}
                </div>
              ))}
              <button className={styles.addTableButton} onClick={handleAddTable}>
                                <span className="material-symbols-outlined">+</span>              </button>
            </div>
          </div>

          <div className={styles.productSearchAndGrid}>
            <div className={styles.productHeaderAndSearch}>
              <h2 className={styles.productSectionTitle}>Productos</h2>
              <div className={styles.searchContainer}>
                <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInputExtended} />
              </div>
            </div>
            <div className={styles.productsGridContainer}>
              <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
                  <div key={product.id} className={styles.productCard} onClick={() => handleAddToCart(product)}>
                    <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productPrice}>{Number(product.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sale Column */}
        <div className={styles.salePanel}>
          <div className={styles.salePanelContent}> {/* Este contenedor ahora tiene un tamaño fijo para el contenido */}
            <div className={styles.saleHeaderAndClear}>
              <h2 className={styles.saleSectionTitle}>Venta Actual ({currentTable})</h2> {/* Muestra la mesa actual */}
              <button className={styles.clearCartButton} onClick={handleCancelSale}>
                <span className="material-symbols-outlined"></span> {/* Icono para Limpiar */}
                Limpiar Carrito
              </button>
            </div>

            {/* Cart Content (scrollable area) */}
            <div className={styles.cartDisplayArea}> {/* Este es el área que se puede scrollear */}
              {cart.length === 0 ? (
                <div className={styles.cartEmptyState}>
                  <span className="material-symbols-outlined"></span>
                  <p className={styles.cartEmptyText}>El carrito está vacío.</p>
                  <p className={styles.cartEmptySubtitle}>Seleccione productos para empezar</p>
                </div>
              ) : (
                <ul className={styles.cartList}>
                  {cart.map(item => (
                    <li key={item.id} className={styles.cartItem}>
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.name}</p>
                        <div className={styles.itemControls}>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className={styles.quantityButton}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>-</span> {/* Ícono de MENOS */}
                          </button>
                          <span className={styles.itemQuantity}>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className={styles.quantityButton}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>+</span> {/* Ícono de MÁS */}
                          </button>
                          <span className={styles.itemPriceUnit}>x {Number(item.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                        {(item.quantity * item.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            
            {/* Payment Inputs (Cash Received, Payment Method) */}
            <div className={styles.paymentInputsSection}>
                <div className={styles.paymentDetailsGrid}>
                    <div className={styles.cashReceivedGroup}>
                                                <label className={styles.inputLabel} htmlFor="amountReceived">Efectivo Recibido</label>
                                                <div className={styles.amountReceivedInputGroup}>
                                                    <input
                                                        type="number"
                                                        name="amountReceived"
                                                        id="amountReceived"
                                                        placeholder="$0.00"
                                                        value={amountReceived}
                                                        onChange={(e) => setAmountReceived(e.target.value)}
                                                        className={styles.formInput}
                                                        disabled={isSubmitting}
                                                    />
                                                    <button
                                                        type="button"
                                                                                        onClick={() => setAmountReceived(total.toString())}
                                                                                        className={styles.completeAmountButton}
                                                                                        disabled={isSubmitting || total <= 0}
                                                                                    >                                                        Completar
                                                    </button>                        </div>
                    </div>
                    <div className={styles.paymentMethodGroup}>
                        <label className={styles.inputLabel} htmlFor="paymentMethod">Método de Pago</label>
                        <select
                            name="paymentMethod"
                            id="paymentMethod"
                            value={saleDetails.paymentMethod}
                            onChange={handleSaleInputChange}
                            className={styles.formSelect}
                            disabled={isSubmitting}
                        >
                            <option>Efectivo</option>
                            <option>Tarjeta de Crédito</option>
                            <option>Tarjeta de Débito</option>
                            <option>Nequi</option>
                        </select>
                    </div>
                </div>
                
                {saleDetails.paymentMethod === 'Nequi' && (
                    <div className={styles.nequiVoucherInputGroup}>
                        <label className={styles.inputLabel} htmlFor="nequiVoucher">Número de Comprobante Nequi</label>
                        <input
                            type="text"
                            name="nequiVoucher"
                            id="nequiVoucher"
                            placeholder="Número de Comprobante Nequi"
                            value={nequiVoucher}
                            onChange={(e) => setNequiVoucher(e.target.value)}
                            className={styles.formInput}
                            disabled={isSubmitting}
                        />
                    <br />
                    </div>
                )}
            </div>
            
            {/* Submit/Cancel Buttons - ESTA PARTE SE FIJA ABAJO */}
            <div className={styles.actionButtonsContainer}>
                {submitSuccess && <p className={`${styles.feedbackMessage} ${styles.success}`}>{submitSuccess}</p>}
                {submitError && <p className={styles.submitError}>{submitError}</p>}

                <button
                    onClick={handleFinalizeSale}
                    disabled={cart.length === 0 || isSubmitting}
                    className={styles.finalizeButton}
                >
                <span>{isSubmitting ? 'Procesando...' : 'Finalizar Venta'}</span>
                </button>
                <button
                    onClick={handleCancelSale}
                    disabled={isSubmitting}
                    className={styles.cancelButton}
                >
                    Cancelar Cuenta
                </button>
            </div>
          </div>
        </div>
      </main>

      {showConfirmDialog && (
        <div className={styles.confirmDialogOverlay}>
          <div className={styles.confirmDialogBox}>
            <p className={styles.confirmDialogMessage}>
              ¿Estás seguro de que quieres eliminar la mesa "{tableToDeleteName}"?
              Esto borrará todos los productos en su carrito.
            </p>
            <div className={styles.confirmDialogButtons}>
              <button onClick={cancelDeleteTable} className={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={confirmDeleteTable} className={styles.confirmDeleteButton}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosPage;