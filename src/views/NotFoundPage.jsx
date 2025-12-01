import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-4">Página No Encontrada</h2>
      <p className="text-gray-500 mb-8">La página que buscas no existe o ha sido movida.</p>
      <Link to="/" className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
