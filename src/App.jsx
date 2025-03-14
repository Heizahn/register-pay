import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading para mejorar el rendimiento
const Login = lazy(() => import('./components/Login'));
const SearchClient = lazy(() => import('./components/SearchClient'));

// Tema personalizable de Material UI
const theme = createTheme({
	palette: {
		primary: {
			main: '#1976d2',
		},
		secondary: {
			main: '#dc004e',
		},
	},
	typography: {
		fontFamily: ['Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(','),
	},
});

// Componente de carga para lazy loading
const LoadingFallback = () => (
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

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<Suspense fallback={<LoadingFallback />}>
					<Routes>
						<Route path='/login' element={<Login />} />
						<Route
							path='/search'
							element={
								<ProtectedRoute>
									<SearchClient />
								</ProtectedRoute>
							}
						/>
						<Route path='/' element={<Navigate to='/login' />} />
						<Route path='*' element={<Navigate to='/login' />} />
					</Routes>
				</Suspense>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
