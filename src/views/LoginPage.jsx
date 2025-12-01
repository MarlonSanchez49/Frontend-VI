import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // ---- INICIO: Lógica para login de prueba ----
    // NOTA: La imagen tiene credenciales diferentes (johnd/m38mF$ y mor_2314/03fK$)
    // Las dejaremos para que se visualice la sección, pero no las conectaremos al login de prueba
    if (email === 'admin@test.com' && password === 'password') {
      auth.offlineLogin();
      navigate('/admin/dashboard', { replace: true });
      setIsLoading(false);
      return; 
    }
    // ---- FIN: Lógica para login de prueba ----

    // Lógica original para llamar a la API
    try {
      const user = await auth.login({ email, password });
      
      // Se verifica el nombre del rol dentro del objeto 'role'
      if (user?.role?.name.toLowerCase() === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/pos', { replace: true });
      }

    } catch (err) {
      setError('Las credenciales son incorrectas. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.fullScreenContainer}>
      {/* Columna de Contenido (Izquierda) */}
      <div className={styles.contentColumn}>
        <h1 className={styles.mainTitle}>Vertex Inventory</h1>
        <p className={styles.subtitle}>
          Si estás buscando la manera de automatizar la gestión de tu negocio, ¡has llegado al lugar indicado! Con VertexInventory...
        </p>
        {/* Aquí irían los elementos esféricos con CSS de fondo, o imágenes si fueran más complejos */}
      </div>

      {/* Columna de Login (Derecha) */}
      <div className={styles.formColumn}>
        <h3 className={styles.logoTitle}>Iniciar sesión</h3>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <input
              type="text" // Cambiado a 'text' para el nombre de usuario de la imagen
              id="email"
              placeholder="Usuario o Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              autoComplete="username"
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              id="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              autoComplete="current-password"
            />
          </div>

          <div className={styles.forgotPassword}>
            ¿Has olvidado tu contraseña?
          </div>

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.loginButton} // Renombrado a loginButton
            >
              {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;