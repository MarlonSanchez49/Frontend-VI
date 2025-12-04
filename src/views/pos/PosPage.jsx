import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import salesService from "../../services/salesService";
import productService from "../../services/productService";
import { useAuth } from "../../hooks/useAuth";
import { FaSignOutAlt } from 'react-icons/fa';
import useDebounce from '../../hooks/useDebounce';
import tableService from '../../services/tableService';
import paymentMethodService from '../../services/paymentMethodService';
import employeeService from '../../services/employeeService'; // New import
import styles from "./PosPage.module.css";

const PosPage = () => {
<<<<<<< HEAD
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  const { user, logout } = useAuth(); // FIX: Call useAuth to get user
  const navigate = useNavigate(); // Move navigate here if it's used elsewhere
  
  const [saleDetails, setSaleDetails] = useState({ paymentMethod: "Efectivo" });
  const [amountReceived, setAmountReceived] = useState("");
  const [nequiVoucher, setNequiVoucher] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [tableToDeleteName, setTableToDeleteName] = useState(null);
  const [tableToDeleteId, setTableToDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // FIX: Define isLoading state

  // Gestión de mesas
  const [availableTables, setAvailableTables] = useState([]);
  const [currentTable, setCurrentTable] = useState(null); // null initially, set after fetching
  const [tables, setTables] = useState({}); // Cart for each table
  const [paymentMethods, setPaymentMethods] = useState([]); // New state for payment methods
  // Gestión de empleados
  const [availableEmployees, setAvailableEmployees] = useState([]); // New state for employees
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // New state for selected employee

  // Fetch tables on component mount
  useEffect(() => {
            const fetchTables = async () => {
              try {
                const response = await tableService.getTables();
                console.log("Response from tableService.getTables():", response); // DEBUG
                const fetchedTables = response.data || response || [];
                setAvailableTables(fetchedTables);
            // Initialize carts for fetched tables if not already present
        const initialTablesData = {};
        fetchedTables.forEach(table => {
          initialTablesData[table.id] = JSON.parse(localStorage.getItem(`posTableCart_${table.id}`)) || [];
        });
        setTables(initialTablesData);

        if (fetchedTables.length > 0) {
          // Try to restore last selected table or default to the first
          const lastSelectedTableId = localStorage.getItem('lastSelectedTableId');
          const lastSelectedTable = fetchedTables.find(t => t.id === parseInt(lastSelectedTableId));
          setCurrentTable(lastSelectedTable ? lastSelectedTable.id : fetchedTables[0].id);
        } else {
          setCurrentTable(null);
        }
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };
    fetchTables();

    const fetchPaymentMethods = async () => {
        try {
            const response = await paymentMethodService.getPaymentMethods();
            const fetchedMethods = response.data.data || response.data || [];
            setPaymentMethods(fetchedMethods);
        } catch (error) {
            console.error("Error fetching payment methods:", error);
        }
    };
    fetchPaymentMethods();

    const fetchEmployees = async () => { // Add this new function
      try {
        const response = await employeeService.getEmployees();
        console.log("Response from employeeService.getEmployees():", response); // DEBUG
        const fetchedEmployees = response.data.data || response.data || [];
        setAvailableEmployees(fetchedEmployees);

        // Set initial selected employee
        if (fetchedEmployees.length > 0) {
          // Attempt to pre-select the logged-in user if they are in the employee list
          const loggedInEmployee = fetchedEmployees.find(emp => emp.id === user?.id);
          setSelectedEmployeeId(loggedInEmployee ? loggedInEmployee.id : fetchedEmployees[0].id);
        } else {
          setSelectedEmployeeId(null);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees(); // Call the new fetch function
  }, [user]); // Add user to dependency array to re-run if user changes

  // Persist individual table carts to localStorage
  useEffect(() => {
    Object.keys(tables).forEach(tableId => {
      localStorage.setItem(`posTableCart_${tableId}`, JSON.stringify(tables[tableId]));
    });
  }, [tables]);

  // Persist currentTable selection
  useEffect(() => {
    if (currentTable !== null) {
      localStorage.setItem('lastSelectedTableId', currentTable);
    }
  }, [currentTable]);

  const currentTableName = availableTables.find(table => table.id === currentTable)?.name || 'Selecciona una Mesa';
=======
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
>>>>>>> a6364ef1978b8743ec4810de0eec7b7ad2fc4857

  const cart = tables[currentTable] || [];

<<<<<<< HEAD
  const calculateTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = calculateTotal();

  // --- Manejo de Mesas ---

  const fetchAndSetTables = async () => {
    try {
      const response = await tableService.getTables();
      const fetchedTables = response.data.data || response.data || [];
      setAvailableTables(fetchedTables);

      // Update existing carts and remove carts for deleted tables
      setTables(prevTables => {
        const newTables = {};
        fetchedTables.forEach(table => {
          newTables[table.id] = prevTables[table.id] || JSON.parse(localStorage.getItem(`posTableCart_${table.id}`)) || [];
        });
        return newTables;
      });

      // If currentTable was deleted, set to first available or null
      if (currentTable && !fetchedTables.some(t => t.id === currentTable)) {
        setCurrentTable(fetchedTables.length > 0 ? fetchedTables[0].id : null);
      } else if (!currentTable && fetchedTables.length > 0) {
        setCurrentTable(fetchedTables[0].id);
      } else if (fetchedTables.length === 0) {
        setCurrentTable(null);
      }

    } catch (error) {
      console.error("Error fetching tables after modification:", error);
    }
  };


  const handleAddTable = async () => {
    try {
      // Determine the next table number based on existing tables
      const tableNumbers = availableTables
        .map(table => parseInt(table.name.replace("Mesa ", "")))
        .filter(num => !isNaN(num));
      const nextTableNumber = tableNumbers.length > 0 ? Math.max(...tableNumbers) + 1 : 1;
      const newTableName = `Mesa ${nextTableNumber}`;

      const response = await tableService.createTable(newTableName);
      const newTable = response.data; // newTable will have an id and name

      // Optimistic update: Add the new table to availableTables and initialize its cart
      setAvailableTables((prev) => [...prev, newTable]);
      setTables((prev) => ({
        ...prev,
        [newTable.id]: [],
      }));
      setCurrentTable(newTable.id); // Select the newly created table
    } catch (error) {
      console.error("Error creating table:", error);
      // Optionally show an error message to the user
    }
  };

  const handleSelectTable = (tableId) => {
    setCurrentTable(tableId);
  };

  const handleDeleteTable = (tableId) => {
    if (availableTables.length <= 1) {
      alert("No puedes eliminar la última mesa. Debe haber al menos una mesa.");
      return;
    }
    // Find the table name for display in the confirmation dialog
    const tableToDelete = availableTables.find(table => table.id === tableId);
    setTableToDeleteName(tableToDelete.name); // Store the name for the dialog message
    setTableToDeleteId(tableId); // Store the ID for actual deletion
    setShowConfirmDialog(true);
  };

  const confirmDeleteTable = async () => {
    try {
      if (!tableToDeleteId) { // Ensure tableToDeleteId is set
        console.error("No se ha seleccionado ninguna mesa para eliminar.");
        return;
      }

      await tableService.deleteTable(tableToDeleteId);
      
      // Remove from availableTables
      setAvailableTables((prev) =>
        prev.filter((table) => table.id !== tableToDeleteId)
      );

      // Remove its cart from tables state and localStorage
      setTables((prev) => {
        const newTables = { ...prev };
        delete newTables[tableToDeleteId];
        localStorage.removeItem(`posTableCart_${tableToDeleteId}`); // Clear localStorage entry
        return newTables;
      });

      // If the current table was deleted, select a new one
      if (currentTable === tableToDeleteId) {
        const remainingTables = availableTables.filter(
          (table) => table.id !== tableToDeleteId
        );
        setCurrentTable(remainingTables.length > 0 ? remainingTables[0].id : null);
      }
      
      setTableToDeleteName(null); // Clear the stored name
      setTableToDeleteId(null); // Clear the stored ID
      setShowConfirmDialog(false);
    } catch (error) {
      console.error("Error deleting table:", error);
      // Optionally show an error message
    }
  };

  const cancelDeleteTable = () => {
    setTableToDeleteName("");
    setShowConfirmDialog(false);
  };

  // --- Funciones de Productos y Carrito ---

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProducts();
        const apiProducts = response.data.data || response.data || [];

        const productsWithImages = apiProducts.map((p) => ({
          ...p,
          imageUrl:
            (p.imageUrl && (p.imageUrl.startsWith('http') || p.imageUrl.startsWith('https')))
              ? p.imageUrl
              : `https://placehold.co/150x150/E6E6FA/000000?text=${encodeURIComponent(
                  p.name
                )}`,
        }));

        setProducts(productsWithImages);
        setFilteredProducts(productsWithImages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const results = products.filter((p) =>
      p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [debouncedSearchTerm, products]);

  const handleAddToCart = (product) => {
    setTables((prevTables) => {
      const currentTableCart = prevTables[currentTable] || [];
      const existing = currentTableCart.find((item) => item.id === product.id);

      let updatedCart;
      if (existing) {
        updatedCart = currentTableCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedCart = [...currentTableCart, { ...product, quantity: 1 }];
      }
      return {
        ...prevTables,
        [currentTable]: updatedCart,
      };
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setTables((prevTables) => {
      const currentTableCart = prevTables[currentTable] || [];
      let updatedCart;

      if (newQuantity <= 0) {
        updatedCart = currentTableCart.filter((item) => item.id !== productId);
      } else {
        updatedCart = currentTableCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        );
      }
      return {
        ...prevTables,
        [currentTable]: updatedCart,
      };
    });
  };

  // --- Manejo de Venta ---

  const handleSaleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleDetails((prev) => {
      if (name === "paymentMethod" && value !== "Nequi") {
        setNequiVoucher("");
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCancelSale = () => {
    setTables((prevTables) => ({
      ...prevTables,
      [currentTable]: [],
    }));
    setAmountReceived("");
    setNequiVoucher("");
    setSubmitError(null);
    setSubmitSuccess("");
  };

  const handleFinalizeSale = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess("");

    if (cart.length === 0) {
      setSubmitError("El carrito está vacío.");
      setIsSubmitting(false);
      return;
    }

    // Validación de Nequi
    if (saleDetails.paymentMethod === "Nequi" && !nequiVoucher) {
      setSubmitError("Debe ingresar el número de comprobante de Nequi.");
      setIsSubmitting(false);
      return;
    }


    const dynamicPaymentMethodMapping = paymentMethods.reduce((acc, method) => {
        acc[method.name] = method.id;
        return acc;
    }, {});

    const saleData = {
      employee_id: selectedEmployeeId, // Usar el ID del empleado seleccionado
      mesa_id: currentTable, // currentTable is already the ID
      metodo_pago_id: dynamicPaymentMethodMapping[saleDetails.paymentMethod],
      status: "completed",
      total: total,
      nequi_voucher:
        saleDetails.paymentMethod === "Nequi" ? nequiVoucher : null,
      products: cart.map((item) => ({
        id: parseInt(item.id), // Cambiado de product_id a id según el backend
        quantity: item.quantity,
        price: parseFloat(item.price), // Convertir a número flotante
        warehouse_id: 1, // Asumiendo un warehouse_id fijo
        type: "salida", // Cambiado de "venta" a "salida"
      })),
    };

    console.log("Sale Data to be sent:", JSON.stringify(saleData, null, 2)); // DEBUG
    try {
      const response = await salesService.createSale(saleData);
      const responseData = response.data.data || response.data;
      const backendTotal = responseData.total
        ? parseFloat(responseData.total)
        : total;
      const successMessage = `¡Venta registrada con éxito! Total: ${backendTotal.toLocaleString(
        "es-CO",
        { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 }
      )}`;

      setSubmitSuccess(successMessage);

      // Limpiar el carrito de la mesa actual
      setTables((prevTables) => ({
        ...prevTables,
        [currentTable]: [],
      }));
      setAmountReceived("");
      setNequiVoucher("");
      setTimeout(() => setSubmitSuccess(""), 5000);
    } catch (err) {
      let errorMessage = "Error al registrar la venta.";
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const errors = err.response.data.errors;
          const errorDetails = Object.keys(errors)
            .map((key) => `${key}: ${errors[key].join(", ")}`)
            .join("; ");
          errorMessage = `Error de validación: ${errorDetails}`;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      console.error("Error en la venta:", err);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cálculo de cambio si el pago es en efectivo y se ha ingresado un monto
  const change =
    saleDetails.paymentMethod === "Efectivo" && amountReceived > total
      ? amountReceived - total
      : 0;

  if (isLoading)
    return <div className={styles.loading}>Cargando productos...</div>;

  return (
    <div className={styles.posPageContainer}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>Bar Corona</h1>
          <p className={styles.pageSubtitle}>Gestión de pedidos y transacciones</p>
        </div>
        <div className={styles.userControls}>
          <span className={styles.userName}>{user?.name || 'Usuario'}</span>
          <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Rol'}</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      </header>
      <main className={styles.mainGrid}>
        {/* Products Column */}
        <div className={styles.productPanel}>
          <div className={styles.productSearchAndGrid}>
            <div className={styles.productHeaderAndSearch}>
              <h2 className={styles.productSectionTitle}>Productos</h2>
              <div className={`${styles.searchContainer} ${styles.searchContainerInteractive}`}>
                <span className="material-symbols-outlined searchIcon"></span>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInputExtended}
                />

              </div>
            </div>
            <div className={styles.productsGridContainer}>
              <div className={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className={styles.productCard}
                    onClick={() => handleAddToCart(product)}
                  >
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productPrice}>
                      {Number(product.price).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sale Column */}
        <div className={styles.salePanel}>
          <div className={styles.salePanelContent}>
            <div className={styles.saleHeaderAndClear}>
              <h2 className={styles.saleSectionTitle}>
                Venta Actual ({currentTableName})
              </h2>
              <button
                className={styles.clearCartButton}
                onClick={handleCancelSale}
              >
                Limpiar Carrito
              </button>
            </div>

            <div className={styles.cartDisplayArea}>
              {cart.length === 0 ? (
                <div className={styles.cartEmptyState}>

                  <p className={styles.cartEmptyText}>El carrito está vacío.</p>
                  <p className={styles.cartEmptySubtitle}>
                    Seleccione productos para empezar
                  </p>
                </div>
              ) : (
                <ul className={styles.cartList}>
                  {cart.map((item) => (
                    <li key={item.id} className={styles.cartItem}>
                      <div className={styles.itemDetails}>
                        <p className={styles.itemName}>{item.name}</p>
                        <div className={styles.itemControls}>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className={styles.quantityButton}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.25rem" }}
                            >
                              -
                            </span>
                          </button>
                          <span className={styles.itemQuantity}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className={styles.quantityButton}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.25rem" }}
                            >
                              +
                            </span>
                          </button>
                          <span className={styles.itemPriceUnit}>
                            x{" "}
                            {Number(item.price).toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      </div>
                      <div className={styles.itemTotal}>
                                              {(item.quantity * item.price).toLocaleString("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                              })}                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.totalDisplay}>
              <p className={styles.totalLabel}>TOTAL:</p>
              <p className={styles.totalValue}>
                {total.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>

            <div className={styles.paymentInputsSection}>
              <div className={styles.paymentDetailsGrid}>
                {/* --- New Table Selection Dropdown --- */}
                <div className={styles.tableSelectionGroup}>
                  <label className={styles.inputLabel} htmlFor="tableSelect">
                    Mesa
                  </label>
                  <select
                    name="tableSelect"
                    id="tableSelect"
                    value={currentTable || ''} // Use currentTable ID as value
                    onChange={(e) => handleSelectTable(parseInt(e.target.value))}
                    className={styles.formSelect} // Reuse formSelect style
                    disabled={isSubmitting || availableTables.length === 0}
                  >
                    {availableTables.length === 0 && <option value="">No hay mesas disponibles</option>}
                    {availableTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* --- End New Table Selection Dropdown --- */}

                {/* --- New Employee Selection Dropdown --- */}
                <div className={styles.employeeSelectionGroup}>
                  <label className={styles.inputLabel} htmlFor="employeeSelect">
                    Empleado
                  </label>
                  <select
                    name="employeeSelect"
                    id="employeeSelect"
                    value={selectedEmployeeId || ''}
                    onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))}
                    className={styles.formSelect}
                    disabled={isSubmitting || availableEmployees.length === 0}
                  >
                    {availableEmployees.length === 0 && <option value="">No hay empleados disponibles</option>}
                    {availableEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* --- End New Employee Selection Dropdown --- */}

                {/* Efectivo Recibido (Condicional, solo si el método es Efectivo) */}
                {saleDetails.paymentMethod === "Efectivo" && (
                  <div className={styles.cashReceivedGroup}>
                    <label
                      className={styles.inputLabel}
                      htmlFor="amountReceived"
                    >
                      Efectivo Recibido
                    </label>
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
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => setAmountReceived(total.toString())}
                        className={styles.completeAmountButton}
                        disabled={isSubmitting || total <= 0}
                      >
                        Completar
                      </button>
                    </div>
                  </div>
                )}

                <div className={styles.paymentMethodGroup}>
                  <label className={styles.inputLabel} htmlFor="paymentMethod">
                    Método de Pago
                  </label>
                  <select
                    name="paymentMethod"
                    id="paymentMethod"
                    value={saleDetails.paymentMethod}
                    onChange={handleSaleInputChange}
                    className={styles.formSelect}
                    disabled={isSubmitting}
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.name}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comprobante Nequi (Solo si el método es Nequi) */}
              {saleDetails.paymentMethod === "Nequi" && (
                <div
                  className={`${styles.nequiVoucherInputGroup} ${styles.fullWidth}`}
                >
                  <label className={styles.inputLabel} htmlFor="nequiVoucher">
                    Número de Comprobante Nequi (Requerido)
                  </label>
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

              {/* Cálculo de Cambio */}
              {saleDetails.paymentMethod === "Efectivo" && change > 0 && (
                <div className={styles.changeDisplay}>
                  <p className={styles.changeLabel}>CAMBIO:</p>
                  <p className={styles.changeValue}>
                                      {change.toLocaleString("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      })}                  </p>
                </div>
              )}
            </div>

            <div className={styles.actionButtonsContainer}>
              {submitSuccess && (
                <p className={`${styles.feedbackMessage} ${styles.success}`}>
                  {submitSuccess}
                </p>
              )}
              {submitError && (
                <p className={styles.submitError}>{submitError}</p>
              )}

              <button
                onClick={handleFinalizeSale}
                disabled={cart.length === 0 || isSubmitting}
                className={styles.finalizeButton}
              >
                <span>
                  {isSubmitting ? "Procesando..." : "Finalizar Venta"}
                </span>
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
        {/* Fin de Sale Column */}
      </main>

      {/* Confimation Dialog (Modal) */}
      {showConfirmDialog && (
        <div className={styles.confirmDialogOverlay}>
          <div className={styles.confirmDialogBox}>
            <p className={styles.confirmDialogMessage}>
              ¿Estás seguro de que quieres eliminar la mesa "{tableToDeleteName}
              "? Esto borrará todos los productos en su carrito.
            </p>
            <div className={styles.confirmDialogButtons}>
              <button
                onClick={cancelDeleteTable}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTable}
                className={styles.confirmDeleteButton}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
=======
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
>>>>>>> a6364ef1978b8743ec4810de0eec7b7ad2fc4857
};

export default PosPage; 