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
    phone?: string
    password: string
    role: string
    regionId?: string
    parkingId?: string
  }) => api.post('/auth/users', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
}

// ─── Regions ─────────────────────────────────────────────────────────────────
export const regionsApi = {
  getAll: ()                            => api.get('/regions'),
  getOne: (id: string)                  => api.get(`/regions/${id}`),
  create: (data: { name: string; code?: string }) => api.post('/regions', data),
  update: (id: string, data: { name?: string; code?: string }) => api.put(`/regions/${id}`, data),
  remove: (id: string)                  => api.delete(`/regions/${id}`),
}

// ─── Parkings ─────────────────────────────────────────────────────────────────
export const parkingsApi = {
  getAll: (regionId?: string) =>
    api.get('/parkings', { params: regionId ? { regionId } : {} }),
  getOne: (id: string) =>
    api.get(`/parkings/${id}`),
  create: (data: { name: string; address?: string; capacity?: number; regionId: string }) =>
    api.post('/parkings', data),
  update: (id: string, data: Partial<{ name: string; address: string; capacity: number }>) =>
    api.put(`/parkings/${id}`, data),
  remove: (id: string) =>
    api.delete(`/parkings/${id}`),
}

// ─── Cameras ─────────────────────────────────────────────────────────────────
export const camerasApi = {
  getAll: (parkingId: string) =>
    api.get('/cameras', { params: { parkingId } }),
  getStatuses: (parkingId: string) =>
    api.get('/cameras/statuses', { params: { parkingId } }),
  create: (data: { name: string; type: string; ipAddress?: string; webhookKey?: string; parkingId: string }) =>
    api.post('/cameras', data),
  update: (id: string, data: { name?: string; type?: string; ipAddress?: string }) =>
    api.put(`/cameras/${id}`, data),
  remove: (id: string) =>
    api.delete(`/cameras/${id}`),
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
export const pricingApi = {
  getRules: (parkingId: string) =>
    api.get(`/parkings/${parkingId}/pricing`),

  setPlan: (
    parkingId: string,
    data: {
      name?: string
      tiers: { fromMinutes: number; toMinutes?: number; price: number; label?: string }[]
    },
  ) => api.put(`/parkings/${parkingId}/pricing`, data),

  getAllPlans: () =>
    api.get('/parkings/pricing/all'),
}

// ─── Vehicles (Sessions) ─────────────────────────────────────────────────────
export const vehiclesApi = {
  // Hozir ichkaridagi mashinalar (ACTIVE sessions)
  getActive: (parkingId: string) =>
    api.get('/vehicles/active', { params: { parkingId } }),

  // To'lanmagan sessionlar
  getUnpaid: (parkingId: string) =>
    api.get('/vehicles/unpaid', { params: { parkingId } }),

  // Barcha sessionlar (filter bilan)
  getAll: (parkingId: string, from?: string, to?: string) =>
    api.get('/vehicles', { params: { parkingId, from, to } }),

  // Chiqishdan oldin narx preview
  previewPrice: (parkingId: string, plate: string) =>
    api.get('/vehicles/preview-price', { params: { parkingId, plate } }),

  // Kirish
  entry: (data: { plateNumber: string; parkingId: string; method?: string; cameraId?: string }) =>
    api.post('/vehicles/entry', data),

  // Chiqish
  exit: (data: {
    plateNumber: string
    parkingId: string
    method?: string
    paymentMethod?: string
    cameraId?: string
  }) => api.post('/vehicles/exit', data),

  // Manual yopish
  manualClose: (id: string, note?: string) =>
    api.patch(`/vehicles/${id}/close`, { note }),
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  getParkingSummary: (parkingId: string, period: ReportPeriod) =>
    api.get(`/reports/parking/${parkingId}`, { params: { period } }),

  getRegionSummary: (regionId: string, period: ReportPeriod) =>
    api.get(`/reports/region/${regionId}`, { params: { period } }),

  getGlobalSummary: (period: ReportPeriod) =>
    api.get('/reports/global', { params: { period } }),

  downloadExcel: (parkingId: string, period: ReportPeriod) =>
    api.get(`/reports/parking/${parkingId}/excel`, {
      params:       { period },
      responseType: 'blob',
    }),
}
