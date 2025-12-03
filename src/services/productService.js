import apiClient from './api';

const productService = {
  /**
   * @returns {Promise<any>} Lista de todos los productos.
   */
  getProducts: () => {
    return apiClient.get('/products');
  },

  /**
   * Obtiene un solo producto por su ID.
   * @param {number} id - El ID del producto.
   * @returns {Promise<any>} El producto.
   */
  getProduct: (id) => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Crea un nuevo producto.
   * @param {object} productData - Los datos del producto a crear.
   * @returns {Promise<any>} El producto creado.
   */
  createProduct: (productData) => {
    console.log('Enviando producto:', productData); // Para depuración
    return apiClient.post('/products', productData);
  },

  /**
   * Actualiza un producto existente.
   * @param {number} id - El ID del producto a actualizar.
   * @param {object} productData - Los nuevos datos del producto.
   * @returns {Promise<any>} El producto actualizado.
   */
  updateProduct: (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },

  /**
   * Elimina un producto.
   * @param {number} id - El ID del producto a eliminar.
   * @returns {Promise<any>}
   */
  deleteProduct: (id) => {
    return apiClient.delete(`/products/${id}`);
  },
};

export default productService;
