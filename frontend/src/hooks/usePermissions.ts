import { useApp } from '../context/AppContext';

export const usePermissions = () => {
  const { currentUser } = useApp();

  const can = (action: string): boolean => {
    if (!currentUser) return false;

    const role = currentUser.role;

    switch (action) {
      case 'manage_users':
        return role === 'ADMIN';
      
      case 'view_activity_log':
        return role === 'ADMIN' || role === 'AUDITOR';
      
      case 'edit_asset':
      case 'delete_asset':
        return role === 'ADMIN' || role === 'MANAGER';
      
      case 'change_asset_status':
        return role === 'ADMIN' || role === 'MANAGER' || role === 'TECHNICIAN';
      
      case 'edit_inventory':
      case 'delete_inventory':
        return role === 'ADMIN' || role === 'MANAGER' || role === 'INVENTORY_CLERK';
      
      case 'record_transaction':
        return role === 'ADMIN' || role === 'MANAGER' || role === 'INVENTORY_CLERK';
      
      case 'manage_maintenance':
        return role === 'ADMIN' || role === 'MANAGER' || role === 'TECHNICIAN';
      
      case 'view_reports':
        return true; // All roles can view reports
      
      case 'edit_anything':
        return role !== 'AUDITOR'; // Auditor can only view
      
      default:
        return false;
    }
  };

  const canAccessRoute = (route: string): boolean => {
    if (!currentUser) return false;

    if (route === '/users') {
      return can('manage_users');
    }
    
    if (route === '/activity') {
      return can('view_activity_log');
    }

    return true;
  };

  return { can, canAccessRoute, role: currentUser?.role };
};