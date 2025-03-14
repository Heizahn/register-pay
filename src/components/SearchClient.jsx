import { useState } from "react";
import {
    Box,
    Container,
    TextField,
    Button,
    Paper,
    Typography,
    IconButton,
    InputAdornment,
    CircularProgress,
    AppBar,
    Toolbar,
    Tooltip,
} from "@mui/material";
import {
    Search as SearchIcon,
    Logout as LogoutIcon,
    Clear as ClearIcon,
    Assignment as DocumentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { HOST_API } from "../env";
import ClientDetail from "../components/ClientDetail";
import BCVDay from "./BCVDay";
import authService from "../services/AuthService";
import { getClient } from "../auxiliar/auxFunctions";

const SearchClient = () => {
    const [identificacion, setIdentificacion] = useState("");
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState(null);
    const [api, setApi] = useState("");
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);
    const apis = [HOST_API, "http://localhost:3000"];

    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!identificacion) {
            setError("Por favor ingrese una cédula o identificación");
            return;
        }

        setLoading(true);
        setSearching(true);
        setClients(null);
        setError("");

        try {
            for (const host of apis) {
                const response = await getClient(identificacion, host);

                if (!response.url) {
                    continue;
                }

                if (response.data && response.data.length > 0) {
                    setClients(response.data);
                    setApi(response.url);
                    return;
                }
            }

            setError("No se encontraron clientes con esa identificación");
        } catch (error) {
            console.error("Error al buscar cliente:", error);

            if (error.response?.status === 401) {
                // Si hay error de autenticación, redirigir al login
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                setError(
                    error.response?.data?.error?.message ||
                        "Error al buscar cliente. Intente nuevamente."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setIdentificacion("");
        setClients(null);
        setError("");
        setSearching(false);
    };

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        Sistema de Búsqueda de Clientes
                    </Typography>
                    <Tooltip title="Cerrar sesión">
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        pt: 2,
                        borderRadius: 2,
                        mb: 4,
                        mt: 4,
                    }}
                >
                    <BCVDay />
                    <Typography
                        component="h1"
                        variant="h5"
                        align="center"
                        sx={{ mb: 3 }}
                    >
                        Búsqueda de Cliente por Cédula
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            fullWidth
                            id="identificacion"
                            label="Cédula o Télefono"
                            variant="outlined"
                            value={identificacion}
                            onChange={(e) => setIdentificacion(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DocumentIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {identificacion && (
                                            <IconButton
                                                aria-label="clear search"
                                                onClick={handleClear}
                                                edge="end"
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Ej: 12345678"
                            autoFocus
                        />

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                onClick={handleSearch}
                                disabled={loading || !identificacion}
                                sx={{ px: 4, py: 1 }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    "Buscar Cliente"
                                )}
                            </Button>
                        </Box>

                        {error && (
                            <Typography
                                color="error"
                                sx={{ mt: 2, textAlign: "center" }}
                            >
                                {error}
                            </Typography>
                        )}
                    </Box>
                </Paper>

                {searching && !loading && !error && !clients && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                        }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            No se encontraron resultados para "{identificacion}"
                        </Typography>
                    </Box>
                )}

                {clients &&
                    clients.length > 0 &&
                    clients.map((client) => (
                        <ClientDetail
                            key={client.id}
                            client={client}
                            onNewSearch={handleClear}
                            setClients={setClients}
                            api={api}
                        />
                    ))}
            </Container>
        </Box>
    );
};

export default SearchClient;
