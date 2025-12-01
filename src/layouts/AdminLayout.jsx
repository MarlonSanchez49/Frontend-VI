import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet /> {/* Aquí se renderizarán las vistas anidadas */}
      </main>
    </div>
  );
};

export default AdminLayout;
