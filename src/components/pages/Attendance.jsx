import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import AttendanceCalendar from '@/components/molecules/AttendanceCalendar';
import AttendanceTracker from '@/components/organisms/AttendanceTracker';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import Select from '@/components/atoms/Select';
import StatusBadge from '@/components/atoms/StatusBadge';
import ApperIcon from '@/components/ApperIcon';
import { attendanceService, employeeService } from '@/services';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [attendance, selectedEmployee, currentMonth]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [attendanceData, employeeData] = await Promise.all([
        attendanceService.getAll(),
        employeeService.getAll()
      ]);

      setAttendance(attendanceData);
      setEmployees(employeeData);
    } catch (err) {
      setError(err.message || 'Failed to load attendance data');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    // Filter by selected employee
    if (selectedEmployee) {
      filtered = filtered.filter(record => record.employeeId === selectedEmployee);
    }

    // Filter by current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });

    setFilteredAttendance(filtered);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const calculateMonthStats = () => {
    const stats = {
      totalDays: filteredAttendance.length,
      presentDays: filteredAttendance.filter(r => r.status === 'present').length,
      absentDays: filteredAttendance.filter(r => r.status === 'absent').length,
      lateDays: filteredAttendance.filter(r => r.status === 'late').length,
      totalHours: filteredAttendance.reduce((sum, r) => sum + (r.totalHours || 0), 0)
    };

    stats.attendanceRate = stats.totalDays > 0 ? (stats.presentDays / stats.totalDays * 100).toFixed(1) : 0;
    stats.avgHoursPerDay = stats.presentDays > 0 ? (stats.totalHours / stats.presentDays).toFixed(1) : 0;

    return stats;
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employeeCode})`
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonLoader count={1} type="card" />
          </div>
          <SkeletonLoader count={2} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadData}
        title="Failed to load attendance data"
      />
    );
  }

  const stats = calculateMonthStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Track and manage employee attendance</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ApperIcon name="Calendar" size={16} />
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
        </div>
      </div>

      {/* Employee Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Select Employee"
            placeholder="All Employees"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employeeOptions}
          />
          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => setSelectedEmployee('')}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {/* Quick Check-in for Current User */}
      {selectedEmployee && (
        <AttendanceTracker employeeId={selectedEmployee} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <AttendanceCalendar
            attendance={filteredAttendance}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Statistics and Summary */}
        <div className="space-y-6">
          {/* Monthly Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Statistics
              {selectedEmployee && (
                <span className="block text-sm font-normal text-gray-600 mt-1">
                  {employees.find(e => e.id === selectedEmployee)?.name}
                </span>
              )}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="text-lg font-semibold text-green-600">
                  {stats.attendanceRate}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Present Days</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.presentDays}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Absent Days</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.absentDays}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Hours</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.totalHours.toFixed(1)}h
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Hours/Day</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.avgHoursPerDay}h
                </span>
              </div>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Records</h3>
            
            {filteredAttendance.length === 0 ? (
              <EmptyState
                title="No records found"
                description="No attendance records for the selected period"
                icon="Clock"
                onAction={null}
              />
            ) : (
              <div className="space-y-3">
                {filteredAttendance
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((record) => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    return (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {employee?.name || 'Unknown Employee'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={record.status} type="attendance" />
                          {record.totalHours > 0 && (
                            <span className="text-xs text-gray-500">
                              {record.totalHours}h
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Attendance;