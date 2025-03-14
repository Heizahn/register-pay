import axios from "axios";
import { HOST_API } from "../env";

const authService = {
    login: async (username, password) => {
        try {
            const response = await axios.post(`${HOST_API}/users/login`, {
                username,
                password,
            });

            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);

                authService.setupAxiosInterceptors();

                return response.data;
            }

            return null;
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },

    profile: async () => {
        try {
            const response = await axios.get(`${HOST_API}/whoAmI`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener el perfil:", error);
            throw error;
        }
    },

    profiles: async () => {
        try {
            const response = await axios.get(`${HOST_API}/users`);
            return response.data;
        } catch (error) {
            console.error("Error al obtener los perfiles:", error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
    },

    isAuthenticated: () => {
        return !!localStorage.getItem("token");
    },

    getToken: () => {
        return localStorage.getItem("token");
    },

    setupAxiosInterceptors: () => {
        // Interceptor para manejar errores de autenticación
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Si recibimos un 401, limpiamos el localStorage y redirigimos al login
                    authService.logout();
                    window.location = "/login";
                }
                return Promise.reject(error);
            }
        );

        // Configurar token en el encabezado para todas las solicitudes
        const token = authService.getToken();
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
    },
};

export default authService;
