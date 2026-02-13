import api from "./api";

const mortgageService = {
  getMortgage: async () => {
    const response = await api.get("/mortgage");
    return response.data;
  },

  getInstallments: async () => {
    const response = await api.get("/mortgage/installments");
    return response.data.installments;
  },

  payInstallment: async (data) => {
    const response = await api.post("/mortgage/pay", data);
    return response.data;
  },

  setupMortgage: async (data) => {
    const response = await api.post("/mortgage/setup", data);
    return response.data;
  },
};

export default mortgageService;
