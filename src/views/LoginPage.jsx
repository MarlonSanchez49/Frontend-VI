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
    if (email === 'admin@test.com' && password === 'password') {
      auth.offlineLogin();
      navigate('/admin/dashboard', { replace: true });
      setIsLoading(false); // Detener el indicador de carga
      return; // Detener la ejecución para no llamar a la API
    }
    // ---- FIN: Lógica para login de prueba ----

    // Lógica original para llamar a la API
    try {
      const user = await auth.login({ email, password });
      
      // La API devuelve el rol como una propiedad simple: user.role === 'admin'
      if (user?.role === 'admin') {
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
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h2 className={styles.title}>Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              autoComplete="current-password"
            />
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
              className={styles.button}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
