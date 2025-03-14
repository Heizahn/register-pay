import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    DialogActions,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { getBsToUsd, getUsdToBs } from "../auxiliar/auxFunctions";
import authService from "../services/AuthService";
import axios from "axios";

export default function Pay({
    client,
    paymentModalOpen,
    handleClosePaymentModal,
    showSnackbar,
    refreshClientData,
    api,
}) {
    const [sendingPayment, setSendingPayment] = useState(false);
    const [loadingBsToUsd, setLoadingBsToUsd] = useState(false);
    const [loadingUsdToBs, setLoadingUsdToBs] = useState(false);
    const [profiles, setProfiles] = useState([]);

    // Estado para formulario de pago
    const [paymentData, setPaymentData] = useState({
        monto: "",
        tipoPago: "Efectivo",
        referencia: "",
        comentario: "",
        montoRef: "",
        montoBs: "",
        reciboPor: "",
    });

    const handleCancel = () => {
        handleClosePaymentModal();
        setPaymentData({
            tipoPago: "Efectivo",
            referencia: "",
            comentario: "",
            montoRef: "",
            montoBs: "",
            reciboPor: "",
        });
    };

    const handleGetBsToUsd = async () => {
        try {
            setLoadingBsToUsd(true);
            const { montoBs } = paymentData;
            const montoUsd = await getBsToUsd(montoBs);
            setPaymentData({
                ...paymentData,
                montoRef: montoUsd,
            });
        } catch (error) {
            console.error("Error al convertir Bs a USD:", error);
            showSnackbar("Error al convertir Bs a USD", "error");
        } finally {
            setLoadingBsToUsd(false);
        }
    };

    const handleGetUsdToBs = async () => {
        try {
            setLoadingUsdToBs(true);
            const { montoRef } = paymentData;
            const montoBs = await getUsdToBs(montoRef);
            setPaymentData({
                ...paymentData,
                montoBs: montoBs,
            });
        } catch (error) {
            console.error("Error al convertir USD a Bs:", error);
            showSnackbar("Error al convertir USD a Bs", "error");
        } finally {
            setLoadingUsdToBs(false);
        }
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setSendingPayment(true);

        try {
            // Esta es una simulación, implementa el endpoint real
            const Payment = {
                monto: Number(paymentData.montoRef),
                fecha: new Date(),
                creadoPor: (await authService.profile()).id,
                estado: "Activo",
                recibidoPor: paymentData.reciboPor,
                tasa: Number(paymentData.montoBs),
                tipoPago: paymentData.tipoPago,
                clientesId: client.id,
                referencia: paymentData.referencia,
            };

            if (paymentData.comentario) {
                Payment.comentario = paymentData.comentario;
            }

            // Aquí iría la llamada a la API para guardar el pago
            await axios.post(`${api}/paysClient0`, Payment);

            showSnackbar("Pago registrado correctamente");
            handleCancel();

            // Actualizar datos del cliente
            await refreshClientData();
        } catch (error) {
            console.error("Error registrando el pago:", error);
            showSnackbar("Error al registrar el pago", error.message);
        } finally {
            setSendingPayment(false);
        }
    };

    useEffect(() => {
        authService.profiles().then((profiles) => setProfiles(profiles));
    }, []);
    return (
        <Dialog
            open={paymentModalOpen}
            onClose={handleClosePaymentModal}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Registrar pago para {client.nombre}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Ingrese los detalles del pago a registrar.
                </DialogContentText>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={
                                sendingPayment ||
                                !paymentData.montoBs ||
                                paymentData.montoRef ||
                                loadingBsToUsd
                            }
                            onClick={handleGetBsToUsd}
                        >
                            Obtener monto en USD
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={
                                sendingPayment ||
                                !paymentData.montoRef ||
                                paymentData.montoBs ||
                                loadingUsdToBs
                            }
                            onClick={handleGetUsdToBs}
                        >
                            Obtener monto en Bs
                        </Button>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="montoRef"
                            label="Monto (USD)"
                            type="number"
                            fullWidth
                            value={paymentData.montoRef}
                            onChange={(e) =>
                                setPaymentData({
                                    ...paymentData,
                                    montoRef: e.target.value,
                                })
                            }
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="montoBs"
                            label="Monto (Bs)"
                            type="number"
                            fullWidth
                            value={paymentData.montoBs}
                            onChange={(e) =>
                                setPaymentData({
                                    ...paymentData,
                                    montoBs: e.target.value,
                                })
                            }
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="tipo-pago-label">
                                Tipo de pago
                            </InputLabel>
                            <Select
                                labelId="tipo-pago-label"
                                id="tipoPago"
                                value={paymentData.tipoPago}
                                label="Tipo de pago"
                                onChange={(e) =>
                                    setPaymentData({
                                        ...paymentData,
                                        tipoPago: e.target.value,
                                    })
                                }
                            >
                                <MenuItem value="Efectivo">Efectivo</MenuItem>
                                <MenuItem value="Digital">Digital</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="recibo-por-label">
                                Recibo por
                            </InputLabel>
                            <Select
                                labelId="recibo-por-label"
                                id="reciboPor"
                                value={paymentData.reciboPor}
                                label="Recibo por"
                                onChange={(e) =>
                                    setPaymentData({
                                        ...paymentData,
                                        reciboPor: e.target.value,
                                    })
                                }
                            >
                                {profiles.map((profile) => (
                                    <MenuItem
                                        key={profile.id}
                                        value={profile.id}
                                    >
                                        {profile.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="referencia"
                            label="Referencia"
                            type="text"
                            fullWidth
                            value={paymentData.referencia}
                            onChange={(e) =>
                                setPaymentData({
                                    ...paymentData,
                                    referencia: e.target.value,
                                })
                            }
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            id="comentario"
                            label="Comentario"
                            type="text"
                            fullWidth
                            multiline
                            rows={3}
                            value={paymentData.comentario}
                            onChange={(e) =>
                                setPaymentData({
                                    ...paymentData,
                                    comentario: e.target.value,
                                })
                            }
                            variant="outlined"
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleCancel} color="primary">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmitPayment}
                    variant="contained"
                    color="primary"
                    disabled={
                        sendingPayment ||
                        !paymentData.montoRef ||
                        !paymentData.montoBs ||
                        !paymentData.reciboPor ||
                        !paymentData.tipoPago ||
                        !paymentData.referencia
                    }
                    startIcon={
                        sendingPayment ? (
                            <CircularProgress size={20} />
                        ) : (
                            <AttachMoneyIcon />
                        )
                    }
                >
                    {sendingPayment ? "Procesando..." : "Registrar Pago"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
