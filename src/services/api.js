import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('farmstay_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('farmstay_token');
            if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export const farmhouseAPI = {
    getAll: (params) => api.get('/farmhouses', { params }),
    getAdminAll: (params) => api.get('/farmhouses/admin/all', { params }),
    getById: (id) => api.get(`/farmhouses/${id}`),
    getBySlug: (slug) => api.get(`/farmhouses/${slug}`),
    create: (data) => api.post('/farmhouses', data),
    update: (id, data) => api.put(`/farmhouses/${id}`, data),
    delete: (id) => api.delete(`/farmhouses/${id}`),
    getCities: () => api.get('/farmhouses/cities/list'),
    getSubLocations: (city) => api.get('/farmhouses/sublocations/list', { params: { city } }),
    bulkCreate: (farms) => api.post('/farmhouses/bulk', { farms }),
};

export const bookingAPI = {
    create: (data) => api.post('/bookings', data),
    getAll: (params) => api.get('/bookings', { params }),
    updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
    delete: (id) => api.delete(`/bookings/${id}`),
};

export const reviewAPI = {
    create: (data) => api.post('/reviews', data, { timeout: 60000 }),
    getByFarmhouse: (id, params) => api.get(`/reviews/farmhouse/${id}`, { params }),
    getPhotos: (id) => api.get(`/reviews/photos/${id}`),
    markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
    getAll: (params) => api.get('/reviews', { params }),
    toggleApproval: (id) => api.put(`/reviews/${id}/approve`),
    delete: (id) => api.delete(`/reviews/${id}`),
};

export const uploadAPI = {
    images: (formData, onProgress) =>
        api.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 120000,
            onUploadProgress: onProgress
                ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
                : undefined,
        }),
    videos: (formData, onProgress) =>
        api.post('/upload/videos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 300000,
            onUploadProgress: onProgress
                ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
                : undefined,
        }),
    reviewImages: (formData, onProgress) =>
        api.post('/upload/review-images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000,
            onUploadProgress: onProgress
                ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
                : undefined,
        }),
    deleteFile: (url) => api.delete('/upload/delete', { data: { url } }),
};

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export default api;