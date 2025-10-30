import axios from 'axios';
import { API_BASE } from './endpoints';

export const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

http.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) (cfg.headers ||= {})['Authorization'] = `Bearer ${t}`;
  return cfg;
});
