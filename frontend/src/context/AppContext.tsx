import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  Profile, Asset, InventoryItem, InventoryTransaction,
  MaintenanceRecord, AuditLog, Location, Department,
  AssetStatus, TransactionType
} from '../lib/database.types'

export type { Profile as User, Asset, InventoryItem, MaintenanceRecord, AuditLog }

interface AppContextType {
  currentUser: Profile | null
  setCurrentUser: (u: Profile | null) => void
  assets: Asset[]
  inventoryItems: InventoryItem[]
  transactions: InventoryTransaction[]
  maintenanceRecords: MaintenanceRecord[]
  users: Profile[]
  locations: Location[]
  departments: Department[]
  auditLogs: AuditLog[]
  loading: boolean
  logout: () => Promise<void>
  addAsset: (asset: Partial<Asset>) => Promise<void>
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  addInventoryItem: (item: Partial<InventoryItem>) => Promise<void>
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteInventoryItem: (id: string) => Promise<void>
  recordTransaction: (tx: {
    itemId: string; quantity: number; type: TransactionType
    fromLocationId?: string; toLocationId?: string; notes?: string
  }) => Promise<void>
  addMaintenance: (record: Partial<MaintenanceRecord>) => Promise<void>
  updateMaintenance: (id: string, updates: Partial<MaintenanceRecord>) => Promise<void>
  deleteMaintenance: (id: string) => Promise<void>
  addUser: (user: { name: string; email: string; password: string; role: Profile['role']; departmentId?: string }) => Promise<void>
  updateUser: (id: string, updates: Partial<Profile>) => Promise<void>
  refetch: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children, currentUser, setCurrentUser }: {
  children: React.ReactNode
  currentUser: Profile | null
  setCurrentUser: (u: Profile | null) => void
}) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!currentUser) { setLoading(false); return }
    setLoading(true)
    try {
      const [
        { data: a }, { data: inv }, { data: tx }, { data: maint },
        { data: u }, { data: loc }, { data: dept }, { data: logs }
      ] = await Promise.all([
        supabase.from('assets').select('*, location:locations(*), department:departments(*), assignedUser:profiles!assets_assigned_to_fkey(*)').order('created_at', { ascending: false }),
        supabase.from('inventory_items').select('*, location:locations(*)').eq('is_active', true).order('name'),
        supabase.from('inventory_transactions').select('*, item:inventory_items(name,unit), fromLocation:locations!inventory_transactions_from_location_id_fkey(name), toLocation:locations!inventory_transactions_to_location_id_fkey(name), performer:profiles!inventory_transactions_performed_by_fkey(name)').order('created_at', { ascending: false }).limit(200),
        supabase.from('maintenance_records').select('*, asset:assets(name,serial_no,asset_type), technician:profiles!maintenance_records_technician_id_fkey(name,email)').order('scheduled_date', { ascending: false }),
        supabase.from('profiles').select('*, department:departments(*)').eq('is_active', true).order('name'),
        supabase.from('locations').select('*').order('name'),
        supabase.from('departments').select('*').order('name'),
        supabase.from('audit_logs').select('*, performer:profiles!audit_logs_performed_by_fkey(name,role)').order('created_at', { ascending: false }).limit(100),
      ])
      setAssets((a as any) || [])
      setInventoryItems((inv as any) || [])
      setTransactions((tx as any) || [])
      setMaintenanceRecords((maint as any) || [])
      setUsers((u as any) || [])
      setLocations((loc as any) || [])
      setDepartments((dept as any) || [])
      setAuditLogs((logs as any) || [])
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function logAudit(eventType: string, entityType: string, entityId?: string, details?: any) {
    if (!currentUser) return
    await supabase.from('audit_logs').insert({
      event_type: eventType, entity_type: entityType,
      entity_id: entityId || null, performed_by: currentUser.id, details: details || {}
    } as any)
  }

  async function addAsset(asset: Partial<Asset>) {
    const { error } = await supabase.from('assets').insert(asset as any)
    if (error) throw error
    await logAudit('ASSET_CREATED', 'Asset', undefined, { name: asset.name })
    await fetchAll()
  }

  async function updateAsset(id: string, updates: Partial<Asset>) {
    // @ts-ignore - Supabase type inference issue
    const { error } = await supabase.from('assets').update(updates).eq('id', id)
    if (error) throw error
    await logAudit('ASSET_UPDATED', 'Asset', id, updates)
    await fetchAll()
  }

  async function deleteAsset(id: string) {
    const { error } = await supabase.from('assets').update({ status: 'DISPOSED' }).eq('id', id)
    if (error) throw error
    await logAudit('ASSET_DISPOSED', 'Asset', id, {})
    await fetchAll()
  }

  async function addInventoryItem(item: Partial<InventoryItem>) {
    const { error } = await supabase.from('inventory_items').insert(item as any)
    if (error) throw error
    await logAudit('INVENTORY_ADDED', 'InventoryItem', undefined, { name: item.name })
    await fetchAll()
  }

  async function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const { error } = await supabase.from('inventory_items').update(updates as any).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function deleteInventoryItem(id: string) {
    const { error } = await supabase.from('inventory_items').update({ is_active: false }).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function recordTransaction(tx: {
    itemId: string; quantity: number; type: TransactionType
    fromLocationId?: string; toLocationId?: string; notes?: string
  }) {
    const item = inventoryItems.find(i => i.id === tx.itemId)
    if (!item) throw new Error('Item not found')

    let newQty = item.quantity_on_hand
    if (tx.type === 'INWARD') newQty += tx.quantity
    else if (tx.type === 'OUTWARD') {
      if (item.quantity_on_hand < tx.quantity) throw new Error('Insufficient stock')
      newQty -= tx.quantity
    }

    const { error: e1 } = await supabase.from('inventory_transactions').insert({
      item_id: tx.itemId, quantity: tx.quantity, type: tx.type,
      from_location_id: tx.fromLocationId || null,
      to_location_id: tx.toLocationId || null,
      performed_by: currentUser?.id || null, notes: tx.notes || null
    } as any)
    if (e1) throw e1

    const { error: e2 } = await supabase.from('inventory_items').update({ quantity_on_hand: newQty }).eq('id', tx.itemId)
    if (e2) throw e2

    await logAudit('STOCK_ISSUED', 'InventoryItem', tx.itemId, { type: tx.type, qty: tx.quantity })
    await fetchAll()
  }

  async function addMaintenance(record: Partial<MaintenanceRecord>) {
    const { error } = await supabase.from('maintenance_records').insert(record as any)
    if (error) throw error
    if (record.maintenance_type === 'CORRECTIVE') {
      await supabase.from('assets').update({ status: 'UNDER_MAINTENANCE' as AssetStatus }).eq('id', record.asset_id!)
    }
    await logAudit('MAINTENANCE_SCHEDULED', 'MaintenanceRecord', undefined, { assetId: record.asset_id })
    await fetchAll()
  }

  async function updateMaintenance(id: string, updates: Partial<MaintenanceRecord>) {
    const { error } = await supabase.from('maintenance_records').update(updates as any).eq('id', id)
    if (error) throw error
    if (updates.status === 'COMPLETED') {
      const record = maintenanceRecords.find(r => r.id === id)
      if (record) {
        await supabase.from('assets').update({ status: 'AVAILABLE' as AssetStatus }).eq('id', record.asset_id)
        await logAudit('MAINTENANCE_DONE', 'MaintenanceRecord', id, { cost: updates.cost })
      }
    }
    await fetchAll()
  }

  async function deleteMaintenance(id: string) {
    const { error } = await supabase.from('maintenance_records').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function addUser(data: { name: string; email: string; password: string; role: Profile['role']; departmentId?: string }) {
    // Step 1: Create user via signUp (works client-side)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role: data.role }
      }
    })
    if (signUpError) throw signUpError

    // Step 2: If profile wasn't auto-created by trigger, create it manually
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
        role: data.role,
        department_id: data.departmentId || null,
        is_active: true,
      } as any)
      if (profileError) throw profileError
    }

    await logAudit('USER_CREATED', 'User', authData.user?.id, { name: data.name, role: data.role })
    await fetchAll()
  }

  async function updateUser(id: string, updates: Partial<Profile>) {
    const { error } = await supabase.from('profiles').update(updates as any).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function logout() {
    await supabase.auth.signOut()
    setCurrentUser(null)
  }

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      assets, inventoryItems, transactions, maintenanceRecords,
      users, locations, departments, auditLogs, loading,
      logout,
      addAsset, updateAsset, deleteAsset,
      addInventoryItem, updateInventoryItem, deleteInventoryItem, recordTransaction,
      addMaintenance, updateMaintenance, deleteMaintenance,
      addUser, updateUser, refetch: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
