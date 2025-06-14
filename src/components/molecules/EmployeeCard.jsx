import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import StatusBadge from '@/components/atoms/StatusBadge';
import Button from '@/components/atoms/Button';

const EmployeeCard = ({ employee, onView, onEdit }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {employee.name}
              </h3>
              <p className="text-sm text-gray-600">{employee.designation}</p>
              <p className="text-sm text-gray-500">{employee.department}</p>
            </div>
            <StatusBadge status={employee.status} type="employee" />
          </div>
          
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <ApperIcon name="Mail" size={14} className="mr-1" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center">
              <ApperIcon name="Phone" size={14} className="mr-1" />
              <span>{employee.phone}</span>
            </div>
          </div>
          
<div className="mt-3 text-xs text-gray-400">
            Employee ID: {employee.employee_code || employee.employeeCode}
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              icon="Eye"
              onClick={() => onView?.(employee)}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon="Edit"
              onClick={() => onEdit?.(employee)}
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;