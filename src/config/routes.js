import Dashboard from '@/components/pages/Dashboard';
import Employees from '@/components/pages/Employees';
import Attendance from '@/components/pages/Attendance';
import Leaves from '@/components/pages/Leaves';
import Payroll from '@/components/pages/Payroll';
import Reports from '@/components/pages/Reports';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  employees: {
    id: 'employees',
    label: 'Employees',
    path: '/employees',
    icon: 'Users',
    component: Employees
  },
  attendance: {
    id: 'attendance',
    label: 'Attendance',
    path: '/attendance',
    icon: 'Clock',
    component: Attendance
  },
  leaves: {
    id: 'leaves',
    label: 'Leaves',
    path: '/leaves',
    icon: 'Calendar',
    component: Leaves
  },
  payroll: {
    id: 'payroll',
    label: 'Payroll',
    path: '/payroll',
    icon: 'CreditCard',
    component: Payroll
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: Reports
  }
};

export const routeArray = Object.values(routes);
export default routes;