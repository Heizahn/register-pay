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
    FormControl,
    Select,
    MenuItem,
    InputLabel,
} from "@mui/material";
import {
    Search as SearchIcon,
    Logout as LogoutIcon,
    Clear as ClearIcon,
    Assignment as DocumentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ClientDetail from "../components/ClientDetail";
import BCVDay from "./BCVDay";
import authService from "../services/AuthService";
import { getClient } from "../auxiliar/auxFunctions";
import { useClientList } from "../hooks/useClientList";

const SearchClient = () => {
    const [identificacion, setIdentificacion] = useState("");
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);
    const { clientList, handleClientChange } = useClientList();

    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!identificacion) {
            setError("Por favor ingrese un nombre, cédula o identificación");
            return;
        }

        setLoading(true);
        setSearching(true);
        setClients([]);
        setError("");

        try {
            const response = await getClient(identificacion, clientList);

            if (response.length === 0) {
                setError("No se encontraron clientes con esa búsqueda");
                return;
            }

            setClients(response);
        } catch (error) {
            console.error("Error al buscar cliente:", error);

            if (error.response?.status === 401) {
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
        setClients([]);
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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >
                        <Typography component="h1" variant="h5" align="center">
                            Búsqueda de cliente
                        </Typography>
                        <FormControl sx={{ minWidth: 160 }} margin="dense">
                            <InputLabel id="client-select">
                                Lista de clientes
                            </InputLabel>
                            <Select
                                labelId="client-select"
                                id="demo-simple-select"
                                value={clientList}
                                label="Lista de clientes"
                                onChange={(e) =>
                                    handleClientChange(e.target.value)
                                }
                            >
                                <MenuItem value="ABDO77">ABDO77</MenuItem>
                                <MenuItem value="Gianni">Gianni</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Box
                        component="form"
                        onSubmit={handleSearch}
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            fullWidth
                            id="identificacion"
                            label="Nombre, Cédula o Télefono"
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
                        />
                    ))}
            </Container>
        </Box>
    );
};

export default SearchClient;
