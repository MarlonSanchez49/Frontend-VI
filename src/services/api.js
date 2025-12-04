import axios from 'axios';

// Asume que la API de Laravel está corriendo en 127.0.0.1:8000
const API_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para incluir el token en todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Enviando petición con la siguiente configuración:', config); // DEBUG
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
