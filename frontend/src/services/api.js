import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("docreserve_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const clinicService = {
  getInfo: () => api.get("/api/clinic").then((r) => r.data),
};

export const bookingService = {
  create: (payload) => api.post("/api/bookings", payload).then((r) => r.data),
  getTicket: (id) => api.get(`/api/bookings/${id}`).then((r) => r.data),
};

export const queueService = {
  list: (date) =>
    api
      .get("/api/queue", { params: date ? { date } : {} })
      .then((r) => r.data),
  callNext: (date) =>
    api.post("/api/queue/call-next", { date }).then((r) => r.data),
  skip: (id) => api.post(`/api/queue/skip/${id}`).then((r) => r.data),
  recall: (id) => api.post(`/api/queue/recall/${id}`).then((r) => r.data),
  complete: (id) =>
    api.post(`/api/queue/complete/${id}`).then((r) => r.data),
  report: (range) =>
    api
      .get("/api/queue/report", { params: { range } })
      .then((r) => r.data),
};

export const scheduleService = {
  list: (date) =>
    api
      .get("/api/slots", { params: date ? { date } : {} })
      .then((r) => r.data),
  upsert: (payload) => api.post("/api/slots", payload).then((r) => r.data),
  setOpen: (id, isOpen) =>
    api.patch(`/api/slots/${id}/open`, { isOpen }).then((r) => r.data),
};

export const authService = {
  login: (username, password) =>
    api.post("/api/auth/login", { username, password }).then((r) => r.data),
};

export default api;
