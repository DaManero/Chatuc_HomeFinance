import api from "./api";

// Servicio de autenticación
const authService = {
  // Login de usuario
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    // Guardar tokens en localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data;
  },

  // Registro de usuario
  register: async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    // Guardar tokens en localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data;
  },

  // Obtener datos del usuario actual
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data.user; // El backend devuelve { user: {...} }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // Verificar si hay token
  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },
};

export default authService;
