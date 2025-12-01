import React from 'react';
import styles from './Widget.module.css';

const Widget = ({ title, value, children }) => {
  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{title}</h3>
      <div>
        <p className={styles.value}>{value}</p>
        {children && <div className={styles.childContent}>{children}</div>}
      </div>
    </div>
  );
};

export default Widget;
