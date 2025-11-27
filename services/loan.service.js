import api from "./api";

const loanService = {
  getLoans: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get("/loans", { params });
    return response.data.loans;
  },

  getLoanById: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data.loan;
  },

  createLoan: async (loanData) => {
    const response = await api.post("/loans", loanData);
    return response.data;
  },

  updateLoan: async (id, loanData) => {
    const response = await api.put(`/loans/${id}`, loanData);
    return response.data;
  },

  deleteLoan: async (id) => {
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },

  registerPayment: async (loanId, paymentData) => {
    const response = await api.post(`/loans/${loanId}/payments`, paymentData);
    return response.data;
  },
};

export default loanService;
