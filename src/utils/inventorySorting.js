// Inventory sorting utilities

/**
 * Sort vehicles by title/name (ascending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByTitleAsc = (vehicles) => {
  return [...vehicles].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
};

/**
 * Sort vehicles by title/name (descending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByTitleDesc = (vehicles) => {
  return [...vehicles].sort((a, b) => (b.title || '').localeCompare(a.title || ''));
};

/**
 * Sort vehicles by date added (ascending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByDateAsc = (vehicles) => {
  return [...vehicles].sort((a, b) => {
    const dateA = new Date(a.post_date || a.created_at);
    const dateB = new Date(b.post_date || b.created_at);
    
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
      return 0;
    }
    if (isNaN(dateA.getTime())) {
      return 1;
    }
    if (isNaN(dateB.getTime())) {
      return -1;
    }
    
    return dateA - dateB;
  });
};

/**
 * Sort vehicles by date added (descending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByDateDesc = (vehicles) => {
  return [...vehicles].sort((a, b) => {
    const dateA = new Date(a.post_date || a.created_at);
    const dateB = new Date(b.post_date || b.created_at);
    
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
      return 0;
    }
    if (isNaN(dateA.getTime())) {
      return 1;
    }
    if (isNaN(dateB.getTime())) {
      return -1;
    }
    
    return dateB - dateA;
  });
};

/**
 * Sort vehicles by price (ascending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByPriceAsc = (vehicles) => {
  return [...vehicles].sort((a, b) => {
    const priceA = parseFloat(a.price || 0);
    const priceB = parseFloat(b.price || 0);
    return priceA - priceB;
  });
};

/**
 * Sort vehicles by price (descending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByPriceDesc = (vehicles) => {
  return [...vehicles].sort((a, b) => {
    const priceA = parseFloat(a.price || 0);
    const priceB = parseFloat(b.price || 0);
    return priceB - priceA;
  });
};

/**
 * Sort vehicles by make (ascending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByMakeAsc = (vehicles) => {
  return [...vehicles].sort((a, b) => (a.make || '').localeCompare(b.make || ''));
};

/**
 * Sort vehicles by make (descending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByMakeDesc = (vehicles) => {
  return [...vehicles].sort((a, b) => (b.make || '').localeCompare(a.make || ''));
};

/**
 * Sort vehicles by model (ascending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByModelAsc = (vehicles) => {
  return [...vehicles].sort((a, b) => (a.model || '').localeCompare(b.model || ''));
};

/**
 * Sort vehicles by model (descending)
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} Sorted vehicles
 */
export const sortByModelDesc = (vehicles) => {
  return [...vehicles].sort((a, b) => (b.model || '').localeCompare(a.model || ''));
};

/**
 * Main sorting function that handles all sort types
 * @param {Array} vehicles - Array of vehicles
 * @param {string} sortBy - Sort type
 * @returns {Array} Sorted vehicles
 */
export const sortInventory = (vehicles, sortBy) => {
  if (!vehicles || vehicles.length === 0) {
    return [];
  }

  switch (sortBy) {
    case 'title-asc':
      return sortByTitleAsc(vehicles);
    case 'title-desc':
      return sortByTitleDesc(vehicles);
    case 'date-asc':
      return sortByDateAsc(vehicles);
    case 'date-desc':
      return sortByDateDesc(vehicles);
    case 'price-asc':
      return sortByPriceAsc(vehicles);
    case 'price-desc':
      return sortByPriceDesc(vehicles);
    case 'make-asc':
      return sortByMakeAsc(vehicles);
    case 'make-desc':
      return sortByMakeDesc(vehicles);
    case 'model-asc':
      return sortByModelAsc(vehicles);
    case 'model-desc':
      return sortByModelDesc(vehicles);
    default:
      return vehicles;
  }
};

/**
 * Get sort field options configuration
 * @returns {Array} Sort field options
 */
export const getSortFieldOptions = () => {
  return [
    { value: 'date', label: 'Date Added', icon: 'Calendar' },
    { value: 'title', label: 'Title', icon: 'Car' },
    { value: 'price', label: 'Price', icon: 'DollarSign' },
    { value: 'make', label: 'Make', icon: 'Car' },
    { value: 'model', label: 'Model', icon: 'Car' },
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

