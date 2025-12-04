// src/services/tableService.js
import apiClient from './api'; // Import the configured axios instance

const tableService = {
  getTables: async () => {
    try {
      const response = await apiClient.get('/mesas'); // GET /api/mesas
      return response.data; // Assuming response.data contains { data: [...] } or just [...]
    } catch (error) {
      console.error("Error fetching tables:", error);
      throw error;
    }
  },

  createTable: async (tableName) => {
    try {
      const response = await apiClient.post('/mesas', { name: tableName, status: 'available' }); // POST /api/mesas
      return response.data; // Assuming response.data contains the new table object
    } catch (error) {
      console.error("Error creating table:", error);
      throw error;
    }
  },

  deleteTable: async (id) => {
    try {
      const response = await apiClient.delete(`/mesas/${id}`); // DELETE /api/mesas/{id}
      return response.data; // Assuming a success message or confirmation
    } catch (error) {
      console.error("Error deleting table:", error);
      throw error;
    }
  }
};

export default tableService;