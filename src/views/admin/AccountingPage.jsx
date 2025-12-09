import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { FaSignOutAlt } from 'react-icons/fa'; // Mantener FaSignOutAlt
import styles from './AccountingPage.module.css';
import accountingService from '../../services/accountingService'; // Importar el nuevo servicio
import paymentMethodService from '../../services/paymentMethodService'; // Importar el servicio de métodos de pago
import employeeService from '../../services/employeeService';
import { FaEye, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const AccountingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sales, setSales] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);
    const [errorSales, setErrorSales] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
    const [errorPaymentMethods, setErrorPaymentMethods] = useState(null);

    const [employeesList, setEmployeesList] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [errorEmployees, setErrorEmployees] = useState(null);
    const [employeeFilter, setEmployeeFilter] = useState(''); // '' = todos

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedSale, setSelectedSale] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [loadingSaleDetails, setLoadingSaleDetails] = useState(false);
    const [saleDetailsError, setSaleDetailsError] = useState(null);

    useEffect(() => {
        const fetchAccountingData = async () => {
            // Fetch Sales
            try {
                setLoadingSales(true);
                const salesResponse = await accountingService.getSales();
                setSales(salesResponse.data.data || salesResponse.data || []);
            } catch (err) {
                console.error("Error fetching sales:", err);
                setErrorSales("Error al cargar las ventas.");
            } finally {
                setLoadingSales(false);
            }

            // Fetch Payment Methods
            try {
                setLoadingPaymentMethods(true);
                const pmResponse = await paymentMethodService.getPaymentMethods();
                setPaymentMethods(pmResponse.data.data || pmResponse.data || []);
            } catch (err) {
                console.error("Error fetching payment methods:", err);
                setErrorPaymentMethods("Error al cargar los métodos de pago.");
            } finally {
                setLoadingPaymentMethods(false);
            }

            // Fetch Employees for filter
            try {
                setLoadingEmployees(true);
                const empResp = await employeeService.getEmployees();
                const emps = empResp.data.data || empResp.data || [];
                setEmployeesList(emps);
            } catch (err) {
                console.error('Error fetching employees for filter:', err);
                setErrorEmployees('Error al cargar empleados.');
            } finally {
                setLoadingEmployees(false);
            }
        };
        fetchAccountingData();
    }, []); // El efecto se ejecuta una vez al montar

    // Función para calcular ingresos netos para un rango de fechas (inclusive)
    const calculateRevenueForRange = (start, end, allSales) => {
        if (!allSales || allSales.length === 0) return 0;
        let s = new Date(start);
        let e = new Date(end);
        if (s > e) {
            const tmp = s; s = e; e = tmp;
        }
        const startStr = s.toISOString().split('T')[0];
        const endStr = e.toISOString().split('T')[0];

        const filteredSales = allSales.filter(sale => {
            const saleDateString = new Date(sale.created_at).toISOString().split('T')[0];
            return saleDateString >= startStr && saleDateString <= endStr;
        });

        return filteredSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    };

    // Helper para formatear/extraer la mesa de una venta (soporta objetos y múltiples nombres)
    const formatTable = (s) => {
        if (!s) return '';
        const t = s?.mesa || s?.table || s?.table_number || s?.mesa_numero || s?.table_name || s?.mesa_nombre || s?.table_info || s?.mesa_info || s?.table_id || s?.mesa_id;
        if (!t && s?.table && typeof s.table === 'object') {
            const o = s.table;
            return o.name || o.nombre || o.number || o.numero || String(o.id || '');
        }
        if (typeof t === 'object') {
            return t.name || t.nombre || t.number || t.numero || String(t.id || '');
        }
        return t ? String(t) : '';
    };

    // Redondear números (quitar decimales)
    const roundNumber = (v) => {
        if (v === '' || v === null || v === undefined) return '';
        const n = Number(v);
        if (!Number.isFinite(n)) return '';
        return Math.round(n);
    };

    // Ventas filtradas para la tabla según rango de fechas y empleado
    const getFilteredSalesForDisplay = () => {
        if (!sales || sales.length === 0) return [];
        let s = new Date(startDate);
        let e = new Date(endDate);
        if (s > e) {
            const tmp = s; s = e; e = tmp;
        }
        const startStr = s.toISOString().split('T')[0];
        const endStr = e.toISOString().split('T')[0];

        const saleBelongsToEmployee = (saleObj, empId) => {
            if (!saleObj || !empId) return false;
            const idStr = String(empId);
            // campos directos
            const directIds = [saleObj.user_id, saleObj.employee_id, saleObj.waiter_id, saleObj.mesero_id, saleObj.seller_id, saleObj.created_by, saleObj.staff_id];
            for (const d of directIds) {
                if (d !== undefined && d !== null && String(d) === idStr) return true;
            }
            // objetos nested
            const nested = [saleObj.user, saleObj.employee, saleObj.waiter, saleObj.mesero, saleObj.seller, saleObj.staff];
            for (const n of nested) {
                if (n && (String(n.id) === idStr || String(n.user_id) === idStr)) return true;
            }
            // algunas APIs devuelven arrays de actores o cambios
            if (Array.isArray(saleObj.staffs)) {
                if (saleObj.staffs.some(s => String(s.id) === idStr || String(s.user_id) === idStr)) return true;
            }
            // fallback false
            return false;
        };

        return sales.filter(sale => {
            const saleDateString = new Date(sale.created_at).toISOString().split('T')[0];
            if (saleDateString < startStr || saleDateString > endStr) return false;

            if (employeeFilter) {
                return saleBelongsToEmployee(sale, employeeFilter);
            }
            return true;
        });
    };

    const filteredSalesForDisplay = getFilteredSalesForDisplay();
    const currentRangeRevenue = calculateRevenueForRange(startDate, endDate, sales);

    // Exportar ventas filtradas a CSV (compatible con Excel)
    const exportSalesToCSV = () => {
        const rows = [];
        // Cabeceras
        rows.push(['id', 'fecha', 'empleado', 'mesa', 'metodo_pago', 'total', 'productos']);

        const formatEmployee = (s) => {
            return s?.user?.name || s?.employee?.name || s?.mesero?.name || s?.waiter_name || s?.employee_name || s?.user_name || s?.seller_name || String(s?.user_id || s?.employee_id || s?.waiter_id || '') || 'N/A';
        };

        

        const getPaymentName = (s) => {
            const pmId = s?.metodo_pago_id || s?.payment_method_id || s?.payment_method;
            const found = paymentMethods.find(pm => String(pm.id) === String(pmId));
            if (found) return found.name || String(found.name);
            if (s?.payment_method_name) return s.payment_method_name;
            return 'N/A';
        };

        const normalizeItems = (sale) => {
            const itemsRaw = sale?.items || sale?.detalles || sale?.lines || sale?.sale_items || sale?.products || sale?.order_items || sale?.detalles_venta || sale?.items_sold || sale?.sale_items_details || [];
            let items = [];
            if (Array.isArray(itemsRaw)) items = itemsRaw;
            else if (itemsRaw && typeof itemsRaw === 'object') items = Object.values(itemsRaw);
            return items.map(it => {
                if (!it) return '';
                // nombre
                const name = (typeof it === 'string' || typeof it === 'number') ? String(it) : (it.name || it.product_name || it.title || (it.product && it.product.name) || 'Item');
                // qty
                const qtyRaw = it.quantity ?? it.cantidad ?? it.qty ?? it.count ?? it.cant ?? (it.pivot && (it.pivot.quantity ?? it.pivot.cantidad)) ?? '';
                const qty = qtyRaw === '' ? '' : roundNumber(qtyRaw);
                return `${name}${qty !== '' ? ' x' + qty : ''}`;
            }).filter(Boolean).join(' | ');
        };

        for (const s of filteredSalesForDisplay) {
            const id = s.id ?? '';
            const fecha = s.created_at ? new Date(s.created_at).toLocaleString() : '';
            const empleado = formatEmployee(s);
            const mesa = formatTable(s);
            const metodo = getPaymentName(s);
            const total = roundNumber(s?.total ?? s?.cantidad_total ?? 0);
            const productos = normalizeItems(s);
            rows.push([id, fecha, empleado, mesa, metodo, total, productos]);
        }

        // Convertir a CSV
        const csvContent = rows.map(r => r.map(field => {
            if (field === null || field === undefined) return '';
            const f = String(field);
            // escapado básico de comillas dobles
            return '"' + f.replace(/"/g, '""') + '"';
        }).join(',')).join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const startStr = new Date(startDate).toISOString().split('T')[0];
        const endStr = new Date(endDate).toISOString().split('T')[0];
        a.href = url;
        a.download = `ventas_${startStr}_a_${endStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Exportar ventas filtradas a .xlsx (mejor presentación)
    const exportSalesToXLSX = () => {
        // Preparar filas para hoja 'Ventas' y hoja 'Productos'
        const salesRows = [];
        const productsRows = [];
        // Añadir columna de Productos detallados en la hoja Ventas
        salesRows.push(['ID', 'Fecha', 'Empleado', 'Mesa', 'Método Pago', 'Total', 'Productos Detalle']);
        productsRows.push(['Venta ID', 'Producto', 'Cantidad', 'Precio']);

        const formatEmployee = (s) => {
            return s?.user?.name || s?.employee?.name || s?.mesero?.name || s?.waiter_name || s?.employee_name || s?.user_name || s?.seller_name || String(s?.user_id || s?.employee_id || s?.waiter_id || '') || 'N/A';
        };

        const getPaymentName = (s) => {
            const pmId = s?.metodo_pago_id || s?.payment_method_id || s?.payment_method;
            const found = paymentMethods.find(pm => String(pm.id) === String(pmId));
            if (found) return found.name || String(found.name);
            if (s?.payment_method_name) return s.payment_method_name;
            return 'N/A';
        };

        const normalizeItemsToArray = (sale) => {
            const itemsRaw = sale?.items || sale?.detalles || sale?.lines || sale?.sale_items || sale?.products || sale?.order_items || sale?.detalles_venta || sale?.items_sold || sale?.sale_items_details || [];
            let items = [];
            if (Array.isArray(itemsRaw)) items = itemsRaw;
            else if (itemsRaw && typeof itemsRaw === 'object') items = Object.values(itemsRaw);
            return items.map(it => {
                if (!it) return null;
                const name = (typeof it === 'string' || typeof it === 'number') ? String(it) : (it.name || it.product_name || it.title || (it.product && it.product.name) || 'Item');
                const qtyRaw = it.quantity ?? it.cantidad ?? it.qty ?? it.count ?? it.cant ?? (it.pivot && (it.pivot.quantity ?? it.pivot.cantidad)) ?? '';
                const qty = qtyRaw === '' ? '' : roundNumber(qtyRaw);
                const priceRaw = it.price ?? it.precio ?? it.unit_price ?? it.price_unit ?? it.price_val ?? it.value ?? it.priceValue ?? it.total_price ?? it.price_total ?? '';
                const price = priceRaw === '' ? '' : roundNumber(priceRaw);
                return { name, qty, price };
            }).filter(Boolean);
        };

        for (const s of filteredSalesForDisplay) {
            const id = s.id ?? '';
            const fecha = s.created_at ? new Date(s.created_at).toLocaleString() : '';
            const empleado = formatEmployee(s);
            const mesa = formatTable(s);
            const metodo = getPaymentName(s);
            const total = roundNumber(s?.total ?? s?.cantidad_total ?? 0);

            const items = normalizeItemsToArray(s);
            // Crear texto detallado para la celda de productos en la hoja Ventas
            const productDetailLines = items.map(it => {
                const priceStr = (it.price !== '' && it.price !== undefined && it.price !== null) ? Number(it.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '';
                const qtyStr = (it.qty !== '' && it.qty !== undefined && it.qty !== null) ? String(it.qty) : '';
                return `${it.name}${qtyStr ? ' x' + qtyStr : ''}${priceStr ? ' — ' + priceStr : ''}`;
            });
            const productosDetalle = productDetailLines.join('\n');

            for (const it of items) {
                productsRows.push([id, it.name, it.qty === '' ? '' : roundNumber(it.qty), it.price === '' ? '' : roundNumber(it.price)]);
            }
            // Añadir la fila de venta con columna de detalle de productos
            salesRows.push([id, fecha, empleado, mesa, metodo, total, productosDetalle]);
        }

        const wb = XLSX.utils.book_new();
        const wsSales = XLSX.utils.aoa_to_sheet(salesRows);
        // Ajustar anchos de columnas (en píxeles aproximados) - ahora 7 columnas
        wsSales['!cols'] = [{ wpx: 60 }, { wpx: 160 }, { wpx: 160 }, { wpx: 80 }, { wpx: 120 }, { wpx: 100 }, { wpx: 360 }];
        XLSX.utils.book_append_sheet(wb, wsSales, 'Ventas');

        const wsProducts = XLSX.utils.aoa_to_sheet(productsRows);
        wsProducts['!cols'] = [{ wpx: 80 }, { wpx: 300 }, { wpx: 80 }, { wpx: 100 }];
        // Intentar aplicar formato tipo "tabla": encabezados en negrita, autofiltro y anchos
        try {
            const prodLen = productsRows.length;
            // Asegurar que las celdas de cantidad/precio sean numéricas
            for (let r = 1; r < prodLen; r++) {
                const rowIndex = r + 1; // 1-based for Excel
                const qtyAddr = XLSX.utils.encode_cell({ c: 2, r: r });
                const priceAddr = XLSX.utils.encode_cell({ c: 3, r: r });
                if (wsProducts[qtyAddr] && wsProducts[qtyAddr].v !== '' && wsProducts[qtyAddr].v !== null) {
                    wsProducts[qtyAddr].t = 'n';
                    wsProducts[qtyAddr].v = Number(wsProducts[qtyAddr].v);
                }
                if (wsProducts[priceAddr] && wsProducts[priceAddr].v !== '' && wsProducts[priceAddr].v !== null) {
                    wsProducts[priceAddr].t = 'n';
                    wsProducts[priceAddr].v = Number(wsProducts[priceAddr].v);
                }
            }

            // Encabezados en negrita y centrados
            const headerCols = productsRows[0].length;
            for (let c = 0; c < headerCols; c++) {
                const addr = XLSX.utils.encode_cell({ c, r: 0 });
                if (!wsProducts[addr]) wsProducts[addr] = { v: productsRows[0][c], t: 's' };
                wsProducts[addr].s = wsProducts[addr].s || {};
                wsProducts[addr].s.font = Object.assign({}, wsProducts[addr].s.font, { bold: true });
                wsProducts[addr].s.alignment = Object.assign({}, wsProducts[addr].s.alignment, { horizontal: 'center' });
            }

            // Agregar autofiltro para la tabla
            wsProducts['!autofilter'] = { ref: `A1:D${prodLen}` };
        } catch (err) {
            // No bloquear la exportación si algo falla en el formateo
            console.warn('No se pudo aplicar formato de tabla a Productos:', err);
        }

        XLSX.utils.book_append_sheet(wb, wsProducts, 'Productos');

        const startStr = new Date(startDate).toISOString().split('T')[0];
        const endStr = new Date(endDate).toISOString().split('T')[0];
        const filename = `ventas_${startStr}_a_${endStr}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleViewDetails = async (sale) => {
        setSaleDetailsError(null);
        setLoadingSaleDetails(true);
        try {
            // Intentar obtener detalles desde el backend
            const resp = await accountingService.getSaleDetails(sale.id);
            const detailData = resp?.data?.data || resp?.data || sale;
            console.debug('Detalle de venta recibido:', detailData);
            setSelectedSale(detailData);
        } catch (err) {
            console.warn('No se pudieron obtener detalles desde backend, usando objeto de fila:', err);
            // Fallback: usar la venta ya cargada
            setSelectedSale(sale);
        } finally {
            setLoadingSaleDetails(false);
            setDetailsModalOpen(true);
        }
    };

    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedSale(null);
        setSaleDetailsError(null);
    };

    // Combinar estados de carga y error
    const isLoading = loadingSales || loadingPaymentMethods;
    const isError = errorSales || errorPaymentMethods;

    if (isLoading) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar />
                <div className={styles.mainContent}>
                    <p>Cargando datos contables...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.dashboardLayout}>
                <Sidebar />
                <div className={styles.mainContent}>
                    <p className={styles.errorMessage}>{isError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardLayout}>
            <Sidebar />
            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.pageTitle}>Contabilidad</h1>
                        <p className={styles.pageSubtitle}>Resumen financiero y gestión de flujo de caja</p>
                    </div>
                    <div className={styles.userControls}>
                        <span className={styles.userName}>{user?.name || 'Usuario'}</span>
                        <span className={styles.userRole}>{user ? (user.role_id === 1 ? 'admin' : 'empleado') : 'Cargo'}</span>
                        <button onClick={handleLogout} className={styles.logoutButton}>
                            <FaSignOutAlt /> Cerrar sesión
                        </button>
                    </div>
                </header>

                <section className={styles.transactionsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.listTitle}>Ventas (rango)</h2>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div className={styles.dateFilterContainer}>
                                <label htmlFor="startDate" className={styles.dateFilterLabel}>Fecha inicio:</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={new Date(startDate).toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        setStartDate(new Date(e.target.value + 'T00:00:00Z'));
                                    }}
                                    className={styles.dateFilterInput}
                                />
                            </div>

                            <div className={styles.dateFilterContainer}>
                                <label htmlFor="endDate" className={styles.dateFilterLabel}>Fecha fin:</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={new Date(endDate).toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        setEndDate(new Date(e.target.value + 'T00:00:00Z'));
                                    }}
                                    className={styles.dateFilterInput}
                                />
                            </div>

                            <div className={styles.employeeFilterContainer}>
                                <label htmlFor="employeeFilter" className={styles.dateFilterLabel}>Filtrar por Empleado:</label>
                                <select id="employeeFilter" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className={styles.employeeFilterSelect}>
                                    <option value="">Todos</option>
                                    {employeesList.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name || emp.nombre || `#${emp.id}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <button className={`${styles.detailsButton}`} onClick={exportSalesToXLSX} title="Exportar ventas a Excel (.xlsx)">Exportar a Excel</button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.totalDailyRevenue}>
                        <strong>Ingresos Netos del rango seleccionado:</strong>{' '}
                        {Number(currentRangeRevenue).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        })}
                    </div>
                    <div className={styles.tableContainer}>
                        <table className={styles.transactionsTable}>
                            <thead>
                                <tr>
                                    <th>FECHA</th>
                                    <th>DESCRIPCIÓN</th>
                                    <th>TOTAL</th>
                                    <th>MÉTODO PAGO</th>
                                    <th>ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalesForDisplay.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center' }}>No hay ventas para el rango seleccionado.</td>
                                    </tr>
                                ) : (
                                    filteredSalesForDisplay.map((sale) => {
                                        const paymentMethodName = paymentMethods.find(
                                            (pm) => pm.id === sale.metodo_pago_id
                                        )?.name || 'Desconocido';
                                        return (
                                            <tr key={sale.id}>
                                                <td>{new Date(sale.created_at).toLocaleDateString()}</td>
                                                <td>Venta #{sale.id}</td>
                                                <td className={styles.income}>
                                                    {Number(sale.total).toLocaleString("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    })}
                                                </td>
                                                <td>{paymentMethodName}</td>
                                                <td>
                                                    <button className={styles.detailsButton} onClick={() => handleViewDetails(sale)} title="Ver detalles">
                                                        <FaEye /> Ver detalles
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
                {detailsModalOpen && (
                    <SaleDetailModal sale={selectedSale} loading={loadingSaleDetails} onClose={closeDetailsModal} paymentMethods={paymentMethods} />
                )}
            </div>
        </div>
    );
};

// Modal simple para mostrar detalles de la venta
const SaleDetailModal = ({ sale, onClose, loading, paymentMethods }) => {
    if (!sale && !loading) return null;
    const itemsRaw = sale?.items || sale?.detalles || sale?.lines || sale?.sale_items || sale?.products || sale?.order_items || sale?.detalles_venta || sale?.items_sold || sale?.sale_items_details || [];

    // Normalizar items: si viene como objeto, convertir a array de valores
    let items = [];
    if (Array.isArray(itemsRaw)) {
        items = itemsRaw;
    } else if (itemsRaw && typeof itemsRaw === 'object') {
        // Algunos backends devuelven un objeto con claves por id
        const possibleArray = Object.values(itemsRaw);
        if (possibleArray.length > 0) items = possibleArray;
    }

    const rawWaiter = sale?.mesero || sale?.waiter || sale?.waiter_name || sale?.employee_name || sale?.employee || sale?.user || sale?.user_name || sale?.waiter_info || 'N/A';
    const rawTable = sale?.mesa || sale?.table || sale?.table_number || sale?.mesa_numero || sale?.table_name || 'N/A';
    const total = sale?.total ?? sale?.cantidad_total ?? 0;

    // Resolver nombre de método de pago si se tiene lista
    let paymentMethodName = 'N/A';
    if (paymentMethods && paymentMethods.length > 0) {
        const pmId = sale?.metodo_pago_id || sale?.payment_method_id || sale?.payment_method;
        const found = paymentMethods.find(pm => String(pm.id) === String(pmId));
        if (found) paymentMethodName = found.name || String(found.name);
    }
    if (paymentMethodName === 'N/A') {
        const pmFromSale = sale?.payment_method_name || sale?.payment_method;
        if (pmFromSale) {
            if (typeof pmFromSale === 'object') {
                paymentMethodName = pmFromSale.name || pmFromSale.nombre || JSON.stringify(pmFromSale);
            } else {
                paymentMethodName = String(pmFromSale);
            }
        }
    }

    const safeString = (val) => {
        if (val === undefined || val === null) return 'N/A';
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val);
        if (typeof val === 'object') {
            return val.name || val.nombre || val.title || val.id || JSON.stringify(val);
        }
        return String(val);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <button onClick={onClose} className={styles.modalCloseButton} aria-label="Cerrar"><FaTimes /></button>
                <h2>Detalles de la Venta #{sale?.id}</h2>
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <div>
                        <p><strong>Fecha:</strong> {sale && new Date(sale.created_at).toLocaleString()}</p>
                        <p><strong>Mesero:</strong> {safeString(rawWaiter)}</p>
                        <p><strong>Mesa:</strong> {safeString(rawTable)}</p>
                        <p><strong>Método de pago:</strong> {safeString(paymentMethodName)}</p>
                        <p><strong>Total:</strong> {Number(total).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>

                        <h3>Productos</h3>
                        {items && items.length > 0 ? (
                            <table className={styles.transactionsTable}>
                                <thead>
                                    <tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr>
                                </thead>
                                <tbody>
                                    {items.map((it, idx) => {
                                        // helper para obtener nombre, cantidad y precio con múltiples formatos posibles
                                        if (it == null) return null;

                                        const getName = (obj) => {
                                            if (!obj) return 'Item';
                                            if (typeof obj === 'string' || typeof obj === 'number') return String(obj);
                                            if (obj.product && typeof obj.product === 'object') return obj.product.name || obj.product.title || obj.product.product_name || 'Item';
                                            return obj.name || obj.product_name || obj.title || obj.descripcion || obj.label || 'Item';
                                        };

                                        const parseNumber = (v) => {
                                            if (v === undefined || v === null) return null;
                                            if (typeof v === 'number' && !Number.isNaN(v)) return v;
                                            const n = Number(v);
                                            return Number.isNaN(n) ? null : n;
                                        };

                                        const getQty = (obj) => {
                                            if (!obj) return 0;
                                            // campos directos
                                            const direct = obj.quantity ?? obj.cantidad ?? obj.qty ?? obj.count ?? obj.cant ?? obj.amount ?? obj.total_quantity ?? obj.quantity_sold ?? obj.qty_sold ?? obj.count_sold ?? obj.cantidad_vendida;
                                            const p = parseNumber(direct);
                                            if (p !== null) return p;
                                            // pivot (Laravel many-to-many)
                                            if (obj.pivot) {
                                                const pivotQty = obj.pivot.quantity ?? obj.pivot.cantidad ?? obj.pivot.qty;
                                                const pq = parseNumber(pivotQty);
                                                if (pq !== null) return pq;
                                            }
                                            // si viene dentro de product subobj
                                            if (obj.product && typeof obj.product === 'object') {
                                                const pq2 = parseNumber(obj.product.quantity ?? obj.product.qty ?? obj.product.cantidad);
                                                if (pq2 !== null) return pq2;
                                            }
                                            // intentar inferir a partir de total/price
                                            const totalVal = parseNumber(obj.total) ?? parseNumber(obj.total_price) ?? parseNumber(obj.price_total) ?? parseNumber(obj.subtotal);
                                            const unitVal = parseNumber(obj.price) ?? parseNumber(obj.precio) ?? parseNumber(obj.unit_price) ?? parseNumber(obj.price_unit);
                                            if (totalVal !== null && unitVal !== null && unitVal !== 0) {
                                                const inferred = Math.round((totalVal / unitVal) * 100) / 100; // hasta 2 decimales
                                                if (!Number.isNaN(inferred) && inferred !== Infinity) return inferred;
                                            }
                                            return 0;
                                        };

                                        const getPrice = (obj) => {
                                            const v = obj.price ?? obj.precio ?? obj.unit_price ?? obj.price_unit ?? obj.price_val ?? obj.value ?? obj.priceValue ?? obj.total_price ?? obj.price_total;
                                            let pv = v;
                                            if (typeof pv === 'object' && pv !== null) pv = pv.value ?? pv.amount ?? pv.price ?? null;
                                            const parsed = parseNumber(pv);
                                            return parsed;
                                        };

                                        const name = getName(it);
                                        const qty = getQty(it);
                                        const priceVal = getPrice(it);
                                        const priceFormatted = priceVal !== null ? Number(priceVal).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '-';

                                        return (
                                            <tr key={idx}>
                                                <td>{name}</td>
                                                <td>{qty}</td>
                                                <td>{priceFormatted}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p>No hay productos registrados en esta venta.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountingPage;
