import axios from "axios";

// Configuración base de axios
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
console.log("🔧 API URL configurada:", apiUrl); // Debug temporal

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró o no tiene permisos (401 o 403), limpiar y redirigir al login
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Solo redirigir si no estamos ya en la página de login
      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
