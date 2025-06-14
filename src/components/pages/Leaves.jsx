import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import LeaveRequestCard from '@/components/molecules/LeaveRequestCard';
import LeaveRequestForm from '@/components/organisms/LeaveRequestForm';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import StatusBadge from '@/components/atoms/StatusBadge';
import ApperIcon from '@/components/ApperIcon';
import { leaveService, employeeService } from '@/services';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('1'); // Default to first employee

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, statusFilter, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [leavesData, employeesData] = await Promise.all([
        leaveService.getAll(),
        employeeService.getAll()
      ]);

      setLeaves(leavesData);
      setEmployees(employeesData);
    } catch (err) {
      setError(err.message || 'Failed to load leave data');
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    if (statusFilter) {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(leave => leave.leaveType === typeFilter);
    }

    // Sort by application date (newest first)
    filtered.sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

    setFilteredLeaves(filtered);
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveService.approve(leaveId, 'System Admin');
      setLeaves(prev => prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'approved', approvedBy: 'System Admin' }
          : leave
      ));
      toast.success('Leave request approved successfully');
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveService.reject(leaveId, 'System Admin');
      setLeaves(prev => prev.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'rejected', approvedBy: 'System Admin' }
          : leave
      ));
      toast.success('Leave request rejected');
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    await loadData();
    toast.success('Leave request submitted successfully');
  };

  // Get unique statuses and types for filters
  const statuses = [...new Set(leaves.map(l => l.status))];
  const leaveTypes = [...new Set(leaves.map(l => l.leaveType))];

  const statusOptions = statuses.map(status => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1)
  }));

  const typeOptions = leaveTypes.map(type => ({
    value: type,
    label: type
  }));

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employeeCode})`
  }));

  const calculateLeaveStats = () => {
    return {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <SkeletonLoader count={5} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadData}
        title="Failed to load leave data"
      />
    );
  }

  const stats = calculateLeaveStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Manage leave requests and approvals</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          icon={showForm ? "X" : "Plus"}
          variant="primary"
        >
          {showForm ? "Cancel" : "Apply Leave"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ApperIcon name="Calendar" size={20} className="text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <ApperIcon name="Clock" size={20} className="text-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <ApperIcon name="CheckCircle" size={20} className="text-green-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <ApperIcon name="XCircle" size={20} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <LeaveRequestForm
          employeeId={selectedEmployee}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Employee Selection for Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Select
            label="Select Employee (for demo purposes)"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employeeOptions}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Select
            placeholder="All Leave Types"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={typeOptions}
          />
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {(statusFilter || typeFilter) && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredLeaves.length} of {leaves.length} leave requests
            </p>
          </div>
        )}
      </div>

      {/* Leave Requests List */}
      {filteredLeaves.length === 0 ? (
        <EmptyState
          title={statusFilter || typeFilter ? "No requests found" : "No leave requests yet"}
          description={
            statusFilter || typeFilter 
              ? "Try adjusting your filters to see more results"
              : "Submit your first leave request to get started"
          }
          actionLabel="Apply Leave"
          onAction={() => setShowForm(true)}
          icon="Calendar"
        />
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave, index) => {
            const employee = employees.find(e => e.id === leave.employeeId);
            return (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LeaveRequestCard
                  leave={leave}
                  employee={employee}
                  onApprove={handleApproveLeave}
                  onReject={handleRejectLeave}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Leave Balance Summary (Mock Data) */}
      {selectedEmployee && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Leave Balance - {employees.find(e => e.id === selectedEmployee)?.name}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">18</p>
              <p className="text-sm text-gray-600">Annual Leave</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-gray-600">Sick Leave</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">5</p>
              <p className="text-sm text-gray-600">Personal Leave</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-gray-600">Festival Holidays</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Leaves;