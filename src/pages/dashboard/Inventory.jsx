import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import Pagination from "@/components/common/Pagination/Pagination";
import InventoryContainer from "@/components/inventory/InventoryContainer";
import InventorySkeleton from "@/components/skeletons/Inventory/InventorySkeleton";
import { getDealerInventory } from "@/lib/api";
import toast from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Inventory = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    new_used: '',
    certified: '',
    body_type: '',
    price_min: '',
    price_max: '',
    mileage_min: '',
    mileage_max: '',
    days_on_market_min: '',
    days_on_market_max: '',
    in_reverse_bidding: null
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  const [error, setError] = useState(null);
  const itemsPerPage = 20;

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch inventory from API
  const fetchInventory = async (page = 1, perPage = 20, search = '', filterParams = {}) => {
    try {
      // Only set initial loading on first mount
      if (isLoading && vehicles.length === 0) {
        setIsLoading(true);
      }
      setIsContentLoading(true);
      setIsSearching(!!search);
      setError(null);
      
      const params = {
        page,
        per_page: perPage
      };
      
      if (search && search.trim() !== '') {
        params.search = search.trim();
      }
      
      // Add filter parameters
      Object.keys(filterParams).forEach(key => {
        const value = filterParams[key];
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
      
      const response = await getDealerInventory(params);

      if (response.success) {
        setVehicles(response.data.data || []);
        setPagination(response.data.pagination || {
          current_page: page,
          per_page: perPage,
          total_items: 0,
          total_pages: 0,
          has_next: false,
          has_prev: false
        });
      } else {
        throw new Error('Failed to fetch inventory');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.message || 'Failed to fetch inventory');
      toast.error('Failed to load inventory. Please try again.');
    } finally {
      setIsLoading(false);
      setIsContentLoading(false);
      setIsSearching(false);
    }
  };

  // Separate state for applied filters (what's actually sent to API)
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    new_used: '',
    certified: '',
    body_type: '',
    price_min: '',
    price_max: '',
    mileage_min: '',
    mileage_max: '',
    days_on_market_min: '',
    days_on_market_max: '',
    in_reverse_bidding: null
  });
  
  // Serialized filters for dependency comparison
  const appliedFiltersString = JSON.stringify(appliedFilters);

  // Fetch data on component mount and when page, search, or applied filters change
  useEffect(() => {
    fetchInventory(currentPage, itemsPerPage, debouncedSearchQuery, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearchQuery, appliedFiltersString]);
  
  // Handle filter changes (only updates local state, doesn't apply)
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply filters (copy current filters to appliedFilters)
  const applyFilters = () => {
    // Create a new object reference to ensure React detects the change
    setAppliedFilters({ ...filters });
    setCurrentPage(1); // Reset to first page when filters are applied
  };
  
  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      status: '',
      new_used: '',
      certified: '',
      body_type: '',
      price_min: '',
      price_max: '',
      mileage_min: '',
      mileage_max: '',
      days_on_market_min: '',
      days_on_market_max: '',
      in_reverse_bidding: null
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };
  
  // Count active filters (from applied filters)
  const activeFiltersCount = useMemo(() => {
    return Object.values(appliedFilters).filter(v => v !== '' && v !== null && v !== undefined).length;
  }, [appliedFilters]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const headerVariants = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
    },
  };

  const paginationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Transform API data to match component expectations
  const transformedVehicles = useMemo(() => {
    return vehicles.map(vehicle => ({
      id: vehicle.id,
      title: vehicle.title,
      photo: vehicle.photo,
      vin: vehicle.vin || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      trim: vehicle.trim || '',
      mileage: vehicle.mileage || 0,
      stock_number: vehicle.stock_number || '',
      msrp: vehicle.msrp || null,
      price: vehicle.price || 0,
      status: vehicle.status || vehicle.inventory_status || 'active',
      days_in_inventory: vehicle.days_in_inventory || 0,
      in_reverse_bidding: vehicle.in_reverse_bidding || false,
      active_bids_count: vehicle.active_bids_count || 0,
      certified: vehicle.certified || 'no',
      body_type: vehicle.body_type || '',
      images: vehicle.images || [],
      post_date: vehicle.post_date,
      post_modified: vehicle.post_modified,
      inventory_status: vehicle.status || vehicle.inventory_status || 'active',
      new_used: vehicle.new_used || '',
      zip_code: vehicle.zip_code || '',
      city: vehicle.city || '',
      state: vehicle.state || '',
      is_reverse_biddable: vehicle.is_reverse_biddable || '',
      owned_by: vehicle.owned_by || '',
      dealer_info: vehicle.dealer_info || null, // Include dealer_info for admin/sales_manager
      incentives: vehicle.incentives || null,
      perks: vehicle.perks || []
    }));
  }, [vehicles]);


  // Handler functions
  const handleViewVehicle = (vehicleId) => {
    console.log("View vehicle:", vehicleId);
    navigate(`/vehicle-details/${vehicleId}`, {state: {productId: vehicleId}});
  };

  const handlePageChange = (page) => {
    // Add a small delay for smooth transition
    setTimeout(() => {
      setCurrentPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };


  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-8xl px-4 md:px-6">
        {/* Header Section - Always visible */}
        <motion.div 
          className="mb-6" 
          variants={headerVariants}
          initial={isLoading ? "initial" : false}
          animate="animate"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  My Inventory
                </h1>
                <p className="text-neutral-600 mt-1">
                  View and manage all vehicles in your inventory
                </p>
              </div>
            </div>
            
            {/* Search Bar and Filters */}
            <div className="w-full space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle, price, year, condition, location, or status..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md"
                />
                {searchQuery && !isContentLoading && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-neutral-100 rounded-full transition-colors duration-200"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                  </button>
                )}
                {isContentLoading && searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* Filter Toggle Button */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!showFilters) {
                      // When opening filters, sync local filters with applied filters
                      setFilters(appliedFilters);
                    }
                    setShowFilters(!showFilters);
                  }}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-sm text-neutral-600 hover:text-neutral-900"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Status</Label>
                        <select
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10"
                        >
                          <option value="">All Status</option>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="inactive">Inactive</option>
                          <option value="accepted_offer">Accepted Offer</option>
                        </select>
                      </div>
                      
                      {/* New/Used Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Condition</Label>
                        <select
                          value={filters.new_used}
                          onChange={(e) => handleFilterChange('new_used', e.target.value)}
                          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10"
                        >
                          <option value="">All Conditions</option>
                          <option value="N">New</option>
                          <option value="U">Used</option>
                        </select>
                      </div>
                      
                      {/* Certified Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Certified</Label>
                        <select
                          value={filters.certified}
                          onChange={(e) => handleFilterChange('certified', e.target.value)}
                          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10"
                        >
                          <option value="">All</option>
                          <option value="yes">Certified</option>
                          <option value="no">Non-Certified</option>
                        </select>
                      </div>
                      
                      {/* Body Type Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Body Type</Label>
                        <Input
                          type="text"
                          placeholder="SUV, Sedan, etc."
                          value={filters.body_type}
                          onChange={(e) => handleFilterChange('body_type', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      {/* Price Range */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Min Price</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.price_min}
                          onChange={(e) => handleFilterChange('price_min', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Max Price</Label>
                        <Input
                          type="number"
                          placeholder="999999"
                          value={filters.price_max}
                          onChange={(e) => handleFilterChange('price_max', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      {/* Mileage Range */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Min Mileage</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.mileage_min}
                          onChange={(e) => handleFilterChange('mileage_min', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Max Mileage</Label>
                        <Input
                          type="number"
                          placeholder="999999"
                          value={filters.mileage_max}
                          onChange={(e) => handleFilterChange('mileage_max', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      {/* Days on Market Range */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Min Days</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.days_on_market_min}
                          onChange={(e) => handleFilterChange('days_on_market_min', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Max Days</Label>
                        <Input
                          type="number"
                          placeholder="999"
                          value={filters.days_on_market_max}
                          onChange={(e) => handleFilterChange('days_on_market_max', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      
                      {/* In Reverse Bidding Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-neutral-700">Reverse Bidding</Label>
                        <select
                          value={filters.in_reverse_bidding === null ? '' : filters.in_reverse_bidding.toString()}
                          onChange={(e) => handleFilterChange('in_reverse_bidding', e.target.value === '' ? null : e.target.value === 'true')}
                          className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw2IDZMMTEgMSIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px_8px] bg-[right_12px_center] bg-no-repeat pr-10"
                        >
                          <option value="">All</option>
                          <option value="true">In Reverse Bidding</option>
                          <option value="false">Not in Reverse Bidding</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Apply Filter Button */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Reset filters to applied filters when canceling
                          setFilters(appliedFilters);
                          setShowFilters(false);
                        }}
                        className="px-4"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          applyFilters();
                          setShowFilters(false);
                        }}
                        className="px-6 bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          variants={contentVariants}
          key={currentPage} // Only re-animate when page changes, not on search
        >
          {isContentLoading ? (
            <InventorySkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to load inventory
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchInventory(currentPage, itemsPerPage, debouncedSearchQuery)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <InventoryContainer
              vehicles={transformedVehicles}
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              totalCount={pagination.total_items}
              pagination={pagination}
              searchQuery={searchQuery}
              onPageChange={handlePageChange}
              onViewVehicle={handleViewVehicle}
            />
          )}
        </motion.div>

        {/* Pagination */}
        <AnimatePresence mode="wait">
          {!isContentLoading && !error && pagination.total_pages > 1 && (
            <motion.div
              className="flex justify-center pt-6 border-t border-neutral-100"
              variants={paginationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
                className="w-full max-w-md mb-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Inventory;

