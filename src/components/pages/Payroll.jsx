import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import PayslipViewer from '@/components/molecules/PayslipViewer';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { payrollService, employeeService } from '@/services';

const Payroll = () => {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth) {
      loadPayslip();
    }
  }, [selectedEmployee, selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [payrollData, employeeData] = await Promise.all([
        payrollService.getAll(),
        employeeService.getAll()
      ]);

      setPayroll(payrollData);
      setEmployees(employeeData);
    } catch (err) {
      setError(err.message || 'Failed to load payroll data');
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const loadPayslip = async () => {
    try {
      const employeePayroll = await payrollService.getByEmployeeId(selectedEmployee);
      const monthPayroll = employeePayroll.find(p => p.month === selectedMonth);
      setSelectedPayslip(monthPayroll || null);
    } catch (error) {
      setSelectedPayslip(null);
    }
  };

  const calculatePayrollSummary = () => {
    const currentMonthPayroll = payroll.filter(p => p.month === selectedMonth);
    
    return {
      totalEmployees: currentMonthPayroll.length,
      totalGrossPay: currentMonthPayroll.reduce((sum, p) => sum + p.basicSalary + Object.values(p.allowances || {}).reduce((a, b) => a + b, 0), 0),
      totalDeductions: currentMonthPayroll.reduce((sum, p) => sum + Object.values(p.deductions || {}).reduce((a, b) => a + b, 0), 0),
      totalNetPay: currentMonthPayroll.reduce((sum, p) => sum + p.netPay, 0),
      processed: currentMonthPayroll.filter(p => p.status === 'processed').length,
      pending: currentMonthPayroll.filter(p => p.status === 'pending').length
    };
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = format(date, 'MMMM yyyy');
      months.push({ value, label });
    }
    
    return months;
  };

  const employeeOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.name} (${emp.employeeCode})`
  }));

  const monthOptions = generateMonthOptions();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader count={4} type="stat" />
        </div>
        <SkeletonLoader count={1} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadData}
        title="Failed to load payroll data"
      />
    );
  }

  const summary = calculatePayrollSummary();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">View and manage employee payslips</p>
        </div>
        <Button
          icon="Download"
          variant="primary"
          onClick={() => toast.info('Bulk payroll export would be implemented here')}
        >
          Export Payroll
        </Button>
      </div>

      {/* Month Selection & Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Select
            label="Select Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            options={monthOptions}
          />
          <Select
            label="Select Employee"
            placeholder="Choose an employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={employeeOptions}
          />
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => setSelectedEmployee('')}
              disabled={!selectedEmployee}
            >
              Clear Selection
            </Button>
          </div>
        </div>

        {/* Payroll Summary for Selected Month */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{summary.totalEmployees}</p>
            <p className="text-sm text-gray-600">Employees</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              ₹{(summary.totalNetPay / 100000).toFixed(1)}L
            </p>
            <p className="text-sm text-gray-600">Net Payroll</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{summary.processed}</p>
            <p className="text-sm text-gray-600">Processed</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Individual Payslip Viewer */}
      {selectedEmployee ? (
        selectedPayslip ? (
          <PayslipViewer
            payroll={selectedPayslip}
            employee={employees.find(e => e.id === selectedEmployee)}
          />
        ) : (
          <EmptyState
            title="No payslip found"
            description={`No payroll record found for ${employees.find(e => e.id === selectedEmployee)?.name} in ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}`}
            icon="CreditCard"
            actionLabel="Generate Payslip"
            onAction={() => toast.info('Payslip generation would be implemented here')}
          />
        )
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ApperIcon name="CreditCard" size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Employee</h3>
          <p className="text-gray-600">Choose an employee from the dropdown above to view their payslip</p>
        </div>
      )}

      {/* Payroll Register Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payroll Register - {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
          </h3>
          <Button
            icon="Table"
            variant="ghost"
            size="sm"
          >
            View Details
          </Button>
        </div>

        {payroll.filter(p => p.month === selectedMonth).length === 0 ? (
          <EmptyState
            title="No payroll data"
            description="No payroll records found for the selected month"
            icon="Table"
            onAction={null}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Basic Salary</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Allowances</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Deductions</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Net Pay</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {payroll
                  .filter(p => p.month === selectedMonth)
                  .map((record) => {
                    const employee = employees.find(e => e.id === record.employeeId);
                    const totalAllowances = Object.values(record.allowances || {}).reduce((sum, val) => sum + val, 0);
                    const totalDeductions = Object.values(record.deductions || {}).reduce((sum, val) => sum + val, 0);
                    
                    return (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{employee?.name}</p>
                            <p className="text-xs text-gray-500">{employee?.employeeCode}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">₹{record.basicSalary.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-green-600">₹{totalAllowances.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-red-600">₹{totalDeductions.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-medium">₹{record.netPay.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === 'processed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Payroll;