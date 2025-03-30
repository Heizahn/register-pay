import { useState } from 'react';
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
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Collapse,
	CardHeader,
} from '@mui/material';
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
	Receipt as ReceiptIcon,
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon,
	LocalAtm as LocalAtmIcon,
	AccountBalance as AccountBalanceIcon,
	CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Pay from './Pay';
import { getClient } from '../auxiliar/auxFunctions';
import { CLIENTS } from '../config/clients';
import { useClientList } from '../hooks/useClientList';

// Componente de Historial de Pagos
const PaymentHistory = ({ pagos = [] }) => {
	const [open, setOpen] = useState(true);

	// Función para determinar el icono según el tipo de pago
	const getPaymentIcon = (tipoPago) => {
		switch (tipoPago) {
			case 'Efectivo':
				return <LocalAtmIcon fontSize='small' />;
			case 'Transferencia':
				return <AccountBalanceIcon fontSize='small' />;
			case 'Tarjeta':
				return <CreditCardIcon fontSize='small' />;
			default:
				return <AttachMoneyIcon fontSize='small' />;
		}
	};

	// Si no hay pagos, mostramos un mensaje
	if (!pagos || pagos.length === 0) {
		return (
			<Card>
				<CardHeader
					title={
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
							<Typography variant='h6'>Historial de Pagos</Typography>
						</Box>
					}
					action={
						<IconButton
							onClick={() => setOpen(!open)}
							aria-label='mostrar/ocultar'
							size='small'
						>
							{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
						</IconButton>
					}
				/>
				<Collapse in={open}>
					<CardContent>
						<Typography
							variant='body2'
							color='text.secondary'
							align='center'
							sx={{ py: 2 }}
						>
							No hay pagos registrados para este cliente.
						</Typography>
					</CardContent>
				</Collapse>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader
				title={
					<Box sx={{ display: 'flex', alignItems: 'center' }}>
						<ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
						<Typography variant='h6'>Últimos Pagos</Typography>
					</Box>
				}
				action={
					<IconButton
						onClick={() => setOpen(!open)}
						aria-label='mostrar/ocultar'
						size='small'
					>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				}
			/>
			<Collapse in={open}>
				<CardContent>
					<TableContainer component={Paper} variant='outlined'>
						<Table size='small'>
							<TableHead>
								<TableRow sx={{ bgcolor: 'primary.light' }}>
									<TableCell>Fecha</TableCell>
									<TableCell>Tipo</TableCell>
									<TableCell>Referencia</TableCell>
									<TableCell>Motivo</TableCell>
									<TableCell align='right'>Monto (USD)</TableCell>
									<TableCell align='right'>Monto (VES)</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{pagos.map((pago, index) => (
									<TableRow
										key={index}
										sx={{
											'&:last-child td, &:last-child th': { border: 0 },
										}}
									>
										<TableCell component='th' scope='row'>
											{pago.fecha}
										</TableCell>
										<TableCell>
											<Tooltip
												title={pago.tipoPago || 'No especificado'}
											>
												<Chip
													icon={getPaymentIcon(pago.tipoPago)}
													label={pago.tipoPago || 'N/A'}
													size='small'
													variant='outlined'
													color='primary'
												/>
											</Tooltip>
										</TableCell>
										<TableCell>{pago.referencia || 'N/A'}</TableCell>
										<TableCell>{pago.motivo || 'Sin motivo'}</TableCell>
										<TableCell align='right'>
											<Typography
												variant='body2'
												fontWeight='medium'
												color='primary.dark'
											>
												${pago.monto?.toFixed(2) || '0.00'}
											</Typography>
										</TableCell>
										<TableCell align='right'>
											<Typography variant='body2' color='text.secondary'>
												{pago.montoVES?.toFixed(2) || '0.00'} Bs.
											</Typography>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Collapse>
		</Card>
	);
};

const ClientDetail = ({ client, setClients }) => {
	// Estados para modales
	const [paymentModalOpen, setPaymentModalOpen] = useState(false);
	const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);
	const [changingStatus, setChangingStatus] = useState(false);
	const [sendingPayment, setSendingPayment] = useState(false);
	const { clientList } = useClientList();

	// Estados para SnackBars
	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});

	const refreshClientData = async () => {
		try {
			const response = await getClient(client.identificacion, clientList);

			setClients(response);
		} catch (error) {
			console.error('Error al obtener datos actualizados del cliente:', error);
			showSnackbar('Error al actualizar los datos del cliente', 'error');
		}
	};

	// Función para mostrar Snackbar
	const showSnackbar = (message, severity = 'success') => {
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
			const token = localStorage.getItem('token');

			const newStatus = client.estado === 'Activo' ? 'Suspendido' : 'Activo';

			await axios.patch(
				`${CLIENTS[clientList].url}/clientes/${client.id}`,
				{ estado: newStatus },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			showSnackbar(`Cliente ${newStatus.toLowerCase()} exitosamente`);
			await refreshClientData();
		} catch (error) {
			console.error('Error cambiando el estado del cliente:', error);
			showSnackbar('Error al cambiar el estado del cliente', 'error');
		} finally {
			setChangingStatus(false);
			handleCloseConfirmSuspend();
		}
	};

	// Enviar último pago
	const handleSendLastPayment = async () => {
		try {
			setSendingPayment(true);

			const res = await axios.get(
				`${CLIENTS[clientList].url}/client/${client.id}/lastPay`,
			);

			if (res.data.length === 0) {
				showSnackbar('No hay pagos para enviar');
				return;
			}

			await axios.get(`${CLIENTS[clientList].url}/send-pay/${res.data[0].id}`);

			showSnackbar('Comprobante enviado al cliente correctamente');
		} catch (error) {
			console.error('Error enviando el comprobante:', error);
			showSnackbar('Error al enviar el comprobante', 'error');
		} finally {
			setSendingPayment(false);
		}
	};

	// Función auxiliar para determinar el color del chip de saldo
	const getSaldoColor = (saldo) => {
		if (saldo >= 0) {
			return 'success';
		} else {
			return 'error';
		}
	};

	return (
		<>
			<Card sx={{ mb: 4 }}>
				<CardContent>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
						<Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
							<PersonIcon />
						</Avatar>
						<Typography variant='h5' component='div'>
							{client.nombre}
						</Typography>
					</Box>

					<Divider sx={{ mb: 2 }} />

					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<DocumentIcon
									fontSize='small'
									sx={{ mr: 1, verticalAlign: 'middle' }}
								/>
								<strong>Identificación:</strong> {client.identificacion}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<CalendarMonth
									fontSize='small'
									sx={{ mr: 1, verticalAlign: 'middle' }}
								/>
								<strong>Fecha Corte:</strong> {client.fechaCorte}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<PhoneIcon
									fontSize='small'
									sx={{ mr: 1, verticalAlign: 'middle' }}
								/>
								<strong>Teléfono:</strong> {client.telefono || 'No asignado'}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<strong>Plan:</strong> {client.plan || 'No asignado'}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<HomeIcon
									fontSize='small'
									sx={{ mr: 1, verticalAlign: 'middle' }}
								/>
								<strong>Dirección:</strong> {client.direccion}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<strong>Sector:</strong> {client.sector || 'No asignado'}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<RouterIcon
									fontSize='small'
									sx={{ mr: 1, verticalAlign: 'middle' }}
								/>
								<strong>Router:</strong> {client.router || 'No asignado'}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography variant='body2' color='text.secondary'>
								<strong>IPV4:</strong>{' '}
								{(client.ipv4 && (
									<Link href={`http://${client.ipv4}`} target='_blank'>
										{client.ipv4}
									</Link>
								)) ||
									'No asignada'}
							</Typography>
						</Grid>
					</Grid>

					<Box
						sx={{
							mt: 3,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: 1,
						}}
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1,
							}}
						>
							<Chip
								icon={<MoneyIcon />}
								label={`Saldo: ${parseFloat(client.saldo || 0).toFixed(
									2,
								)} USD`}
								color={getSaldoColor(client.saldo)}
								variant='outlined'
							/>
						</Box>

						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 1,
							}}
						>
							<Chip
								label={client.estado}
								color={
									client.estado === 'Activo'
										? 'success'
										: client.estado === 'Suspendido'
										? 'warning'
										: 'error'
								}
							/>
							<Tooltip
								title={
									client.estado === 'Activo'
										? 'Suspender cliente'
										: 'Activar cliente'
								}
							>
								<IconButton
									color={client.estado === 'Activo' ? 'warning' : 'success'}
									onClick={handleOpenConfirmSuspend}
								>
									{client.estado === 'Activo' ? (
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
							display: 'flex',
							gap: 2,
							justifyContent: 'flex-end',
						}}
					>
						<Button
							variant='contained'
							color='primary'
							startIcon={<AttachMoneyIcon />}
							onClick={handleOpenPaymentModal}
						>
							Registrar Pago
						</Button>

						<Button
							variant='outlined'
							color='primary'
							startIcon={<SendIcon />}
							onClick={handleSendLastPayment}
							disabled={sendingPayment}
						>
							{sendingPayment ? (
								<CircularProgress size={24} />
							) : (
								'Enviar último pago'
							)}
						</Button>
					</Box>
				</CardContent>

				{/* Componente de Historial de Pagos */}
				<PaymentHistory pagos={client.ultimosPagos} />
			</Card>

			{/* Modal de pago */}
			<Pay
				client={client}
				paymentModalOpen={paymentModalOpen}
				handleClosePaymentModal={handleClosePaymentModal}
				showSnackbar={showSnackbar}
				refreshClientData={refreshClientData}
			/>

			{/* Diálogo de confirmación para suspender/activar */}
			<Dialog
				open={confirmSuspendOpen}
				onClose={handleCloseConfirmSuspend}
				aria-labelledby='alert-dialog-title'
				aria-describedby='alert-dialog-description'
			>
				<DialogTitle id='alert-dialog-title'>
					{client.estado === 'Activo' ? '¿Suspender cliente?' : '¿Activar cliente?'}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id='alert-dialog-description'>
						{client.estado === 'Activo'
							? '¿Está seguro que desea suspender a este cliente? Esto deshabilitará su acceso al servicio.'
							: '¿Está seguro que desea activar a este cliente? Esto habilitará su acceso al servicio.'}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseConfirmSuspend} color='primary'>
						Cancelar
					</Button>
					<Button
						onClick={handleChangeStatus}
						variant='contained'
						color={client.estado === 'Activo' ? 'warning' : 'success'}
						disabled={changingStatus}
						autoFocus
					>
						{changingStatus ? (
							<CircularProgress size={24} />
						) : client.estado === 'Activo' ? (
							'Suspender'
						) : (
							'Activar'
						)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar para notificaciones */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbar.severity}
					variant='filled'
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
};

export default ClientDetail;
