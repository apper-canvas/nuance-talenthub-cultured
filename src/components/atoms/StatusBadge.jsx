const StatusBadge = ({ status, type = 'default' }) => {
  const getStatusStyles = () => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    if (type === 'leave') {
      switch (status) {
        case 'approved':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'rejected':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'pending':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }

    if (type === 'attendance') {
      switch (status) {
        case 'present':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'absent':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'late':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case 'half-day':
          return `${baseClasses} bg-blue-100 text-blue-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }

    if (type === 'employee') {
      switch (status) {
        case 'active':
          return `${baseClasses} bg-green-100 text-green-800`;
        case 'inactive':
          return `${baseClasses} bg-red-100 text-red-800`;
        case 'on-leave':
          return `${baseClasses} bg-yellow-100 text-yellow-800`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`;
      }
    }

    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  return (
    <span className={getStatusStyles()}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;