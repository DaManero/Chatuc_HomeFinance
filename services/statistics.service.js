import api from "./api";

const statisticsService = {
  async getStatistics(months = 12) {
    const response = await api.get(`/statistics?months=${months}`);
    return response.data;
  },
};

export default statisticsService;
