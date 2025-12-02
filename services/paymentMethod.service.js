import api from "./api";

const paymentMethodService = {
  // Obtener todos los medios de pago
  getPaymentMethods: async () => {
    const response = await api.get("/payment-methods");
    return response.data;
  },

  // Crear nuevo medio de pago
  createPaymentMethod: async (paymentMethodData) => {
    const response = await api.post("/payment-methods", paymentMethodData);
    return response.data;
  },

  // Actualizar medio de pago
  updatePaymentMethod: async (id, paymentMethodData) => {
    const response = await api.put(`/payment-methods/${id}`, paymentMethodData);
    return response.data;
  },

  // Eliminar medio de pago
  deletePaymentMethod: async (id) => {
    const response = await api.delete(`/payment-methods/${id}`);
    return response.data;
  },
};

export default paymentMethodService;
