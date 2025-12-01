import apiClient from './api';

const movementsService = {
  /**
   * Crea un nuevo movimiento de inventario (venta).
   * @param {object} movementData Los datos de la venta.
   * @returns {Promise<any>}
   */
  createMovement: (movementData) => {
    return apiClient.post('/movements', movementData);
  },
};

export default movementsService;
