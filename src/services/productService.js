import apiClient from './api';

const productService = {
  /**
   * @returns {Promise<any>} Lista de todos los productos.
   */
  getProducts: () => {
    return apiClient.get('/products');
  },
};

export default productService;
