import apiClient from './api';

const salesService = {
  /**
   * Crea una nueva venta.
   * @param {object} saleData Los datos de la venta.
   * @returns {Promise<any>}
   */
  createSale: (saleData) => {
    // Asumiendo que el endpoint para crear ventas es '/ventas'
    return apiClient.post('/ventas', saleData);
  },
  getSalesByDate: (date) => {
    return apiClient.get(`/ventas/by-date?date=${date}`);
  },

  /**
   * Obtiene todas las ventas.
   * @returns {Promise<any>}
   */
  getSales: () => {
    return apiClient.get('/ventas');
  },
};

export default salesService;
