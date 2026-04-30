export type Role = 'ADMIN' | 'MANAGER' | 'INVENTORY_CLERK' | 'TECHNICIAN' | 'AUDITOR';
export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'UNDER_MAINTENANCE' | 'DISPOSED';
export type TransactionType = 'INWARD' | 'OUTWARD' | 'TRANSFER';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatar: string;
  isActive: boolean;
}

export interface Asset {
  id: string;
  serialNo: string;
  name: string;
  assetType: string;
  status: AssetStatus;
  location: string;
  department: string;
  assignedTo: string | null;
  purchaseDate: Date;
  cost: number;
  warrantyExpiry: Date | null;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  location: string;
  description: string;
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  fromLocation: string | null;
  toLocation: string | null;
  performedBy: string;
  date: Date;
  notes: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  assetSerialNo: string;
  maintenanceType: MaintenanceType;
  scheduledDate: Date;
  completedDate: Date | null;
  technician: string;
  cost: number | null;
  status: MaintenanceStatus;
  remarks: string;
}

const today = new Date();
const daysFromNow = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

export const USERS: User[] = [
  { id: 'u1', name: 'Vidushi Tripathi', email: 'vidushi@synopsis.com', role: 'ADMIN', department: 'IT', avatar: 'VT', isActive: true },
  { id: 'u2', name: 'Rajesh Kumar', email: 'rajesh@synopsis.com', role: 'MANAGER', department: 'Operations', avatar: 'RK', isActive: true },
  { id: 'u3', name: 'Priya Sharma', email: 'priya@synopsis.com', role: 'INVENTORY_CLERK', department: 'Operations', avatar: 'PS', isActive: true },
  { id: 'u4', name: 'Amit Patel', email: 'amit@synopsis.com', role: 'TECHNICIAN', department: 'Engineering', avatar: 'AP', isActive: true },
  { id: 'u5', name: 'Sneha Reddy', email: 'sneha@synopsis.com', role: 'AUDITOR', department: 'Finance', avatar: 'SR', isActive: true },
];

