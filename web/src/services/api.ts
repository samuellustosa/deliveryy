import axios from 'axios';

// Busca a URL do .env ou usa localhost como padrão
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

// Adiciona o token em todas as chamadas automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('delivery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };