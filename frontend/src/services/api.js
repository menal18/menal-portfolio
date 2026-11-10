// import axios from 'axios';

// export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
// export const TOKEN_KEY = 'menal_admin_token';

// const api = axios.create({ baseURL: API_BASE, timeout: 30000 });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// api.interceptors.response.use(
//   (r) => r,
//   (err) => {
//     // Expired session on an admin screen: clear token and go to login
//     if (err.response?.status === 401 && localStorage.getItem(TOKEN_KEY) && !err.config.url.includes('/auth/login')) {
//       localStorage.removeItem(TOKEN_KEY);
//       if (location.pathname.startsWith('/admin') && !location.pathname.includes('/login')) location.assign('/admin/login');
//     }
//     return Promise.reject(err);
//   }
// );

// export const errMsg = (err) => err?.response?.data?.message || (err?.code === 'ECONNABORTED' ? 'The request timed out' : err?.message === 'Network Error' ? 'Cannot reach the server. Is the backend running?' : err?.message) || 'Something went wrong';

// export const resumeUrl = `${API_BASE}/resume/download`;
// export default api;


import axios from 'axios';

export const API_BASE = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/+$/, '');

export const TOKEN_KEY = 'menal_admin_token';

console.log('API Base URL:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (
      err.response?.status === 401 &&
      localStorage.getItem(TOKEN_KEY) &&
      !err.config?.url?.includes('/auth/login')
    ) {
      localStorage.removeItem(TOKEN_KEY);

      if (
        location.pathname.startsWith('/admin') &&
        !location.pathname.includes('/login')
      ) {
        location.assign('/admin/login');
      }
    }

    return Promise.reject(err);
  }
);

export const errMsg = (err) =>
  err?.response?.data?.message ||
  (err?.code === 'ECONNABORTED'
    ? 'The request timed out'
    : err?.message === 'Network Error'
      ? 'Cannot reach the server. Is the backend running?'
      : err?.message) ||
  'Something went wrong';

export const resumeUrl = `${API_BASE}/resume/download`;

export default api;
