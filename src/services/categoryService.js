import apiClient from './api';

const categoryService = {
  /**
   * @returns {Promise<any>} Lista de todas las categorías.
   */
  getCategories: () => {
    return apiClient.get('/categories');
  },
};

export default categoryService;
