import api from "./api";

// Servicio de gestión de usuarios
const userService = {
  // Obtener todos los usuarios
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data.users; // El backend devuelve { users: [...] }
  },

  // Crear un nuevo usuario
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Actualizar un usuario
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Eliminar un usuario
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Activar/Desactivar usuario
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  },
};

export default userService;
