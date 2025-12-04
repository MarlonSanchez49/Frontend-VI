import apiClient from './api';

const reportsService = {
  /**
   * @returns {Promise<any>} Valor total del inventario.
   */
  getInventoryValue: () => {
    return apiClient.get('/reports/inventory-value');
  },

  /**
   * @returns {Promise<any>} Top 5 productos más movidos.
   */
  getTopProducts: () => {
    return apiClient.get('/reports/top-products');
  },

  /**
   * @returns {Promise<any>} Productos con bajo stock.
   */
  getLowStock: () => {
    return apiClient.get('/reports/low-stock');
  },

  /**
   * @returns {Promise<any>} Movimientos de inventario agrupados por mes.
   */
  getMovementsByMonth: () => {
    return apiClient.get('/reports/movements-by-month');
  },

  /**
   * @returns {Promise<any>} Lista de productos más vendidos.
   */
  getMostSoldProducts: () => {
    return apiClient.get('/reports/most-sold-products');
  },

  /**
   * @param {number} month - El número del mes (1-12).
   * @param {number} year - El año.
   * @returns {Promise<any>} Lista de productos más vendidos para un mes y año específicos.
   */
  getMostSoldProductsByMonth: (month, year) => {
    return apiClient.get(`/reports/most-sold-products-by-month?month=${month}&year=${year}`);
  },
  /**
   * @returns {Promise<any>} Ventas totales agrupadas por mes.
   */
  getMonthlySales: () => {
    // Asumiendo que el endpoint para las ventas mensuales es '/reports/monthly-sales'
    return apiClient.get('/reports/monthly-sales');
  },
};

export default reportsService;
