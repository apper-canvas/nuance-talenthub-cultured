import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const SearchBar = ({ onSearch, placeholder = "Search...", className = '' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Debounced search
    setTimeout(() => {
      if (value === query) {
        onSearch(value);
      }
    }, 300);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <ApperIcon 
        name="Search" 
        size={16} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
      />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
      />
    </form>
  );
};

export default SearchBar;