import apiClient from './api'; // Asegúrate que la ruta a tu cliente API sea correcta

const supplierService = {
  getSuppliers: () => {
    return apiClient.get('/suppliers');
  },
  getSupplier: (id) => {
    return apiClient.get(`/suppliers/${id}`);
  },
  createSupplier: (supplierData) => {
    return apiClient.post('/suppliers', supplierData);
  },
  updateSupplier: (id, supplierData) => {
    return apiClient.put(`/suppliers/${id}`, supplierData);
  },
  deleteSupplier: (id) => {
    return apiClient.delete(`/suppliers/${id}`);
  },
};

export default supplierService;