import { useState } from 'react';
import {
	Typography,
	Box,
	Card,
	CardHeader,
	CardContent,
	IconButton,
	Collapse,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	Tooltip,
	Divider,
} from '@mui/material';
import {
	Receipt as ReceiptIcon,
	KeyboardArrowDown as KeyboardArrowDownIcon,
	KeyboardArrowUp as KeyboardArrowUpIcon,
	AttachMoney as AttachMoneyIcon,
	LocalAtm as LocalAtmIcon,
	AccountBalance as AccountBalanceIcon,
	CreditCard as CreditCardIcon,
} from '@mui/icons-material';

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

// Componente principal para mostrar el historial de pagos
const PaymentHistory = ({ pagos = [] }) => {
	const [open, setOpen] = useState(true);

	// Si no hay pagos, mostramos un mensaje
	if (!pagos || pagos.length === 0) {
		return (
			<Card sx={{ mt: 3, mb: 3 }}>
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
		<Card sx={{ mt: 3, mb: 3 }}>
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

export default PaymentHistory;
