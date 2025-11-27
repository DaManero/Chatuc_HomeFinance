import api from "./api";

const investmentService = {
  getInvestments: async (status = null, type = null) => {
    const params = {};
    if (status) params.status = status;
    if (type) params.type = type;
    const response = await api.get("/investments", { params });
    return response.data;
  },

  getInvestmentById: async (id) => {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  createInvestment: async (investmentData) => {
    const response = await api.post("/investments", investmentData);
    return response.data;
  },

  updateInvestment: async (id, investmentData) => {
    const response = await api.put(`/investments/${id}`, investmentData);
    return response.data;
  },

  deleteInvestment: async (id) => {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  },

  registerEarning: async (investmentId, earningData) => {
    const response = await api.post(
      `/investments/${investmentId}/earnings`,
      earningData
    );
    return response.data;
  },

  getEarnings: async (investmentId) => {
    const response = await api.get(`/investments/${investmentId}/earnings`);
    return response.data;
  },
};

export default investmentService;
