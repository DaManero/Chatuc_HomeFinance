import api from "./api";

const pendingTransactionService = {
  // Obtener transacciones pendientes
  getPendingTransactions: async (status = "pending") => {
    const response = await api.get(`/pending-transactions?status=${status}`);
    return response.data;
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await api.get("/pending-transactions/stats");
    return response.data;
  },

  // Procesar transacción pendiente (convertir a transacción real)
  processPendingTransaction: async (id, data) => {
    const response = await api.post(
      `/pending-transactions/${id}/process`,
      data
    );
    return response.data;
  },

  // Descartar transacción pendiente
  discardPendingTransaction: async (id) => {
    const response = await api.delete(`/pending-transactions/${id}`);
    return response.data;
  },
};

export default pendingTransactionService;
