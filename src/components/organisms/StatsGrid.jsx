import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatsGrid = ({ stats = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <p className={`text-sm flex items-center mt-2 ${
                  stat.change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <ApperIcon 
                    name={stat.change > 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={14} 
                    className="mr-1" 
                  />
                  {Math.abs(stat.change)}%
                </p>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor || 'bg-primary/10'}`}>
              <ApperIcon 
                name={stat.icon} 
                size={24} 
                className={stat.iconColor || 'text-primary'} 
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;