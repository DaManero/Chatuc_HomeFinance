import api from "./api";

const creditCardExpenseService = {
  getExpenses: async (params = {}) => {
    const response = await api.get("/credit-card-expenses", { params });
    return response.data.expenses;
  },

  createExpense: async (data) => {
    const response = await api.post("/credit-card-expenses", data);
    return response.data.expense;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/credit-card-expenses/${id}`, data);
    return response.data.expense;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/credit-card-expenses/${id}`);
    return response.data;
  },

  markInstallmentAsPaid: async (installmentId, paidDate) => {
    const response = await api.patch(
      `/credit-card-expenses/installments/${installmentId}/pay`,
      { paidDate }
    );
    return response.data.installment;
  },
};

export default creditCardExpenseService;
