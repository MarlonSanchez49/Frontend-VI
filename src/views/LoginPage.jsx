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

    try {
      const user = await auth.login({ email, password });

      if (user?.role_id === 1) { // 1 = Admin
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
      </div>

      {/* Columna de Login (Derecha) */}
      <div className={styles.formColumn}>
        <h3 className={styles.logoTitle}>Iniciar sesión</h3>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <input
              type="text"
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

          {error && <p className={styles.error}>{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.loginButton}
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