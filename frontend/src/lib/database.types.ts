export type UserRole = 'ADMIN' | 'MANAGER' | 'INVENTORY_CLERK' | 'TECHNICIAN' | 'AUDITOR'
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'DISPOSED'
export type LocationType = 'WAREHOUSE' | 'DEPARTMENT' | 'FLOOR'
export type TransactionType = 'INWARD' | 'OUTWARD' | 'TRANSFER'
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE'
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'

export interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Location {
  id: string
  name: string
  type: LocationType
  description: string | null
  created_at: string
}

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  department_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  department?: Department
}

export interface Asset {
  id: string
  serial_no: string
  name: string
  description: string | null
  asset_type: string
  location_id: string | null
  status: AssetStatus
  purchase_date: string | null
  cost: number | null
  warranty_expiry: string | null
  assigned_to: string | null
  department_id: string | null
  created_at: string
  updated_at: string
  location?: Location
  department?: Department
  assignedUser?: Profile
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  quantity_on_hand: number
  reorder_level: number
  location_id: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  location?: Location
}

export interface InventoryTransaction {
  id: string
  item_id: string
  quantity: number
  type: TransactionType
  from_location_id: string | null
  to_location_id: string | null
  performed_by: string | null
  notes: string | null
  created_at: string
  item?: { name: string; unit: string }
  fromLocation?: { name: string }
  toLocation?: { name: string }
  performer?: { name: string }
}

export interface MaintenanceRecord {
  id: string
  asset_id: string
  maintenance_type: MaintenanceType
  scheduled_date: string
  completed_date: string | null
  technician_id: string | null
  cost: number | null
  status: MaintenanceStatus
  remarks: string | null
  created_at: string
  updated_at: string
  asset?: { name: string; serial_no: string; asset_type: string }
  technician?: { name: string; email: string }
}

export interface AuditLog {
  id: string
  event_type: string
  entity_type: string
  entity_id: string | null
  performed_by: string | null
  details: Record<string, any> | null
  created_at: string
  performer?: { name: string; role: string }
}

type AnyRecord = Record<string, any>

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: AnyRecord; Update: AnyRecord }
      departments: { Row: Department; Insert: AnyRecord; Update: AnyRecord }
      locations: { Row: Location; Insert: AnyRecord; Update: AnyRecord }
      assets: { Row: Asset; Insert: AnyRecord; Update: AnyRecord }
      inventory_items: { Row: InventoryItem; Insert: AnyRecord; Update: AnyRecord }
      inventory_transactions: { Row: InventoryTransaction; Insert: AnyRecord; Update: AnyRecord }
      maintenance_records: { Row: MaintenanceRecord; Insert: AnyRecord; Update: AnyRecord }
      audit_logs: { Row: AuditLog; Insert: AnyRecord; Update: AnyRecord }
    }
  }
}
