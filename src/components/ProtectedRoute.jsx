import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import axios from 'axios';
import { HOST_API } from '../../env';

const ProtectedRoute = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('token');

			if (!token) {
				setIsAuthenticated(false);
				setLoading(false);
				return;
			}

			try {
				// Configurar token para todas las solicitudes
				axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

				// Verificar si el token es válido (opcional)
				// Puedes comentar esta línea si no tienes un endpoint de verificación
				await axios.get(HOST_API + '/whoAmI');

				setIsAuthenticated(true);
			} catch (error) {
				console.error('Error validando token:', error);
				localStorage.removeItem('token');
				setIsAuthenticated(false);
			} finally {
				setLoading(false);
			}
		};

		checkAuth();
	}, []);

	if (loading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' />;
	}

	return children;
};

export default ProtectedRoute;
