import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import StatusBadge from '@/components/atoms/StatusBadge';
import Button from '@/components/atoms/Button';

const LeaveRequestCard = ({ leave, employee, onApprove, onReject }) => {
  const duration = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
            {employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{employee?.name || 'Unknown Employee'}</h3>
            <p className="text-sm text-gray-600">{employee?.designation || 'N/A'}</p>
          </div>
        </div>
        <StatusBadge status={leave.status} type="leave" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Leave Type:</span>
          <span className="text-sm text-gray-900">{leave.leaveType}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Duration:</span>
          <span className="text-sm text-gray-900">
            {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
            <span className="text-gray-500 ml-1">({duration} day{duration > 1 ? 's' : ''})</span>
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Applied On:</span>
          <span className="text-sm text-gray-900">
            {format(new Date(leave.appliedOn), 'MMM dd, yyyy')}
          </span>
        </div>
        
        {leave.reason && (
          <div>
            <span className="text-sm font-medium text-gray-700">Reason:</span>
            <p className="text-sm text-gray-900 mt-1">{leave.reason}</p>
          </div>
        )}
        
        {leave.approvedBy && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Approved By:</span>
            <span className="text-sm text-gray-900">{leave.approvedBy}</span>
          </div>
        )}
      </div>

      {leave.status === 'pending' && (
        <div className="mt-6 flex space-x-3">
          <Button
            size="sm"
            variant="primary"
            icon="Check"
            onClick={() => onApprove?.(leave.id)}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon="X"
            onClick={() => onReject?.(leave.id)}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default LeaveRequestCard;