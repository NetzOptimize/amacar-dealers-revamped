// Customers sorting utilities

/**
 * Get sort field options configuration
 * @returns {Array} Sort field options
 */
export const getSortFieldOptions = () => {
  return [
    { value: 'join_date', label: 'Date', icon: 'Calendar' },
    { value: 'name', label: 'Name', icon: 'User' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'city', label: 'City', icon: 'MapPin' },
    { value: 'state', label: 'State', icon: 'MapPin' },
  ];
};

/**
 * Get sort direction options
 * @returns {Object} Sort direction options
 */
export const getSortDirectionOptions = () => {
  return {
    asc: { value: 'asc', label: 'Ascending', icon: 'ArrowUp' },
    desc: { value: 'desc', label: 'Descending', icon: 'ArrowDown' }
  };
};

/**
 * Parse sort configuration from field and direction
 * @param {string} field - Sort field
 * @param {string} direction - Sort direction
 * @returns {string} Combined sort value
 */
export const parseSortConfig = (field, direction) => {
  return `${field}-${direction}`;
};

/**
 * Parse sort value into field and direction
 * @param {string} sortValue - Combined sort value
 * @returns {Object} Parsed field and direction
 */
export const parseSortValue = (sortValue) => {
  const lastDashIndex = sortValue.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return { field: sortValue, direction: 'desc' };
  }
  
  const field = sortValue.substring(0, lastDashIndex);
  const direction = sortValue.substring(lastDashIndex + 1);
  
  return { field, direction };
};

