import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // ✅ IMPORTANTE: Envia cookies de sessão
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
