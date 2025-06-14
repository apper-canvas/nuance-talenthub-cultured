import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import StatusBadge from '@/components/atoms/StatusBadge';

const AttendanceCalendar = ({ attendance = [], selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAttendanceForDate = (date) => {
    return attendance.find(record => 
      isSameDay(new Date(record.date), date)
    );
  };

  const getStatusForDate = (date) => {
    const record = getAttendanceForDate(date);
    if (!record) return null;
    return record.status;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ApperIcon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(date => {
          const status = getStatusForDate(date);
          const record = getAttendanceForDate(date);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateSelect?.(date)}
              className={`
                p-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-50
                ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                ${isCurrentDay ? 'bg-blue-50 text-blue-700 font-semibold' : ''}
              `}
            >
              <div className="text-center">
                <div className="mb-1">{format(date, 'd')}</div>
                {status && (
                  <div className="flex justify-center">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'present' ? 'bg-green-500' :
                      status === 'absent' ? 'bg-red-500' :
                      status === 'late' ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h4>
          {(() => {
            const record = getAttendanceForDate(selectedDate);
            if (!record) {
              return <p className="text-sm text-gray-500">No attendance record</p>;
            }
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={record.status} type="attendance" />
                </div>
                {record.checkIn && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Check In:</span>
                    <span className="text-sm text-gray-900">{record.checkIn}</span>
                  </div>
                )}
                {record.checkOut && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Check Out:</span>
                    <span className="text-sm text-gray-900">{record.checkOut}</span>
                  </div>
                )}
                {record.totalHours > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Hours:</span>
                    <span className="text-sm text-gray-900">{record.totalHours}h</span>
                  </div>
                )}
                {record.workMode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Work Mode:</span>
                    <span className="text-sm text-gray-900 capitalize">{record.workMode}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;