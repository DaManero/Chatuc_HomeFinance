import api from "./api";

const creditCardService = {
  getCreditCards: async () => {
    const response = await api.get("/credit-cards");
    return response.data;
  },

  createCreditCard: async (data) => {
    const response = await api.post("/credit-cards", data);
    return response.data;
  },

  updateCreditCard: async (id, data) => {
    const response = await api.put(`/credit-cards/${id}`, data);
    return response.data;
  },

  deleteCreditCard: async (id) => {
    const response = await api.delete(`/credit-cards/${id}`);
    return response.data;
  },

  getCreditCardSummary: async (id) => {
    const response = await api.get(`/credit-card-payments/${id}/summary`);
    return response.data;
  },
};

export default creditCardService;
