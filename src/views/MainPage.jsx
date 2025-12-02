import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MainPage.module.css';

const MainPage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    // La función para navegar al login está correcta.
    navigate('/login');
  };

  return (
    <div className={styles.fullScreenContainer}>
      
      {/* 1. Logo y Título Superior */}
      <header className={styles.header}>
        {/* Usamos un div para simular el ícono 'V' del logo */}
        <div className={styles.logoIcon}>V</div> 
        <span className={styles.logoText}>VERTEXINVENTORY</span>
      </header>

      {/* 2. Columna de Contenido Central */}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <h1 className={styles.mainTitle}>Gestor de<br />Inventario</h1>
          
          {/* El botón de la captura dice "ADMINISTRAR" */}
          <button 
            onClick={handleLoginRedirect} 
            className={styles.adminButton}
          >
            ADMINISTRAR
          </button>
        </div>
      </div>

      {/* NOTA: El fondo de esferas y formas se maneja completamente en el CSS. */}

    </div>
  );
};

export default MainPage;
