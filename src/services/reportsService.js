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
};

export default reportsService;
