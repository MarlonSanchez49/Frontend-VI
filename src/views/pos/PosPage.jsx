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
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para la gestión de mesas/pre-cuentas
  const availableTables = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Barra'];
  const [currentTable, setCurrentTable] = useState(availableTables[0]); // Por defecto, la primera mesa
  const [tables, setTables] = useState(() => {
    // Intentar cargar desde localStorage o inicializar vacías
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

  const cart = tables[currentTable] || [];

  // El carrito actual es el carrito de la mesa seleccionada
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

    /*
    productService.getProducts()
      .then(res => {
        let productsArray = [];
        // Validar explícitamente que la respuesta sea un array.
        if (Array.isArray(res.data.data)) {
          productsArray = res.data.data;
        } else if (Array.isArray(res.data)) {
          productsArray = res.data;
        } else {
          console.error("La respuesta de la API de productos no tiene el formato de array esperado:", res.data);
          setError('Los datos de productos recibidos son inválidos.');
        }
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      })
      .catch(err => {
        console.error("Error al cargar productos:", err);
        setError('No se pudieron cargar los productos.');
      })
      .finally(() => setIsLoading(false));
    */
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

  const TAX_RATE = 0.16; // Tasa de impuesto del 16%

  const calculateTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const subtotal = calculateTotal();
  const taxAmount = subtotal * TAX_RATE;
  const totalWithTax = subtotal + taxAmount;

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
      total: totalWithTax // Usar el total con impuestos
    };

    try {
      await movementsService.createMovement(movementData);
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
    <div className={styles.mainWrapper}> {/* Nuevo contenedor global para h-screen w-full */}
      <main className={styles.mainGrid}> {/* Corresponde a flex-1 grid grid-cols-10 gap-6 p-6 overflow-hidden */}

        {/* Global Header */}
        <header className={styles.globalHeader}> {/* flex-shrink-0 mb-6 flex items-center justify-between */}
          <h1 className={styles.posTitle}>POS System</h1> {/* text-3xl font-bold text-on-surface */}
          <div className={styles.headerRightSection}> {/* flex items-center space-x-4 */}
            <button className={styles.notificationButton}> {/* relative text-on-surface-secondary hover:text-on-surface */}
              <span className="material-symbols-outlined">notifications</span> {/* Usar directamente el span de material symbols */}
            </button>
            <div className={styles.userProfileSection}> {/* flex items-center space-x-3 */}
              {/* Usar una imagen de placeholder por ahora. user?.avatarUrl no existe aún. */}
              <img alt="User avatar" className={styles.userAvatar} src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbSH3fNlDFKkA_N9FqcdWSFGGAYU4E0DFdOkj5oFwL9GXuo6nGj-j7ABCTNV_Hfs68eVxEABic47vmFe3kGuhTaExYCTQrbpS6HryGPsS_BB4xVnWEdk3qL9pw-2nlXwaK4XWWLsi3Errxaq3lqV9Q0Q2wVVkKGidWRZin-DKP1_cGd5mrx03NdBOPn_NUrv9ToRXGFFwe1ZzRNEMRzkCqmcKWqie18kffJdKycK6Avgw6fYn99IpOZ91o8ea8PW6cuMVt4_p_HIx9"/>
              <div>
                <p className={styles.userName}>{user?.name || 'Test Admin'}</p> {/* font-semibold text-sm text-on-surface */}
                <p className={styles.userEmail}>admin@example.com</p> {/* text-xs text-on-surface-secondary */}
              </div>
              <button className={styles.userDropdownButton}> {/* text-on-surface-secondary hover:text-on-surface */}
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            </div>
          </div>
        </header>

        {/* Products Column */}
        <div className={styles.productPanel}> {/* col-span-10 lg:col-span-6 xl:col-span-6 flex flex-col h-full */}
          {/* Section for table selection buttons */}
          <div className={styles.tableSelectionContainer}> {/* flex-shrink-0 mb-6 */}
            <div className={styles.tableSelection}> {/* flex space-x-2 border-b border-gray-200 */}
              {availableTables.map(table => (
                <button
                  key={table}
                  className={`${styles.tableButton} ${currentTable === table ? styles.activeTableButton : ''}`}
                  onClick={() => handleSelectTable(table)}
                >
                  {table}
                </button>
              ))}
              <button className={styles.addTableButton}> {/* px-4 py-3 text-on-surface-secondary hover:text-on-surface */}
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          <div className={styles.productSearchAndGrid}> {/* flex flex-col flex-1 overflow-hidden */}
            <div className={styles.productHeaderAndSearch}> {/* flex items-center justify-between mb-4 */}
              <h2 className={styles.productSectionTitle}>Productos</h2> {/* text-xl font-semibold text-on-surface */}
              <div className={styles.searchContainer}> {/* relative */}
                <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span> {/* absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-secondary text-xl */}
                <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInputExtended} /> {/* w-full pl-10 pr-4 py-2 bg-surface border border-gray-200 rounded-lg focus:ring-primary focus:border-primary text-sm */}
              </div>
            </div>
            <div className={styles.productsGridContainer}> {/* flex-1 overflow-y-auto pr-2 */}
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
        <div className={styles.salePanel}> {/* col-span-10 lg:col-span-4 xl:col-span-4 flex flex-col h-full bg-surface rounded-xl border border-gray-200 */}
          <div className={styles.salePanelContent}> {/* flex-1 flex flex-col p-6 overflow-hidden */}
            <div className={styles.saleHeaderAndClear}> {/* flex items-center justify-between mb-6 */}
              <h2 className={styles.saleSectionTitle}>Venta Actual</h2> {/* text-xl font-semibold text-on-surface */}
              <button className={styles.clearCartButton} onClick={handleCancelSale}> {/* flex items-center text-sm font-medium text-on-surface-secondary hover:text-on-surface */}
                <span className="material-symbols-outlined">delete</span>
                Limpiar Carrito
              </button>
            </div>

            {/* Cart Content (empty state or items) */}
            <div className={styles.cartDisplayArea}> {/* flex-1 flex flex-col items-center justify-center bg-white rounded-lg mb-6 border border-dashed border-gray-300 */}
              {cart.length === 0 ? (
                <div className={styles.cartEmptyState}> {/* flex flex-col items-center justify-center */}
                  <span className="material-symbols-outlined">shopping_cart</span>
                  <p className={styles.cartEmptyText}>El carrito está vacío.</p>
                  <p className={styles.cartEmptySubtitle}>Seleccione productos para empezar</p>
                </div>
              ) : (
                <ul className={styles.cartList}>
                  {cart.map(item => (
                    <li key={item.id} className={styles.cartItem}>
                      <div className={styles.itemDetails}>
                        <p>{item.name}</p>
                        <div className={styles.itemControls}>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className={styles.quantityButton}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className={styles.quantityButton}>+</button>
                          <span className={styles.itemPrice}>x {Number(item.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
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
            
            {/* Totals Section (Subtotal, Impuestos, Total) */}
            <div className={styles.totalsSummary}> {/* space-y-3 mb-6 flex-shrink-0 */}
                <div className={styles.summaryRow}> {/* flex items-center justify-between */}
                    <span className={styles.summaryLabel}>Subtotal</span>
                    <span className={styles.summaryValue}>{subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                </div>
                <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Impuestos (16%)</span>
                    <span className={styles.summaryValue}>{taxAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                </div>
                <div className={styles.totalRow}> {/* flex items-center justify-between text-xl font-bold text-on-surface pt-3 border-t border-gray-200 */}
                    <span>Total:</span>
                    <span>{totalWithTax.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                </div>
            </div>

            {/* Payment Inputs (Cash Received, Payment Method) */}
            <div className={styles.paymentInputsSection}> {/* flex-shrink-0 */}
                <div className={styles.paymentDetailsGrid}> {/* grid grid-cols-2 gap-4 mb-4 */}
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
                                onClick={() => setAmountReceived(calculateTotal())}
                                className={styles.completeAmountButton}
                                disabled={isSubmitting || calculateTotal() === 0}
                            >
                                Completar
                            </button>
                            <button
                                type="button"
                                onClick={() => setAmountReceived('')}
                                className={styles.completeAmountButton}
                                disabled={isSubmitting || amountReceived === ''}
                            >
                                Limpiar
                            </button>
                        </div>
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
                    </div>
                )}
            </div>

            {/* Submit/Cancel Buttons */}
            <div className={styles.actionButtonsContainer}> {/* mt-auto space-y-3 */}
                {submitSuccess && <p className={`${styles.feedbackMessage} ${styles.success}`}>{submitSuccess}</p>}
                {submitError && <p className={styles.submitError}>{submitError}</p>}

                <button
                    onClick={handleFinalizeSale}
                    disabled={cart.length === 0 || isSubmitting}
                    className={styles.finalizeButton}
                >
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>{isSubmitting ? 'Procesando...' : 'Finalizar Venta'}</span>
                </button>
                <button
                    onClick={handleCancelSale}
                    disabled={cart.length === 0 || isSubmitting}
                    className={styles.cancelButton}
                >
                    Cancelar Cuenta
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PosPage;