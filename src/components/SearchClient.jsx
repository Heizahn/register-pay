import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
	Search as SearchIcon,
	Logout as LogoutIcon,
	Clear as ClearIcon,
	Assignment as DocumentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ClientDetail from '../components/ClientDetail';
import authService from '../services/AuthService';
import { getClient } from '../auxiliar/auxFunctions';
import { useClientList } from '../hooks/useClientList';
import { getBCV } from '../services/BCVService';
import PricePanel from './PricePanel';

const SearchClient = () => {
	const [identificacion, setIdentificacion] = useState('');
	const [loading, setLoading] = useState(false);
	const [clients, setClients] = useState([]);
	const [error, setError] = useState('');
	const [searching, setSearching] = useState(false);
	const [bcvData, setBcvData] = useState(null);
	const { clientList, handleClientChange } = useClientList();

	const navigate = useNavigate();

	// Obtener información del BCV (reemplaza por tu función actual)
	useEffect(() => {
		const fetchBcvData = async () => {
			try {
				// Aquí obtendríamos los datos reales del BCV
				// Por ahora, usamos datos de ejemplo
				setBcvData({
					precio: await getBCV(),
					fecha: new Date().toLocaleDateString(),
				});
			} catch (error) {
				console.error('Error obteniendo datos del BCV:', error);
			}
		};

		fetchBcvData();
	}, []);

	const handleSearch = async (e) => {
		e?.preventDefault();

		if (!identificacion) {
			setError('Por favor ingrese un nombre, cédula o identificación');
			return;
		}

		setLoading(true);
		setSearching(true);
		setClients([]);
		setError('');

		try {
			const response = await getClient(identificacion, clientList);

			if (response.length === 0) {
				setError('No se encontraron clientes con esa búsqueda');
				return;
			}
			setClients(response);
		} catch (error) {
			console.error('Error al buscar cliente:', error);

			if (error.response?.status === 401) {
				localStorage.removeItem('token');
				navigate('/login');
			} else {
				setError(
					error.response?.data?.error?.message ||
						'Error al buscar cliente. Intente nuevamente.',
				);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleClear = () => {
		setIdentificacion('');
		setClients([]);
		setError('');
		setSearching(false);
	};

	const handleLogout = () => {
		authService.logout();
		navigate('/login');
	};

	return (
		<Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
			<AppBar position='static' color='primary'>
				<Toolbar>
					<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
						Sistema de Búsqueda de Clientes
					</Typography>
					<Tooltip title='Cerrar sesión'>
						<IconButton color='inherit' onClick={handleLogout} edge='end'>
							<LogoutIcon />
						</IconButton>
					</Tooltip>
				</Toolbar>
			</AppBar>

			<Container maxWidth='md' sx={{ py: 4 }}>
				{/* Panel de información de precios */}
				<PricePanel bcvData={bcvData} />

				{/* Panel de búsqueda */}
				<Paper
					elevation={2}
					sx={{
						p: 3,
						borderRadius: 2,
						mb: 4,
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							mb: 2,
						}}
					>
						<Typography component='h1' variant='h5'>
							Búsqueda de cliente
						</Typography>
						<FormControl sx={{ minWidth: 160, mr: 2 }} size='small'>
							<Select
								value={clientList}
								onChange={(e) => handleClientChange(e.target.value)}
								sx={{
									borderRadius: 1,
									'& .MuiSelect-icon': { color: 'white' },
								}}
								displayEmpty
							>
								<MenuItem value='ABDO77'>ABDO77</MenuItem>
								<MenuItem value='Gianni'>Gianni</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Box component='form' onSubmit={handleSearch}>
						<TextField
							fullWidth
							id='identificacion'
							label='Nombre, Cédula o Teléfono'
							variant='outlined'
							value={identificacion}
							onChange={(e) => setIdentificacion(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position='start'>
										<DocumentIcon />
									</InputAdornment>
								),
								endAdornment: (
									<InputAdornment position='end'>
										{identificacion && (
											<IconButton
												aria-label='clear search'
												onClick={handleClear}
												edge='end'
											>
												<ClearIcon />
											</IconButton>
										)}
									</InputAdornment>
								),
							}}
							placeholder='Ej: 12345678'
							autoFocus
						/>

						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								mt: 2,
							}}
						>
							<Button
								variant='contained'
								color='primary'
								startIcon={loading ? null : <SearchIcon />}
								onClick={handleSearch}
								disabled={loading || !identificacion}
								sx={{ px: 4, py: 1 }}
							>
								{loading ? (
									<CircularProgress size={24} color='inherit' />
								) : (
									'Buscar Cliente'
								)}
							</Button>
						</Box>

						{error && (
							<Typography color='error' sx={{ mt: 2, textAlign: 'center' }}>
								{error}
							</Typography>
						)}
					</Box>
				</Paper>

				{searching && !loading && !error && !clients && (
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							mt: 4,
						}}
					>
						<Typography variant='h6' color='text.secondary'>
							No se encontraron resultados para "{identificacion}"
						</Typography>
					</Box>
				)}

				{/* Resultados de la búsqueda */}
				{clients &&
					clients.length > 0 &&
					clients.map((client) => (
						<ClientDetail
							key={client.id}
							client={client}
							setClients={setClients}
							onNewSearch={handleClear}
						/>
					))}
			</Container>
		</Box>
	);
};

export default SearchClient;
