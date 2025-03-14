import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import authService from "./services/AuthService.js";

// Configurar interceptores de axios para el manejo de tokens
authService.setupAxiosInterceptors();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
