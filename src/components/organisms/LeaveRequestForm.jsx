import { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import { leaveService } from '@/services';

const LeaveRequestForm = ({ employeeId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const leaveTypes = [
    { value: 'Annual Leave', label: 'Annual Leave' },
    { value: 'Sick Leave', label: 'Sick Leave' },
    { value: 'Festival Holiday', label: 'Festival Holiday' },
    { value: 'Maternity Leave', label: 'Maternity Leave' },
    { value: 'Paternity Leave', label: 'Paternity Leave' },
    { value: 'Emergency Leave', label: 'Emergency Leave' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await leaveService.create({
        ...formData,
        employeeId
      });
      
      toast.success('Leave request submitted successfully');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Apply for Leave</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Leave Type"
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            options={leaveTypes}
            error={errors.leaveType}
            required
          />
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />
            
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            rows={4}
            value={formData.reason}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent ${
              errors.reason ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="Please provide a reason for your leave request..."
          />
          {errors.reason && (
            <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            Submit Request
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default LeaveRequestForm;