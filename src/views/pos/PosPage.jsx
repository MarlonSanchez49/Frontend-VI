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
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay 
  
  // --- Estados para la Paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;
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
  const cart = tables[currentTable] || [];
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
    const results = products.filter(
      (p) =>
        p.status === "available" && // 1. Filtra solo productos disponibles
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) // 2. Aplica la búsqueda sobre los disponibles
    );
    setFilteredProducts(results);
    setCurrentPage(1); // Resetear a la primera página con cada nueva búsqueda
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

  // --- Lógica de Paginación ---
  // 1. Cálculo de índices
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
                {/* 2. Iterar sobre la lista paginada */}
                {paginatedProducts.map((product) => (
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
            {/* 3. Controles de Navegación */}
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
    </div>);
};

export default PosPage; 