import api from "./api";

const creditCardRecurringChargeService = {
  getRecurringCharges: async (params = {}) => {
    const response = await api.get("/credit-card-recurring-charges", {
      params,
    });
    return response.data.recurringCharges;
  },

  createRecurringCharge: async (data) => {
    const response = await api.post("/credit-card-recurring-charges", data);
    return response.data.recurringCharge;
  },

  updateRecurringCharge: async (id, data) => {
    const response = await api.put(
      `/credit-card-recurring-charges/${id}`,
      data
    );
    return response.data.recurringCharge;
  },

  deleteRecurringCharge: async (id) => {
    const response = await api.delete(`/credit-card-recurring-charges/${id}`);
    return response.data;
  },
};

export default creditCardRecurringChargeService;
