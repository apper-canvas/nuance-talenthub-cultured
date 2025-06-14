import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import StatsGrid from '@/components/organisms/StatsGrid';
import LeaveRequestCard from '@/components/molecules/LeaveRequestCard';
import AttendanceTracker from '@/components/organisms/AttendanceTracker';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import ApperIcon from '@/components/ApperIcon';
import { employeeService, leaveService, attendanceService } from '@/services';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [employeesData, leavesData, attendanceData] = await Promise.all([
        employeeService.getAll(),
        leaveService.getAll(),
        attendanceService.getAll()
      ]);

      setEmployees(employeesData);
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData.filter(a => a.date === today);
      const pendingLeavesData = leavesData.filter(l => l.status === 'pending');
      
      const dashboardStats = [
        {
          id: 'total-employees',
          label: 'Total Employees',
          value: employeesData.length,
          icon: 'Users',
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600'
        },
        {
          id: 'present-today',
          label: 'Present Today',
          value: todayAttendance.filter(a => a.status === 'present').length,
          icon: 'UserCheck',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600'
        },
        {
          id: 'pending-leaves',
          label: 'Pending Leaves',
          value: pendingLeavesData.length,
          icon: 'Calendar',
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        },
        {
          id: 'on-leave',
          label: 'On Leave Today',
          value: todayAttendance.filter(a => a.status === 'absent').length,
          icon: 'UserX',
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600'
        }
      ];

      setStats(dashboardStats);
      setPendingLeaves(pendingLeavesData.slice(0, 5)); // Show only 5 recent
      setRecentAttendance(todayAttendance.slice(0, 10));

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveService.approve(leaveId, 'System Admin');
      setPendingLeaves(prev => prev.filter(l => l.id !== leaveId));
      toast.success('Leave request approved successfully');
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveService.reject(leaveId, 'System Admin');
      setPendingLeaves(prev => prev.filter(l => l.id !== leaveId));
      toast.success('Leave request rejected');
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="stat" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={3} type="card" />
          <SkeletonLoader count={1} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadDashboardData}
        title="Failed to load dashboard"
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-full"
    >
      {/* Header */}
      <div className="gradient-header text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold mb-2">
              Welcome to TalentHub Dashboard
            </h1>
            <p className="text-purple-100">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ApperIcon name="Calendar" size={24} />
            <div className="text-right">
              <p className="text-sm text-purple-100">Today</p>
              <p className="font-semibold">{format(new Date(), 'h:mm a')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Leave Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Leave Requests</h2>
            <ApperIcon name="Clock" size={20} className="text-gray-400" />
          </div>
          
          {pendingLeaves.length === 0 ? (
            <EmptyState
              title="No pending requests"
              description="All leave requests have been processed"
              icon="CheckCircle"
              onAction={null}
            />
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => {
                const employee = employees.find(e => e.id === leave.employeeId);
                return (
                  <LeaveRequestCard
                    key={leave.id}
                    leave={leave}
                    employee={employee}
                    onApprove={handleApproveLeave}
                    onReject={handleRejectLeave}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Today's Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <ApperIcon name="UserPlus" size={20} className="text-primary" />
                <span className="text-sm font-medium text-gray-900">Add New Employee</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <ApperIcon name="Calendar" size={20} className="text-secondary" />
                <span className="text-sm font-medium text-gray-900">View Leave Calendar</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <ApperIcon name="BarChart3" size={20} className="text-accent" />
                <span className="text-sm font-medium text-gray-900">Generate Reports</span>
              </button>
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Holidays</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Holi</p>
                  <p className="text-sm text-gray-600">Festival of Colors</p>
                </div>
                <span className="text-sm font-medium text-orange-600">Mar 8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Good Friday</p>
                  <p className="text-sm text-gray-600">Christian Holiday</p>
                </div>
                <span className="text-sm font-medium text-green-600">Mar 29</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Ram Navami</p>
                  <p className="text-sm text-gray-600">Hindu Festival</p>
                </div>
                <span className="text-sm font-medium text-blue-600">Apr 17</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;