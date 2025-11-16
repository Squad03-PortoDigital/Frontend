import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gabrielfiel.com.br/',
  withCredentials: true,
});

// ✅ INTERCEPTOR: Adiciona Authorization header automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth');
  
  if (token) {
    config.headers.Authorization = `Basic ${token}`;
  }
  
  return config;
});

// ✅ Funções da API de usuário
export const usuarioApi = {
  // Buscar usuário autenticado
  getMe: async () => {
    const response = await api.get('/usuarios/me');
    return response.data;
  },

  // Atualizar meu perfil
  updateMyProfile: async (data: any) => {
    const response = await api.put('/usuarios/me', data);
    return response.data;
  },
};

export default api;
