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
    return apiClient.put(`/employees/${id}`, employeeData);
  },
};

export default employeeService;
