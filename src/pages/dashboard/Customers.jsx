import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAllCustomers } from "@/lib/api";
import CustomersContainer from "@/components/customers/CustomersContainer";
import CustomersSkeleton from "@/components/skeletons/Customers/CustomersSkeleton";
import CustomerDetailsModal from "@/components/common/CustomerDetailsModal/CustomerDetailsModal";
import CustomersSort from "@/components/sorts/CustomersSort";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/common/Pagination/Pagination";
import { parseSortValue } from "@/utils/customersSorting";

const Customers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSorting, setIsSorting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('join_date-desc');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
  });
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Fetch customers from API
  const fetchCustomers = async (page = 1, perPage = 10, search = '', sort = 'join_date-desc') => {
    try {
      setIsLoading(true);
      setError(null);

      const { field, direction } = parseSortValue(sort);
      
      const response = await getAllCustomers({
        page,
        per_page: perPage,
        search: search || undefined,
        sort_by: field,
        sort_order: direction
      });

      if (response.success) {
        // Extract data from nested structure: response.data.data
        const customersData = response.data?.data?.data || response.data?.data || response.data || [];
        const paginationData = response.data?.data?.pagination || response.data?.pagination || response.pagination || {};
        const total = response.data?.data?.total || response.data?.total || response.total || 0;
        const totalPages = response.data?.data?.total_pages || response.data?.total_pages || response.total_pages || 1;
        
        setCustomers(customersData);
        setPagination({
          current_page: paginationData.current_page || page,
          per_page: paginationData.per_page || perPage,
          total: total,
          total_pages: totalPages,
          has_next: paginationData.has_next || false,
          has_prev: paginationData.has_prev || false,
        });
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch customers');
      toast.error('Failed to load customers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchCustomers(currentPage, itemsPerPage, debouncedSearch, sortBy);
  }, [currentPage, debouncedSearch, sortBy]);

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

  // Handler functions
  const handleViewCustomer = (customerId, customerName) => {
    // Find the customer data from the current list
    const customerData = customers.find(c => c.id === customerId);
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    setSelectedCustomerData(customerData || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomerId(null);
    setSelectedCustomerName('');
    setSelectedCustomerData(null);
  };

  const handlePageChange = (page) => {
    setTimeout(() => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCustomerUpdated = () => {
    // Refresh the customer list after update
    fetchCustomers(currentPage, itemsPerPage, searchTerm, sortBy);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy !== sortBy) {
      setIsSorting(true);
      setSortBy(newSortBy);
      setCurrentPage(1); // Reset to first page when sorting changes
      
      setTimeout(() => {
        setIsSorting(false);
      }, 300);
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
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
        {/* Header Section */}
        {!isLoading && (
          <motion.div className="mb-6" variants={headerVariants}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900">
                  Customers
                </h1>
                <p className="text-neutral-600 mt-1">
                  Manage and view all customer information
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, city, state..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10 pr-10 border-neutral-300 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <CustomersSort
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  isSorting={isSorting}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Section */}
        <motion.div
          variants={contentVariants}
          key={currentPage}
        >
          {isLoading || isSorting ? (
            <CustomersSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to load customers
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchCustomers(currentPage, itemsPerPage)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <CustomersContainer
              customers={customers}
              currentPage={currentPage}
              totalPages={pagination.total_pages || 1}
              totalCount={Number(pagination.total) || 0}
              onPageChange={handlePageChange}
              onViewCustomer={handleViewCustomer}
              onCustomerUpdated={handleCustomerUpdated}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {!isLoading && !error && pagination.total_pages > 1 && (
          <motion.div
            className="flex justify-center mb-6 pt-6 border-t border-neutral-100"
            variants={contentVariants}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
              className="w-full max-w-md mb-4"
            />
          </motion.div>
        )}

        {/* Customer Details Modal */}
        <CustomerDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          customerId={selectedCustomerId}
          customerName={selectedCustomerName}
          customerData={selectedCustomerData}
        />
      </div>
    </motion.div>
  );
};

export default Customers;

