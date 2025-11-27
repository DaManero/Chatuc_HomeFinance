import api from "./api";

const exchangeRateService = {
  getCurrentRate: async () => {
    const response = await api.get("/exchange-rates/current");
    return response.data;
  },

  updateRate: async (rateData = {}) => {
    const response = await api.post("/exchange-rates/update", rateData);
    return response.data;
  },

  getRateHistory: async (limit = 30) => {
    const response = await api.get("/exchange-rates/history", {
      params: { limit },
    });
    return response.data.rates;
  },
};

export default exchangeRateService;