export const ASSETS: Asset[] = [
  { id: 'a1', serialNo: 'LAP-001', name: 'Dell Laptop XPS 13', assetType: 'Laptop', status: 'ASSIGNED', location: 'Engineering Floor', department: 'Engineering', assignedTo: 'Amit Patel', purchaseDate: daysAgo(400), cost: 1200, warrantyExpiry: daysFromNow(15), createdAt: daysAgo(400) },
  { id: 'a2', serialNo: 'SRV-001', name: 'HP ProLiant Server', assetType: 'Server', status: 'AVAILABLE', location: 'IT Department', department: 'IT', assignedTo: null, purchaseDate: daysAgo(350), cost: 3500, warrantyExpiry: daysFromNow(18), createdAt: daysAgo(350) },
  { id: 'a3', serialNo: 'PRN-001', name: 'Canon Laser Printer', assetType: 'Printer', status: 'UNDER_MAINTENANCE', location: 'Main Warehouse', department: 'Operations', assignedTo: null, purchaseDate: daysAgo(300), cost: 450, warrantyExpiry: daysFromNow(12), createdAt: daysAgo(300) },
  { id: 'a4', serialNo: 'VEH-001', name: 'Toyota Forklift', assetType: 'Vehicle', status: 'AVAILABLE', location: 'Main Warehouse', department: 'Operations', assignedTo: null, purchaseDate: daysAgo(800), cost: 25000, warrantyExpiry: daysFromNow(200), createdAt: daysAgo(800) },
  { id: 'a5', serialNo: 'GEN-001', name: 'Caterpillar Generator', assetType: 'Generator', status: 'AVAILABLE', location: 'Main Warehouse', department: 'Operations', assignedTo: null, purchaseDate: daysAgo(700), cost: 15000, warrantyExpiry: daysFromNow(180), createdAt: daysAgo(700) },
  { id: 'a6', serialNo: 'LAP-002', name: 'MacBook Pro 16"', assetType: 'Laptop', status: 'ASSIGNED', location: 'IT Department', department: 'IT', assignedTo: 'Vidushi Tripathi', purchaseDate: daysAgo(200), cost: 2500, warrantyExpiry: daysFromNow(165), createdAt: daysAgo(200) },
  { id: 'a7', serialNo: 'PRJ-001', name: 'Epson Projector', assetType: 'Projector', status: 'AVAILABLE', location: 'Engineering Floor', department: 'Engineering', assignedTo: null, purchaseDate: daysAgo(250), cost: 800, warrantyExpiry: daysFromNow(115), createdAt: daysAgo(250) },
  { id: 'a8', serialNo: 'SCN-001', name: 'Fujitsu Scanner', assetType: 'Scanner', status: 'ASSIGNED', location: 'Finance Office', department: 'Finance', assignedTo: 'Sneha Reddy', purchaseDate: daysAgo(180), cost: 350, warrantyExpiry: daysFromNow(185), createdAt: daysAgo(180) },
  { id: 'a9', serialNo: 'LAP-003', name: 'Lenovo ThinkPad', assetType: 'Laptop', status: 'UNDER_MAINTENANCE', location: 'IT Department', department: 'Operations', assignedTo: null, purchaseDate: daysAgo(450), cost: 950, warrantyExpiry: daysFromNow(50), createdAt: daysAgo(450) },
  { id: 'a10', serialNo: 'SRV-002', name: 'Dell PowerEdge Server', assetType: 'Server', status: 'AVAILABLE', location: 'IT Department', department: 'IT', assignedTo: null, purchaseDate: daysAgo(500), cost: 4200, warrantyExpiry: daysFromNow(95), createdAt: daysAgo(500) },
  { id: 'a11', serialNo: 'PRN-002', name: 'HP LaserJet Pro', assetType: 'Printer', status: 'ASSIGNED', location: 'Operations Office', department: 'Operations', assignedTo: 'Rajesh Kumar', purchaseDate: daysAgo(150), cost: 380, warrantyExpiry: daysFromNow(215), createdAt: daysAgo(150) },
  { id: 'a12', serialNo: 'TAB-001', name: 'iPad Pro 12.9"', assetType: 'Tablet', status: 'DISPOSED', location: 'Storage', department: 'IT', assignedTo: null, purchaseDate: daysAgo(1200), cost: 1100, warrantyExpiry: daysAgo(100), createdAt: daysAgo(1200) },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'i1', name: 'A4 Paper', category: 'Office Supplies', unit: 'Ream', quantityOnHand: 5, reorderLevel: 20, location: 'Main Warehouse', description: 'White A4 printing paper' },
  { id: 'i2', name: 'Toner Cartridge HP', category: 'Office Supplies', unit: 'Piece', quantityOnHand: 2, reorderLevel: 5, location: 'Main Warehouse', description: 'HP LaserJet toner cartridge' },
  { id: 'i3', name: 'Safety Helmets', category: 'Safety Equipment', unit: 'Piece', quantityOnHand: 3, reorderLevel: 10, location: 'Main Warehouse', description: 'Industrial safety helmets' },
  { id: 'i4', name: 'Ethernet Cables', category: 'Spare Parts', unit: 'Meter', quantityOnHand: 15, reorderLevel: 50, location: 'IT Department', description: 'Cat6 ethernet cables' },
  { id: 'i5', name: 'Printer Ink Black', category: 'Office Supplies', unit: 'Cartridge', quantityOnHand: 0, reorderLevel: 3, location: 'Main Warehouse', description: 'Black ink cartridge for inkjet printers' },
  { id: 'i6', name: 'Fire Extinguisher', category: 'Safety Equipment', unit: 'Piece', quantityOnHand: 0, reorderLevel: 2, location: 'Main Warehouse', description: 'Portable fire extinguisher' },
  { id: 'i7', name: 'USB Flash Drives 32GB', category: 'Office Supplies', unit: 'Piece', quantityOnHand: 45, reorderLevel: 10, location: 'IT Department', description: 'USB 3.0 flash drives' },
  { id: 'i8', name: 'Cleaning Supplies', category: 'Consumables', unit: 'Bottle', quantityOnHand: 8, reorderLevel: 5, location: 'Main Warehouse', description: 'Multi-purpose cleaning solution' },
  { id: 'i9', name: 'Batteries AA', category: 'Consumables', unit: 'Pack', quantityOnHand: 22, reorderLevel: 15, location: 'Main Warehouse', description: 'Alkaline AA batteries pack of 10' },
  { id: 'i10', name: 'HDMI Cables', category: 'Spare Parts', unit: 'Piece', quantityOnHand: 18, reorderLevel: 8, location: 'IT Department', description: '2m HDMI cables' },
  { id: 'i11', name: 'Sticky Notes', category: 'Office Supplies', unit: 'Pack', quantityOnHand: 35, reorderLevel: 20, location: 'Main Warehouse', description: 'Assorted color sticky notes' },
  { id: 'i12', name: 'Safety Gloves', category: 'Safety Equipment', unit: 'Pair', quantityOnHand: 28, reorderLevel: 15, location: 'Main Warehouse', description: 'Industrial work gloves' },
  { id: 'i13', name: 'Keyboard & Mouse Set', category: 'Spare Parts', unit: 'Set', quantityOnHand: 12, reorderLevel: 5, location: 'IT Department', description: 'Wireless keyboard and mouse combo' },
  { id: 'i14', name: 'Whiteboard Markers', category: 'Office Supplies', unit: 'Box', quantityOnHand: 19, reorderLevel: 10, location: 'Main Warehouse', description: 'Dry erase markers assorted colors' },
  { id: 'i15', name: 'Power Strips', category: 'Spare Parts', unit: 'Piece', quantityOnHand: 14, reorderLevel: 6, location: 'IT Department', description: '6-outlet surge protector power strips' },
];

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', itemId: 'i1', itemName: 'A4 Paper', type: 'INWARD', quantity: 50, fromLocation: null, toLocation: 'Main Warehouse', performedBy: 'Priya Sharma', date: daysAgo(55), notes: 'Monthly stock replenishment' },
  { id: 't2', itemId: 'i2', itemName: 'Toner Cartridge HP', type: 'OUTWARD', quantity: 3, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(48), notes: 'Issued to Operations' },
  { id: 't3', itemId: 'i7', itemName: 'USB Flash Drives 32GB', type: 'INWARD', quantity: 50, fromLocation: null, toLocation: 'IT Department', performedBy: 'Vidushi Tripathi', date: daysAgo(42), notes: 'New purchase order' },
  { id: 't4', itemId: 'i3', itemName: 'Safety Helmets', type: 'OUTWARD', quantity: 7, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Rajesh Kumar', date: daysAgo(38), notes: 'Warehouse team equipment' },
  { id: 't5', itemId: 'i4', itemName: 'Ethernet Cables', type: 'TRANSFER', quantity: 20, fromLocation: 'Main Warehouse', toLocation: 'IT Department', performedBy: 'Amit Patel', date: daysAgo(35), notes: 'Network upgrade project' },
  { id: 't6', itemId: 'i8', itemName: 'Cleaning Supplies', type: 'INWARD', quantity: 12, fromLocation: null, toLocation: 'Main Warehouse', performedBy: 'Priya Sharma', date: daysAgo(30), notes: 'Quarterly supplies order' },
  { id: 't7', itemId: 'i1', itemName: 'A4 Paper', type: 'OUTWARD', quantity: 45, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(25), notes: 'Distributed to departments' },
  { id: 't8', itemId: 'i9', itemName: 'Batteries AA', type: 'INWARD', quantity: 30, fromLocation: null, toLocation: 'Main Warehouse', performedBy: 'Priya Sharma', date: daysAgo(22), notes: 'Stock replenishment' },
  { id: 't9', itemId: 'i10', itemName: 'HDMI Cables', type: 'OUTWARD', quantity: 5, fromLocation: 'IT Department', toLocation: null, performedBy: 'Amit Patel', date: daysAgo(18), notes: 'Conference room setup' },
  { id: 't10', itemId: 'i11', itemName: 'Sticky Notes', type: 'INWARD', quantity: 40, fromLocation: null, toLocation: 'Main Warehouse', performedBy: 'Priya Sharma', date: daysAgo(15), notes: 'Office supplies order' },
  { id: 't11', itemId: 'i12', itemName: 'Safety Gloves', type: 'OUTWARD', quantity: 12, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Rajesh Kumar', date: daysAgo(12), notes: 'Maintenance team' },
  { id: 't12', itemId: 'i13', itemName: 'Keyboard & Mouse Set', type: 'INWARD', quantity: 15, fromLocation: null, toLocation: 'IT Department', performedBy: 'Vidushi Tripathi', date: daysAgo(10), notes: 'New employee equipment' },
  { id: 't13', itemId: 'i14', itemName: 'Whiteboard Markers', type: 'OUTWARD', quantity: 8, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(8), notes: 'Meeting rooms' },
  { id: 't14', itemId: 'i15', itemName: 'Power Strips', type: 'INWARD', quantity: 20, fromLocation: null, toLocation: 'IT Department', performedBy: 'Amit Patel', date: daysAgo(7), notes: 'Office expansion' },
  { id: 't15', itemId: 'i7', itemName: 'USB Flash Drives 32GB', type: 'OUTWARD', quantity: 5, fromLocation: 'IT Department', toLocation: null, performedBy: 'Vidushi Tripathi', date: daysAgo(6), notes: 'Project team' },
  { id: 't16', itemId: 'i8', itemName: 'Cleaning Supplies', type: 'OUTWARD', quantity: 4, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(5), notes: 'Facility maintenance' },
  { id: 't17', itemId: 'i9', itemName: 'Batteries AA', type: 'OUTWARD', quantity: 8, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(4), notes: 'Various departments' },
  { id: 't18', itemId: 'i2', itemName: 'Toner Cartridge HP', type: 'OUTWARD', quantity: 1, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(3), notes: 'Printer replacement' },
  { id: 't19', itemId: 'i4', itemName: 'Ethernet Cables', type: 'OUTWARD', quantity: 15, fromLocation: 'IT Department', toLocation: null, performedBy: 'Amit Patel', date: daysAgo(3), notes: 'Network installation' },
  { id: 't20', itemId: 'i10', itemName: 'HDMI Cables', type: 'INWARD', quantity: 10, fromLocation: null, toLocation: 'IT Department', performedBy: 'Vidushi Tripathi', date: daysAgo(2), notes: 'Stock replenishment' },
  { id: 't21', itemId: 'i13', itemName: 'Keyboard & Mouse Set', type: 'OUTWARD', quantity: 3, fromLocation: 'IT Department', toLocation: null, performedBy: 'Amit Patel', date: daysAgo(2), notes: 'New hires' },
  { id: 't22', itemId: 'i11', itemName: 'Sticky Notes', type: 'OUTWARD', quantity: 5, fromLocation: 'Main Warehouse', toLocation: null, performedBy: 'Priya Sharma', date: daysAgo(1), notes: 'Office distribution' },
  { id: 't23', itemId: 'i14', itemName: 'Whiteboard Markers', type: 'INWARD', quantity: 12, fromLocation: null, toLocation: 'Main Warehouse', performedBy: 'Priya Sharma', date: daysAgo(1), notes: 'Restock' },
  { id: 't24', itemId: 'i15', itemName: 'Power Strips', type: 'OUTWARD', quantity: 6, fromLocation: 'IT Department', toLocation: null, performedBy: 'Amit Patel', date: today, notes: 'Workstation setup' },
  { id: 't25', itemId: 'i12', itemName: 'Safety Gloves', type: 'INWARD', quantity: 25, fromLocation: null, toLocation: 'Main Warehouse', performedBy: 'Rajesh Kumar', date: today, notes: 'Safety equipment order' },
];

export const MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  { id: 'm1', assetId: 'a1', assetName: 'Dell Laptop XPS 13', assetSerialNo: 'LAP-001', maintenanceType: 'PREVENTIVE', scheduledDate: daysFromNow(2), completedDate: null, technician: 'Amit Patel', cost: null, status: 'SCHEDULED', remarks: 'Routine laptop maintenance and cleaning' },
  { id: 'm2', assetId: 'a2', assetName: 'HP ProLiant Server', assetSerialNo: 'SRV-001', maintenanceType: 'CORRECTIVE', scheduledDate: daysFromNow(4), completedDate: null, technician: 'Amit Patel', cost: null, status: 'SCHEDULED', remarks: 'Server hardware check and firmware update' },
  { id: 'm3', assetId: 'a3', assetName: 'Canon Laser Printer', assetSerialNo: 'PRN-001', maintenanceType: 'CORRECTIVE', scheduledDate: daysFromNow(6), completedDate: null, technician: 'Amit Patel', cost: null, status: 'IN_PROGRESS', remarks: 'Paper jam issue and roller replacement' },
  { id: 'm4', assetId: 'a4', assetName: 'Toyota Forklift', assetSerialNo: 'VEH-001', maintenanceType: 'PREVENTIVE', scheduledDate: daysFromNow(15), completedDate: null, technician: 'Amit Patel', cost: null, status: 'SCHEDULED', remarks: 'Quarterly vehicle inspection' },
  { id: 'm5', assetId: 'a5', assetName: 'Caterpillar Generator', assetSerialNo: 'GEN-001', maintenanceType: 'PREVENTIVE', scheduledDate: daysFromNow(20), completedDate: null, technician: 'Amit Patel', cost: null, status: 'SCHEDULED', remarks: 'Oil change and filter replacement' },
  { id: 'm6', assetId: 'a6', assetName: 'MacBook Pro 16"', assetSerialNo: 'LAP-002', maintenanceType: 'PREVENTIVE', scheduledDate: daysAgo(10), completedDate: daysAgo(10), technician: 'Amit Patel', cost: 150, status: 'COMPLETED', remarks: 'Battery health check and software updates completed' },
  { id: 'm7', assetId: 'a9', assetName: 'Lenovo ThinkPad', assetSerialNo: 'LAP-003', maintenanceType: 'CORRECTIVE', scheduledDate: daysAgo(5), completedDate: daysAgo(3), technician: 'Amit Patel', cost: 280, status: 'COMPLETED', remarks: 'Hard drive replacement and OS reinstallation' },
  { id: 'm8', assetId: 'a10', assetName: 'Dell PowerEdge Server', assetSerialNo: 'SRV-002', maintenanceType: 'PREVENTIVE', scheduledDate: daysFromNow(30), completedDate: null, technician: 'Amit Patel', cost: null, status: 'SCHEDULED', remarks: 'Scheduled server maintenance' },
  { id: 'm9', assetId: 'a7', assetName: 'Epson Projector', assetSerialNo: 'PRJ-001', maintenanceType: 'PREVENTIVE', scheduledDate: daysAgo(20), completedDate: daysAgo(18), technician: 'Amit Patel', cost: 120, status: 'COMPLETED', remarks: 'Lamp replacement and lens cleaning' },
  { id: 'm10', assetId: 'a11', assetName: 'HP LaserJet Pro', assetSerialNo: 'PRN-002', maintenanceType: 'PREVENTIVE', scheduledDate: daysFromNow(45), completedDate: null, technician: 'Amit Patel', cost: null, status: 'SCHEDULED', remarks: 'Routine printer maintenance' },
];