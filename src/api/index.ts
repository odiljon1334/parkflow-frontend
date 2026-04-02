import api from './axios'
import { ReportPeriod } from '../types'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
  createUser: (data: {
    name: string
    username: string
    password: string
    role: string
    regionId?: string
    parkingId?: string
  }) => api.post('/auth/users', data),
}

// ─── Regions ─────────────────────────────────────────────────────────────────
export const regionsApi = {
  getAll: () => api.get('/regions'),
  getOne: (id: string) => api.get(`/regions/${id}`),
  create: (name: string) => api.post('/regions', { name }),
  update: (id: string, name: string) => api.put(`/regions/${id}`, { name }),
  remove: (id: string) => api.delete(`/regions/${id}`),
}

// ─── Parkings ─────────────────────────────────────────────────────────────────
export const parkingsApi = {
  getAll: (regionId?: string) =>
    api.get('/parkings', { params: regionId ? { regionId } : {} }),
  getOne: (id: string) => api.get(`/parkings/${id}`),
  create: (data: { name: string; address?: string; regionId: string }) =>
    api.post('/parkings', data),
  update: (id: string, data: Partial<{ name: string; address: string }>) =>
    api.put(`/parkings/${id}`, data),
  remove: (id: string) => api.delete(`/parkings/${id}`),
}

// ─── Cameras ─────────────────────────────────────────────────────────────────
export const camerasApi = {
  getAll: (parkingId: string) => api.get('/cameras', { params: { parkingId } }),
  create: (data: { name: string; type: string; ipAddress?: string; parkingId: string }) =>
    api.post('/cameras', data),
  update: (id: string, data: { name?: string; type?: string; ipAddress?: string }) =>
    api.put(`/cameras/${id}`, data),
  remove: (id: string) => api.delete(`/cameras/${id}`),
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
export const pricingApi = {
  getTiers: (parkingId: string) => api.get(`/parkings/${parkingId}/pricing`),
  setTiers: (parkingId: string, tiers: { fromMinutes: number; toMinutes?: number; price: number }[]) =>
    api.put(`/parkings/${parkingId}/pricing`, { tiers }),
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const vehiclesApi = {
  getInside: (parkingId: string) =>
    api.get('/vehicles/inside', { params: { parkingId } }),
  previewPrice: (parkingId: string, plate: string) =>
    api.get('/vehicles/preview-price', { params: { parkingId, plate } }),
  entry: (data: { plateNumber: string; parkingId: string; method?: string }) =>
    api.post('/vehicles/entry', data),
  exit: (data: { plateNumber: string; parkingId: string; method?: string; paymentMethod?: string }) =>
    api.post('/vehicles/exit', data),
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  getParkingSummary: (parkingId: string, period: ReportPeriod) =>
    api.get(`/reports/parking/${parkingId}`, { params: { period } }),
  getRegionSummary: (regionId: string, period: ReportPeriod) =>
    api.get(`/reports/region/${regionId}`, { params: { period } }),
  downloadExcel: (parkingId: string, period: ReportPeriod) =>
    api.get(`/reports/parking/${parkingId}/excel`, {
      params: { period },
      responseType: 'blob',
    }),
}
