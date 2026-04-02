export type Role = 'SUPER_ADMIN' | 'REGION_ADMIN' | 'OPERATOR'
export type CameraType = 'ENTRY' | 'EXIT'
export type VehicleStatus = 'INSIDE' | 'EXITED'
export type EntryMethod = 'AUTO' | 'MANUAL'
export type PaymentMethod = 'CASH' | 'CARD'
export type ReportPeriod = 'daily' | 'weekly' | 'monthly'

export interface User {
  id: string
  name: string
  username: string
  role: Role
  regionId: string | null
  parkingId: string | null
  region?: Region | null
  parking?: Parking | null
}

export interface Region {
  id: string
  name: string
  _count?: { parkings: number }
}

export interface Parking {
  id: string
  name: string
  address?: string
  regionId: string
  region?: Region
  cameras?: Camera[]
  pricingTiers?: PricingTier[]
  _count?: { vehicles: number }
}

export interface Camera {
  id: string
  name: string
  type: CameraType
  ipAddress?: string
  parkingId: string
}

export interface PricingTier {
  id: string
  parkingId: string
  fromMinutes: number
  toMinutes: number | null
  price: number
}

export interface Vehicle {
  id: string
  plateNumber: string
  country: string
  entryTime: string
  exitTime?: string
  durationMin?: number
  status: VehicleStatus
  entryMethod: EntryMethod
  amount?: number
  parkingId: string
  payment?: Payment
}

export interface Payment {
  id: string
  vehicleId: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

export interface ReportSummary {
  period: ReportPeriod
  from: string
  to: string
  totalVehicles: number
  totalIncome: number
}
