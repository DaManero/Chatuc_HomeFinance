import api from "./api";

const statisticsService = {
  // Obtener estadísticas generales
  getStatistics: async (period = 12) => {
    const response = await api.get(`/statistics?period=${period}`);
    return response.data;
  },

  // Obtener resumen de gastos por categoría
  getExpensesByCategory: async (period = 12) => {
    const response = await api.get(
      `/statistics/expenses-by-category?period=${period}`,
    );
    return response.data;
  },

  // Obtener resumen de ingresos
  getIncome: async (period = 12) => {
    const response = await api.get(`/statistics/income?period=${period}`);
    return response.data;
  },

  // Obtener tendencias mensuales
  getMonthlyTrends: async (period = 12) => {
    const response = await api.get(
      `/statistics/monthly-trends?period=${period}`,
    );
    return response.data;
  },

  // Obtener comparativa presupuesto vs gasto
  getBudgetComparison: async () => {
    const response = await api.get("/statistics/budget-comparison");
    return response.data;
  },

  // Obtener resumen anual
  getAnnualSummary: async (year) => {
    const response = await api.get(`/statistics/annual-summary?year=${year}`);
    return response.data;
  },
};

export default statisticsService;
