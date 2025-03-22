import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Divider,
    Grid,
    Chip,
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    CircularProgress,
    Tooltip,
    Snackbar,
    Alert,
    Link,
} from "@mui/material";
import {
    Person as PersonIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    Router as RouterIcon,
    MonetizationOn as MoneyIcon,
    Assignment as DocumentIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Send as SendIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarMonth,
} from "@mui/icons-material";
import axios from "axios";
import Pay from "./Pay";
import { getClient } from "../auxiliar/auxFunctions";

const ClientDetail = ({ client, onNewSearch, setClients, api }) => {
    // Estados para modales
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);
    const [changingStatus, setChangingStatus] = useState(false);
    const [sendingPayment, setSendingPayment] = useState(false);

    // Estados para SnackBars
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const refreshClientData = async () => {
        try {
            const response = await getClient(client.identificacion);

            setClients(response);
        } catch (error) {
            console.error(
                "Error al obtener datos actualizados del cliente:",
                error
            );
            showSnackbar("Error al actualizar los datos del cliente", "error");
        }
    };

    // Función para mostrar Snackbar
    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    // Función para cerrar Snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };

    // Funciones para modales
    const handleOpenPaymentModal = () => setPaymentModalOpen(true);
    const handleClosePaymentModal = () => setPaymentModalOpen(false);

    const handleOpenConfirmSuspend = () => setConfirmSuspendOpen(true);
    const handleCloseConfirmSuspend = () => setConfirmSuspendOpen(false);

    // Cambiar estado del cliente (suspender/activar)
    const handleChangeStatus = async () => {
        setChangingStatus(true);
        try {
            const token = localStorage.getItem("token");

            const newStatus =
                client.estado === "Activo" ? "Suspendido" : "Activo";

            await axios.patch(
                `${api}/clientes/${client.id}`,
                { estado: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            showSnackbar(`Cliente ${newStatus.toLowerCase()} exitosamente`);
            await refreshClientData();
        } catch (error) {
            console.error("Error cambiando el estado del cliente:", error);
            showSnackbar("Error al cambiar el estado del cliente", "error");
        } finally {
            setChangingStatus(false);
            handleCloseConfirmSuspend();
        }
    };

    // Enviar último pago
    const handleSendLastPayment = async () => {
        try {
            setSendingPayment(true);
            const res = await axios.get(`${api}/client/${client.id}/lastPay`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            await axios.get(`${api}/send-pay/${res.data[0].id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            showSnackbar("Comprobante enviado al cliente correctamente");
        } catch (error) {
            console.error("Error enviando el comprobante:", error);
            showSnackbar("Error al enviar el comprobante", "error");
        } finally {
            setSendingPayment(false);
        }
    };

    // Función auxiliar para determinar el color del chip de saldo
    const getSaldoColor = (saldo) => {
        if (saldo >= 0) {
            return "success";
        } else {
            return "error";
        }
    };

    return (
        <>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                            <PersonIcon />
                        </Avatar>
                        <Typography variant="h5" component="div">
                            {client.nombre}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <DocumentIcon
                                    fontSize="small"
                                    sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                <strong>Identificación:</strong>{" "}
                                {client.identificacion}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <CalendarMonth
                                    fontSize="small"
                                    sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                <strong>Fecha Corte:</strong> {client.fechaPago}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <PhoneIcon
                                    fontSize="small"
                                    sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                <strong>Teléfono:</strong> {client.telefonos}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Plan:</strong>{" "}
                                {typeof client.plan === "string"
                                    ? client.plan
                                    : client.suscripciones[0].planes.nombre ||
                                      "No asignado"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <HomeIcon
                                    fontSize="small"
                                    sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                <strong>Dirección:</strong> {client.direccion}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Sector:</strong>{" "}
                                {client.sectores.nombre || "No asignado"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <RouterIcon
                                    fontSize="small"
                                    sx={{ mr: 1, verticalAlign: "middle" }}
                                />
                                <strong>Router:</strong>{" "}
                                {client.routers?.nombre || "No asignado"}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                                <strong>IPV4:</strong>{" "}
                                {(client.ipv4 && (
                                    <Link
                                        href={`http://${client.ipv4}`}
                                        target="_blank"
                                    >
                                        {client.ipv4}
                                    </Link>
                                )) ||
                                    "No asignada"}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Chip
                                icon={<MoneyIcon />}
                                label={`Saldo: ${parseFloat(
                                    client.saldo || 0
                                ).toFixed(2)} USD`}
                                color={getSaldoColor(client.saldo)}
                                variant="outlined"
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Chip
                                label={client.estado}
                                color={
                                    client.estado === "Activo"
                                        ? "success"
                                        : client.estado === "Suspendido"
                                        ? "warning"
                                        : "error"
                                }
                            />
                            <Tooltip
                                title={
                                    client.estado === "Activo"
                                        ? "Suspender cliente"
                                        : "Activar cliente"
                                }
                            >
                                <IconButton
                                    color={
                                        client.estado === "Activo"
                                            ? "warning"
                                            : "success"
                                    }
                                    onClick={handleOpenConfirmSuspend}
                                >
                                    {client.estado === "Activo" ? (
                                        <BlockIcon />
                                    ) : (
                                        <CheckCircleIcon />
                                    )}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            gap: 2,
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AttachMoneyIcon />}
                            onClick={handleOpenPaymentModal}
                        >
                            Registrar Pago
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<SendIcon />}
                            onClick={handleSendLastPayment}
                            disabled={sendingPayment}
                        >
                            Enviar último pago
                        </Button>
                    </Box>
                </CardContent>

                <CardActions>
                    <Button size="small" color="primary" onClick={onNewSearch}>
                        Nueva búsqueda
                    </Button>
                </CardActions>
            </Card>

            {/* Modal de pago */}
            <Pay
                client={client}
                paymentModalOpen={paymentModalOpen}
                handleClosePaymentModal={handleClosePaymentModal}
                showSnackbar={showSnackbar}
                refreshClientData={refreshClientData}
                api={api}
            />

            {/* Diálogo de confirmación para suspender/activar */}
            <Dialog
                open={confirmSuspendOpen}
                onClose={handleCloseConfirmSuspend}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {client.estado === "Activo"
                        ? "¿Suspender cliente?"
                        : "¿Activar cliente?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {client.estado === "Activo"
                            ? "¿Está seguro que desea suspender a este cliente? Esto deshabilitará su acceso al servicio."
                            : "¿Está seguro que desea activar a este cliente? Esto habilitará su acceso al servicio."}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmSuspend} color="primary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleChangeStatus}
                        variant="contained"
                        color={
                            client.estado === "Activo" ? "warning" : "success"
                        }
                        disabled={changingStatus}
                        autoFocus
                    >
                        {changingStatus ? (
                            <CircularProgress size={24} />
                        ) : client.estado === "Activo" ? (
                            "Suspender"
                        ) : (
                            "Activar"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ClientDetail;
