import api from "./api";

const recurringExpensesService = {
  getProjection: async () => {
    const response = await api.get("/recurring-expenses/projection");
    return response.data;
  },

  getHistory: async (months = 6) => {
    const response = await api.get("/recurring-expenses/history", {
      params: { months },
    });
    return response.data;
  },
};

export default recurringExpensesService;
