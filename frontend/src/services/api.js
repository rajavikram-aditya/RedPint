import axios from 'axios';
import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ Auth ============
export const verifyUser = () => api.post('/auth/verify');
export const getMe = () => api.get('/auth/me');

// ============ Donors ============
export const registerDonor = (formData) =>
  api.post('/donors/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getDonorProfile = () => api.get('/donors/me/profile');
export const updateDonorProfile = (data) => api.patch('/donors/me/profile', data);
export const getDonorMatches = () => api.get('/donors/me/matches');

// ============ Hospitals ============
export const registerHospital = (formData) =>
  api.post('/hospitals/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getAllHospitals = () => api.get('/hospitals');
export const getHospitalProfile = () => api.get('/hospitals/me/profile');
export const updateHospitalProfile = (data) => api.patch('/hospitals/me/profile', data);

// ============ Blood Requests ============
export const createBloodRequest = (data) => api.post('/blood-requests', data);
export const createInterHospitalRequest = (data) =>
  api.post('/blood-requests/inter-hospital', data);
export const getBloodRequest = (id) => api.get(`/blood-requests/${id}`);
export const getMatchesForRequest = (id) => api.get(`/blood-requests/${id}/matches`);
export const getMyRequests = () => api.get('/blood-requests/hospital/my-requests');

// ============ Matches ============
export const respondToMatch = (id, responseStatus) =>
  api.patch(`/matches/${id}/respond`, { responseStatus });

// ============ Donations ============
export const recordDonation = (data) => api.post('/donations', data);
export const getDonations = () => api.get('/donations');

// ============ Hospital Stock ============
export const getHospitalStock = (hospitalId) =>
  api.get('/hospital-stock', { params: hospitalId ? { hospitalId } : {} });
export const updateHospitalStock = (data) => api.put('/hospital-stock', data);
export const bulkUpdateStock = (stocks) => api.post('/hospital-stock/bulk', { stocks });

// ============ Drives ============
export const createDrive = (data) => api.post('/drives', data);
export const getDrives = () => api.get('/drives');

// ============ Notifications ============
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

export default api;
