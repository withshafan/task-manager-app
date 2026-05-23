import axios from 'axios';

// Use VITE_API_BASE if set (e.g., for production backend on another domain)
// Otherwise use empty string → relative URLs (works with Vercel rewrite)
const baseURL = import.meta.env.VITE_API_BASE || '';
const API_URL = `${baseURL}/api/tasks`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTasks = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getTask = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createTask = (task) => axios.post(API_URL, task, { headers: getAuthHeader() });
export const updateTask = (id, task) => axios.put(`${API_URL}/${id}`, task, { headers: getAuthHeader() });
export const deleteTask = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const shareTask = (taskId, username) => 
  axios.put(`${API_URL}/${taskId}/share`, { username }, { headers: getAuthHeader() });