import axios from 'axios';

// URL do teu servidor Fastify
const api = axios.create({
  baseURL: 'http://localhost:3333' 
});

export const apiService = {
  // Busca o menu real do banco de dados pelo slug (ex: samuel-burger)
  getMenu: async (slug: string) => {
    const response = await api.get(`/menu/${slug}`);
    return response.data; // Retorna Loja + Categorias + Produtos
  },

  // Faz o login usando a rota JWT que criámos no backend
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    return response.data; // Retorna o Token
  }
};