import api from "./api";

const recurringExpensesService = {
  getProjection: async () => {
    const response = await api.get("/recurring-expenses/projection");
    return response.data;
  },
};

export default recurringExpensesService;
