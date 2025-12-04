import api from './api';

const paymentMethodService = {
  getPaymentMethods: () => {
    return api.get('/metodos-pago');
  },
};

export default paymentMethodService;