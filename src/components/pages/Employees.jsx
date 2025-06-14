import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '@/components/molecules/SearchBar';
import EmployeeCard from '@/components/molecules/EmployeeCard';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { employeeService } from '@/services';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleViewEmployee = (employee) => {
    // In a real app, this would navigate to employee detail page
    toast.info(`Viewing details for ${employee.name}`);
  };

  const handleEditEmployee = (employee) => {
    // In a real app, this would open edit modal or navigate to edit page
    toast.info(`Editing ${employee.name}`);
  };

  const handleAddEmployee = () => {
    // In a real app, this would open add employee modal or form
    toast.info('Add employee form would open here');
  };

  // Get unique departments and statuses for filters
  const departments = [...new Set(employees.map(emp => emp.department))];
  const statuses = [...new Set(employees.map(emp => emp.status))];

  const departmentOptions = departments.map(dept => ({ value: dept, label: dept }));
  const statusOptions = statuses.map(status => ({ 
    value: status, 
    label: status.charAt(0).toUpperCase() + status.slice(1) 
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={6} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadEmployees}
        title="Failed to load employees"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <Button
          onClick={handleAddEmployee}
          icon="UserPlus"
          variant="primary"
        >
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search employees..."
              className="w-full"
            />
          </div>
          <Select
            placeholder="All Departments"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={departmentOptions}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>

        {(searchQuery || departmentFilter || statusFilter) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('');
                setStatusFilter('');
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          title={searchQuery || departmentFilter || statusFilter ? "No employees found" : "No employees yet"}
          description={
            searchQuery || departmentFilter || statusFilter 
              ? "Try adjusting your search criteria or filters"
              : "Get started by adding your first employee"
          }
          actionLabel="Add Employee"
          onAction={handleAddEmployee}
          icon="Users"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EmployeeCard
                employee={employee}
                onView={handleViewEmployee}
                onEdit={handleEditEmployee}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {employees.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
              <p className="text-sm text-gray-600">Total Employees</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(e => e.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{departments.length}</p>
              <p className="text-sm text-gray-600">Departments</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {employees.filter(e => e.department === 'Engineering').length}
              </p>
              <p className="text-sm text-gray-600">Engineering</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Employees;