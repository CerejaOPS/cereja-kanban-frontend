import axios from 'axios';
import { useAuthStore } from '../lib/store';

export const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Inject actor context into mutation requests so backend can trigger Discord webhooks
  if (
    user &&
    config.data &&
    typeof config.data === 'object' &&
    ['post', 'patch', 'put', 'delete'].includes(config.method || '')
  ) {
    config.data.actor_name = user.name || user.username;
    config.data.actor_discord_id = user.id;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
