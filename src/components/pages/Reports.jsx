import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { employeeService, attendanceService, leaveService, payrollService } from '@/services';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    employees: [],
    attendance: [],
    leaves: [],
    payroll: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [employees, attendance, leaves, payroll] = await Promise.all([
        employeeService.getAll(),
        attendanceService.getAll(),
        leaveService.getAll(),
        payrollService.getAll()
      ]);

      setReportData({ employees, attendance, leaves, payroll });
    } catch (err) {
      setError(err.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceChart = () => {
    const currentDate = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      months.push(subMonths(currentDate, i));
    }

    const data = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthAttendance = reportData.attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      const present = monthAttendance.filter(r => r.status === 'present').length;
      const absent = monthAttendance.filter(r => r.status === 'absent').length;
      const total = monthAttendance.length;

      return {
        month: format(month, 'MMM yyyy'),
        present,
        absent,
        rate: total > 0 ? Math.round((present / total) * 100) : 0
      };
    });

    return {
      options: {
        chart: {
          type: 'line',
          toolbar: { show: false },
          background: 'transparent'
        },
        colors: ['#6B46C1', '#EC4899'],
        stroke: {
          curve: 'smooth',
          width: 3
        },
        xaxis: {
          categories: data.map(d => d.month),
          labels: {
            style: { colors: '#6B7280' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#6B7280' }
          }
        },
        grid: {
          borderColor: '#F3F4F6'
        },
        legend: {
          labels: {
            colors: '#374151'
          }
        }
      },
      series: [
        {
          name: 'Attendance Rate %',
          data: data.map(d => d.rate)
        }
      ]
    };
  };

  const generateDepartmentChart = () => {
    const deptCounts = reportData.employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});

    return {
      options: {
        chart: {
          type: 'donut'
        },
        colors: ['#6B46C1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'],
        labels: Object.keys(deptCounts),
        legend: {
          position: 'bottom',
          labels: {
            colors: '#374151'
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%'
            }
          }
        }
      },
      series: Object.values(deptCounts)
    };
  };

  const generateLeaveChart = () => {
    const leaveTypes = reportData.leaves.reduce((acc, leave) => {
      acc[leave.leaveType] = (acc[leave.leaveType] || 0) + 1;
      return acc;
    }, {});

    return {
      options: {
        chart: {
          type: 'bar',
          toolbar: { show: false }
        },
        colors: ['#6B46C1'],
        xaxis: {
          categories: Object.keys(leaveTypes),
          labels: {
            style: { colors: '#6B7280' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#6B7280' }
          }
        },
        grid: {
          borderColor: '#F3F4F6'
        }
      },
      series: [{
        name: 'Leave Requests',
        data: Object.values(leaveTypes)
      }]
    };
  };

  const generatePayrollChart = () => {
    const monthlyPayroll = reportData.payroll.reduce((acc, record) => {
      const month = format(new Date(record.month + '-01'), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += record.netPay;
      acc[month].count += 1;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyPayroll).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    return {
      options: {
        chart: {
          type: 'area',
          toolbar: { show: false }
        },
        colors: ['#10B981'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
          }
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        xaxis: {
          categories: sortedMonths,
          labels: {
            style: { colors: '#6B7280' }
          }
        },
        yaxis: {
          labels: {
            style: { colors: '#6B7280' },
            formatter: (val) => `₹${(val / 100000).toFixed(1)}L`
          }
        },
        grid: {
          borderColor: '#F3F4F6'
        }
      },
      series: [{
        name: 'Total Payroll',
        data: sortedMonths.map(month => monthlyPayroll[month].total)
      }]
    };
  };

  const periodOptions = [
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last 1 Year' }
  ];

  const reportOptions = [
    { value: 'overview', label: 'Overview Dashboard' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'leaves', label: 'Leave Analysis' },
    { value: 'payroll', label: 'Payroll Summary' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader count={4} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadReportData}
        title="Failed to load report data"
      />
    );
  }

  const attendanceChart = generateAttendanceChart();
  const departmentChart = generateDepartmentChart();
  const leaveChart = generateLeaveChart();
  const payrollChart = generatePayrollChart();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Insights into your organization's HR metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button
            icon="Download"
            variant="ghost"
            onClick={() => toast.info('Export functionality would be implemented here')}
          >
            Export
          </Button>
          <Button
            icon="Share"
            variant="primary"
            onClick={() => toast.info('Share functionality would be implemented here')}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            options={reportOptions}
          />
          <Select
            label="Time Period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
          <div className="flex items-end">
            <Button
              variant="ghost"
              icon="RefreshCw"
              onClick={loadReportData}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.employees.length}</p>
            </div>
            <ApperIcon name="Users" size={24} className="text-primary" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-green-600">94.2%</p>
            </div>
            <ApperIcon name="UserCheck" size={24} className="text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leave Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{reportData.leaves.length}</p>
            </div>
            <ApperIcon name="Calendar" size={24} className="text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Payroll</p>
              <p className="text-2xl font-bold text-blue-600">₹4.2L</p>
            </div>
            <ApperIcon name="CreditCard" size={24} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <Chart
            options={attendanceChart.options}
            series={attendanceChart.series}
            type="line"
            height={300}
          />
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
          <Chart
            options={departmentChart.options}
            series={departmentChart.series}
            type="donut"
            height={300}
          />
        </div>

        {/* Leave Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Type Analysis</h3>
          <Chart
            options={leaveChart.options}
            series={leaveChart.series}
            type="bar"
            height={300}
          />
        </div>

        {/* Payroll Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Trend</h3>
          <Chart
            options={payrollChart.options}
            series={payrollChart.series}
            type="area"
            height={300}
          />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers (Attendance)</h3>
          <div className="space-y-3">
            {reportData.employees.slice(0, 5).map((employee, index) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-600">{employee.department}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">98.5%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <ApperIcon name="UserCheck" size={16} className="text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New employee onboarded</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <ApperIcon name="Check" size={16} className="text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Leave request approved</p>
                <p className="text-xs text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <ApperIcon name="CreditCard" size={16} className="text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payroll processed</p>
                <p className="text-xs text-gray-600">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Reports;