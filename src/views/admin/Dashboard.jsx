import React, { useState, useEffect } from 'react';
import reportsService from '../../services/reportsService';
import Widget from '../../components/admin/Widget';
import MovementsChart from '../../components/admin/MovementsChart';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    inventoryValue: null,
    topProducts: [],
    lowStock: [],
    movementsByMonth: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          inventoryValueRes,
          topProductsRes,
          lowStockRes,
          movementsByMonthRes,
        ] = await Promise.all([
          reportsService.getInventoryValue(),
          reportsService.getTopProducts(),
          reportsService.getLowStock(),
          reportsService.getMovementsByMonth(),
        ]);

        setStats({
          inventoryValue: inventoryValueRes.data.total_value,
          topProducts: topProductsRes.data.products,
          lowStock: lowStockRes.data.products,
          movementsByMonth: movementsByMonthRes.data,
        });

      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard. Inténtalo de nuevo más tarde.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className={styles.loading}>Cargando dashboard...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      
      <div className={styles.grid}>
        <Widget 
          title="Valor Total del Inventario"
          value={`$${Number(stats.inventoryValue).toLocaleString('es-MX')}`}
        />
        <Widget title="Producto Más Vendido">
          {stats.topProducts.length > 0 ? (
            <p>{stats.topProducts[0].name} <span>({stats.topProducts[0].total_moved} mov.)</span></p>
          ) : (
            <p>No hay datos</p>
          )}
        </Widget>
        <Widget 
          title="Productos con Bajo Stock"
          value={stats.lowStock.length}
        >
         {stats.lowStock.length > 0 && <p>({stats.lowStock[0].name} con {stats.lowStock[0].stock} u.)</p>}
        </Widget>
        <Widget title="Empleado del Mes">
          <p>🌟 Juan Pérez</p>
        </Widget>
      </div>

      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Movimientos de Inventario (Últimos meses)</h2>
        <div className={styles.chartWrapper}>
          {stats.movementsByMonth ? (
            <MovementsChart chartData={stats.movementsByMonth} />
          ) : (
            <div className={styles.loading}>
              <p>No hay datos disponibles para la gráfica.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
