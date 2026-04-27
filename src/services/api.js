import axios from 'axios';

const api = axios.create({
  baseURL: 'https://optivis.onrender.com/api',
});

let activeColdStarts = 0;

function dispatchColdStartEvent(eventName) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

function withColdStartHandling(promise) {
  if (typeof window === 'undefined') {
    return promise;
  }

  let timeoutTriggered = false;
  const timeoutId = window.setTimeout(() => {
    timeoutTriggered = true;
    activeColdStarts += 1;

    if (activeColdStarts === 1) {
      dispatchColdStartEvent('cold-start');
    }
  }, 3000);

  return promise.finally(() => {
    window.clearTimeout(timeoutId);

    if (!timeoutTriggered) {
      return;
    }

    activeColdStarts = Math.max(0, activeColdStarts - 1);

    if (activeColdStarts === 0) {
      dispatchColdStartEvent('cold-start-resolved');
    }
  });
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error,
    });
  }
);

const originalRequest = api.request.bind(api);

api.request = (...args) => withColdStartHandling(originalRequest(...args));

export default api;
