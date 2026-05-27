import api from '../api/axios';

export const login = (credentials) => api.post('/auth/login', credentials).then((response) => response.data);

export const register = (details) => api.post('/auth/register', details).then((response) => response.data);

export const me = () => api.get('/auth/me').then((response) => response.data);

const authApi = { login, register, me };

export default authApi;
