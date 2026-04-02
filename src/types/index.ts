// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role           = 'SUPER_ADMIN' | 'REGION_ADMIN' | 'PARKING_ADMIN' | 'OPERATOR'
export type CameraType     = 'ENTRY' | 'EXIT'
export type CameraStatus   = 'ONLINE' | 'OFFLINE' | 'UNKNOWN'
export type SessionStatus  = 'ACTIVE' | 'CLOSED' | 'CANCELLED' | 'LOST' | 'MANUAL'
export type PaymentStatus  = 'PAID' | 'UNPAID' | 'PENDING'
export type PaymentMethod  = 'CASH' | 'CARD' | 'TRANSFER' | 'FREE'
export type EntryMethod    = 'AUTO' | 'MANUAL'
export type ReportPeriod   = 'daily' | 'weekly' | 'monthly'

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id:        string
  fullName:  string
  username:  string
  phone?:    string
  role:      Role
  isActive:  boolean
  regionId:  string | null
  parkingId: string | null
  region?:   Region | null
  parking?:  Parking | null
}

// ─── Region ───────────────────────────────────────────────────────────────────

export interface Region {
  id:       string
  name:     string
  code?:    string
  isActive: boolean
  _count?:  { parkings: number }
}

// ─── Parking ──────────────────────────────────────────────────────────────────

export interface Parking {
  id:           string
  name:         string
  address?:     string
  capacity?:    number
  isActive:     boolean
  regionId:     string
  region?:      Region
  cameras?:     Camera[]
  tariffPlan?:  TariffPlan | null
  activeCount?: number
  _count?:      { sessions: number }
}

// ─── Camera ───────────────────────────────────────────────────────────────────

export interface Camera {
  id:           string
  name:         string
  type:         CameraType
  status:       CameraStatus
  ipAddress?:   string
  serialNumber?: string
  webhookKey?:  string
  lastSeenAt?:  string
  isActive:     boolean
  parkingId:    string
}

// ─── Tariff ───────────────────────────────────────────────────────────────────

export interface TariffRule {
  id:          string
  fromMinutes: number
  toMinutes:   number | null
  price:       number
  label?:      string
  sortOrder:   number
}

export interface TariffPlan {
  id:          string
  name:        string
  description?: string
  isActive:    boolean
  rules:       TariffRule[]
}

// ─── Vehicle Session ──────────────────────────────────────────────────────────

export interface VehicleSession {
  id:              string
  plateNumber:     string
  country:         string
  confidence?:     number
  entryTime:       string
  exitTime?:       string
  durationMinutes?: number
  status:          SessionStatus
  entryMethod:     EntryMethod
  exitMethod?:     EntryMethod
  totalAmount?:    number
  paymentStatus:   PaymentStatus
  entryImageUrl?:  string
  exitImageUrl?:   string
  note?:           string
  parkingId:       string
  regionId?:       string
  entryCameraId?:  string
  exitCameraId?:   string
  entryCamera?:    Camera
  exitCamera?:     Camera
  payment?:        Payment
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id:        string
  sessionId: string
  amount:    number
  method:    PaymentMethod
  status:    PaymentStatus
  paidAt:    string
  paidBy?:   string
  note?:     string
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface ReportSummary {
  period:        ReportPeriod
  from:          string
  to:            string
  totalSessions: number
  totalIncome:   number
}

export interface ParkingReportItem {
  parking:       Parking
  totalSessions: number
  totalIncome:   number
}

export interface RegionReportItem {
  region:        Region
  totalSessions: number
  totalIncome:   number
}

// ─── Price Preview ────────────────────────────────────────────────────────────

export interface PricePreview {
  session:         VehicleSession
  durationMinutes: number
  durationText:    string
  totalAmount:     number
}
