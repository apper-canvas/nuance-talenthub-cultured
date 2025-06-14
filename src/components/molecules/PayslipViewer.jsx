import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const PayslipViewer = ({ payroll, employee }) => {
  const totalAllowances = Object.values(payroll.allowances || {}).reduce((sum, val) => sum + val, 0);
  const totalDeductions = Object.values(payroll.deductions || {}).reduce((sum, val) => sum + val, 0);

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    console.log('Downloading payslip...');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Payslip - {format(new Date(payroll.month + '-01'), 'MMMM yyyy')}
          </h3>
          <p className="text-sm text-gray-600">{employee?.name}</p>
        </div>
        <Button
          icon="Download"
          variant="ghost"
          onClick={handleDownload}
        >
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Employee Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Employee ID:</span>
              <span className="text-gray-900">{employee?.employeeCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="text-gray-900">{employee?.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Designation:</span>
              <span className="text-gray-900">{employee?.designation}</span>
            </div>
          </div>
        </div>

        {/* Salary Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Salary Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Salary:</span>
              <span className="text-gray-900">₹{payroll.basicSalary.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Allowances:</span>
              <span className="text-green-600">+₹{totalAllowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Deductions:</span>
              <span className="text-red-600">-₹{totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-medium">
              <span className="text-gray-900">Net Pay:</span>
              <span className="text-primary text-lg">₹{payroll.netPay.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Allowances Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Allowances</h4>
          <div className="space-y-2 text-sm">
            {Object.entries(payroll.allowances || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-green-600">₹{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Deductions</h4>
          <div className="space-y-2 text-sm">
            {Object.entries(payroll.deductions || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-red-600">₹{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;