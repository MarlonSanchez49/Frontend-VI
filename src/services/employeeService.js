import apiClient from './api';

const employeeService = {
  /**
   * Obtiene la lista de todos los empleados.
   * @returns {Promise<any>}
   */
  getEmployees: () => {
    return apiClient.get('/employees');
  },

  /**
   * Crea un nuevo empleado.
   * @param {object} employeeData - Los datos del empleado a crear.
   * @returns {Promise<any>}
   */
  createEmployee: (employeeData) => {
    console.log('Enviando empleado:', employeeData); // Para depuración
    // Si viene un archivo de foto, construir FormData para multipart
    if (employeeData && (employeeData.photoFile instanceof File || employeeData.photoFile?.name)) {
      const formData = new FormData();
      // Añadir campos scalars
      Object.keys(employeeData).forEach((key) => {
        if (key === 'photoFile') return; // saltar, se añade abajo
        const value = employeeData[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      formData.append('photo', employeeData.photoFile);
      return apiClient.post('/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return apiClient.post('/employees', employeeData);
  },

  /**
   * Actualiza un empleado existente.
   * @param {number} id - El ID del empleado a actualizar.
   * @param {object} employeeData - Los nuevos datos del empleado.
   * @returns {Promise<any>}
   */
  updateEmployee: (id, employeeData) => {
    console.log(`Actualizando empleado ${id}:`, employeeData); // Para depuración
    // Si se envía una nueva foto, usar FormData
    if (employeeData && (employeeData.photoFile instanceof File || employeeData.photoFile?.name)) {
      const formData = new FormData();
      Object.keys(employeeData).forEach((key) => {
        if (key === 'photoFile') return;
        const value = employeeData[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      formData.append('photo', employeeData.photoFile);
      // Para compatibilidad con backends que esperan _method=PUT en multipart
      formData.append('_method', 'PUT');
      return apiClient.post(`/employees/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return apiClient.put(`/employees/${id}`, employeeData);
  },

  /**
   * Elimina un empleado.
   * @param {number} id - El ID del empleado a eliminar.
   * @returns {Promise<any>}
   */
  deleteEmployee: (id) => {
    return apiClient.delete(`/employees/${id}`);
  },
};

export default employeeService;
