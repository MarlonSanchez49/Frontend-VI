import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import movementsService from '../../services/movementsService';
import productService from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import styles from './PosPage.module.css';

const PosPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saleDetails, setSaleDetails] = useState({ tableNumber: '', tip: '', paymentMethod: 'Efectivo' });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const results = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const handleSaleInputChange = (e) => {
      const { name, value } = e.target;
      setSaleDetails(prev => ({ ...prev, [name]: value }));
  }

  const calculateTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  const handleFinalizeSale = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess('');
    const movementData = {
      employee_id: user.id,
      movement_type: 'salida',
      details: cart.map(item => ({ product_id: item.id, quantity: item.quantity, unit_price: item.price })),
      ...saleDetails,
      total: calculateTotal()
    };

    try {
      await movementsService.createMovement(movementData);
      setSubmitSuccess('¡Venta registrada con éxito!');
      setCart([]);
      setSaleDetails({ tableNumber: '', tip: '', paymentMethod: 'Efectivo' });
      setTimeout(() => setSubmitSuccess(''), 3000);
    } catch (err) {
      setSubmitError('Error al registrar la venta. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className={styles.loading}>Cargando productos...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.productsColumn}>
        <h1 className={styles.productsHeader}>Productos</h1>
        <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} />
        <div className={styles.productsGrid}>
          {filteredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productName}>{product.name}</div>
              <div className={styles.productPrice}>${Number(product.price).toLocaleString('es-MX')}</div>
              <button onClick={() => handleAddToCart(product)} className={styles.addButton}>Agregar</button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.saleColumn}>
        <button onClick={handleLogout} className={styles.logoutPosButton}>Cerrar Sesión</button>
        <h1 className={styles.saleHeader}>Venta Actual</h1>
        <div className={styles.cart}>
          {cart.length === 0 ? <p className={styles.cartEmpty}>El carrito está vacío.</p> : <ul>
              {cart.map(item => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.itemDetails}>
                    <p>{item.name}</p>
                    <div className={styles.itemControls}>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className={styles.quantityButton}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className={styles.quantityButton}>+</button>
                      <span className={styles.itemPrice}>x ${Number(item.price).toLocaleString('es-MX')}</span>
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    ${(item.quantity * item.price).toLocaleString('es-MX')}
                  </div>
                </li>
              ))}
            </ul>}
        </div>
        
        <div className={styles.totalSection}>
            <div className={styles.totalDisplay}>
                <span>Total:</span>
                <span>${calculateTotal().toLocaleString('es-MX')}</span>
            </div>
            
            <fieldset disabled={isSubmitting} className={styles.saleForm}>
                <input type="text" name="tableNumber" placeholder="Mesa Atendida" value={saleDetails.tableNumber} onChange={handleSaleInputChange} className={styles.formInput}/>
                <input type="number" name="tip" placeholder="Propina (opcional)" value={saleDetails.tip} onChange={handleSaleInputChange} className={styles.formInput}/>
                <select name="paymentMethod" value={saleDetails.paymentMethod} onChange={handleSaleInputChange} className={styles.formSelect}>
                    <option>Efectivo</option>
                    <option>Tarjeta de Crédito</option>
                    <option>Tarjeta de Débito</option>
                </select>
            </fieldset>

            {submitSuccess && <p className={`${styles.feedbackMessage} ${styles.success}`}>{submitSuccess}</p>}
            {submitError && <p className={`${styles.feedbackMessage} ${styles.submitError}`}>{submitError}</p>}

            <button
              onClick={handleFinalizeSale}
              disabled={cart.length === 0 || isSubmitting}
              className={styles.finalizeButton}
            >
              {isSubmitting ? 'Procesando Venta...' : 'Finalizar Venta'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PosPage;
