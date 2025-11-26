import api from "./api";

const transactionService = {
  // Obtener todas las transacciones
  getTransactions: async () => {
    const response = await api.get("/transactions");
    return response.data.transactions;
  },

  // Crear nueva transacción
  createTransaction: async (transactionData) => {
    const response = await api.post("/transactions", transactionData);
    return response.data;
  },

  // Actualizar transacción
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Eliminar transacción
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export default transactionService;
