import api from "./api";

const creditCardPaymentService = {
  getProjections: async (params = {}) => {
    const response = await api.get("/credit-card-payments/projections", {
      params,
    });
    return response.data.projections;
  },

  getPayments: async (params = {}) => {
    const response = await api.get("/credit-card-payments/payments", {
      params,
    });
    return response.data; // Retornar response.data directamente
  },

  createPayment: async (data) => {
    const response = await api.post("/credit-card-payments/payments", data);
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await api.delete(`/credit-card-payments/payments/${id}`);
    return response.data;
  },
};

export default creditCardPaymentService;
