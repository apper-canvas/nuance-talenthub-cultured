import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import { attendanceService } from '@/services';

const AttendanceTracker = ({ employeeId }) => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workMode, setWorkMode] = useState('office');

  useEffect(() => {
    loadTodayRecord();
  }, [employeeId]);

  const loadTodayRecord = async () => {
    try {
      const records = await attendanceService.getByEmployeeId(employeeId);
      const today = new Date().toISOString().split('T')[0];
      const record = records.find(r => r.date === today);
      setTodayRecord(record || null);
    } catch (error) {
      console.error('Failed to load attendance record:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const record = await attendanceService.checkIn(employeeId, workMode);
      setTodayRecord(record);
      toast.success('Checked in successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const record = await attendanceService.checkOut(employeeId);
      setTodayRecord(record);
      toast.success('Checked out successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const workModeOptions = [
    { value: 'office', label: 'Office' },
    { value: 'remote', label: 'Work from Home' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {todayRecord ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ApperIcon name="Clock" size={24} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Check In</p>
              <p className="text-lg font-semibold text-green-600">{todayRecord.checkIn}</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <ApperIcon name="Clock" size={24} className="text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Check Out</p>
              <p className="text-lg font-semibold text-blue-600">
                {todayRecord.checkOut || '--:--'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <ApperIcon name="MapPin" size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">Work Mode:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {todayRecord.workMode}
              </span>
            </div>
            
            {todayRecord.totalHours > 0 && (
              <div className="flex items-center space-x-2">
                <ApperIcon name="Timer" size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">Total:</span>
                <span className="text-sm font-medium text-gray-900">
                  {todayRecord.totalHours}h
                </span>
              </div>
            )}
          </div>

          {!todayRecord.checkOut && (
            <Button
              onClick={handleCheckOut}
              loading={loading}
              disabled={loading}
              variant="accent"
              icon="LogOut"
              className="w-full"
            >
              Check Out
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-8">
            <ApperIcon name="Clock" size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">Ready to start your day?</p>
          </div>

          <Select
            label="Work Mode"
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            options={workModeOptions}
          />

          <Button
            onClick={handleCheckIn}
            loading={loading}
            disabled={loading}
            variant="primary"
            icon="LogIn"
            className="w-full"
          >
            Check In
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceTracker;