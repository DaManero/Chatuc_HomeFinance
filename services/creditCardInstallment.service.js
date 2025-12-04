import api from "./api";

const creditCardInstallmentService = {
  getPendingInstallments: async () => {
    const response = await api.get("/credit-card-installments/pending");
    return response.data.pendingInstallments;
  },

  markAsPaid: async (installmentId) => {
    const response = await api.patch(
      `/credit-card-installments/${installmentId}/mark-paid`
    );
    return response.data;
  },
};

export default creditCardInstallmentService;
