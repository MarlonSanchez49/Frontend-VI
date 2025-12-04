import apiClient from './api';

const accountingService = {
  /**
   * Obtiene un listado de todas las ventas.
   * @returns {Promise<any>}
   */
  getSales: () => {
    return apiClient.get('/ventas'); // Asumiendo que el endpoint para listar ventas es /api/ventas
  },
};

export default accountingService;
