import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "@/components/common/Pagination/Pagination";
import InventoryContainer from "@/components/inventory/InventoryContainer";
import InventorySort from "@/components/sorts/InventorySort";
import { sortInventory } from "@/utils/inventorySorting";
import InventorySkeleton from "@/components/skeletons/Inventory/InventorySkeleton";
import { getDealerInventory } from "@/lib/api";
import toast from "react-hot-toast";

const Inventory = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date-desc");
  const [isSorting, setIsSorting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

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

  // Fetch inventory from API
  const fetchInventory = async (page = 1, perPage = 20) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getDealerInventory({
        page,
        per_page: perPage
      });

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
    }
  };

  // Fetch data on component mount and when page changes
  useEffect(() => {
    fetchInventory(currentPage, itemsPerPage);
  }, [currentPage]);

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
      vin: vehicle.vin || '',
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || '',
      price: vehicle.price || 0,
      images: vehicle.images || [],
      post_date: vehicle.post_date,
      post_modified: vehicle.post_modified,
      inventory_status: vehicle.inventory_status || 'active',
      new_used: vehicle.new_used || '',
      zip_code: vehicle.zip_code || '',
      city: vehicle.city || '',
      state: vehicle.state || '',
      is_reverse_biddable: vehicle.is_reverse_biddable || '',
      owned_by: vehicle.owned_by || ''
    }));
  }, [vehicles]);

  // Sort vehicles (client-side sorting)
  const sortedVehicles = useMemo(() => {
    return sortInventory(transformedVehicles, sortBy);
  }, [transformedVehicles, sortBy]);

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

  const handleSortChange = (newSortBy) => {
    if (newSortBy !== sortBy) {
      setIsSorting(true);
      setSortBy(newSortBy);
      setCurrentPage(1); // Reset to first page when sorting changes

      // Simulate sorting delay for better UX
      setTimeout(() => {
        setIsSorting(false);
      }, 300);
    }
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
                  My Inventory
                </h1>
                <p className="text-neutral-600 mt-1">
                  View and manage all vehicles in your inventory
                </p>
              </div>
              <div className="flex items-center gap-3">
                <InventorySort
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
          key={currentPage} // Re-animate when page changes
        >
          {isLoading || isSorting ? (
            <InventorySkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to load inventory
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchInventory(currentPage, itemsPerPage)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <InventoryContainer
              vehicles={sortedVehicles}
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              totalCount={pagination.total_items}
              pagination={pagination}
              onPageChange={handlePageChange}
              onViewVehicle={handleViewVehicle}
            />
          )}
        </motion.div>

        {/* Pagination */}
        <AnimatePresence mode="wait">
          {!isLoading && !isSorting && !error && pagination.total_pages > 1 && (
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

