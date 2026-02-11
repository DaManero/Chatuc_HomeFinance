import axios from "axios";

// Detectar automáticamente el ambiente
const getApiUrl = () => {
  // La variable de entorno tiene prioridad (funciona para cualquier hosting)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallbacks por hostname (browser)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Producción en Render
    if (hostname.includes("onrender.com")) {
      return "https://home-finance-backend.onrender.com";
    }

    // Producción en Railway
    if (hostname.includes("railway.app")) {
      return "https://home-finance-backend.up.railway.app";
    }
  }

  // Desarrollo local
  return "http://localhost:3000";
};

const apiUrl = getApiUrl();
console.log("🔧 API URL configurada:", apiUrl);
console.log(
  "🌐 Hostname:",
  typeof window !== "undefined" ? window.location.hostname : "server",
);

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
