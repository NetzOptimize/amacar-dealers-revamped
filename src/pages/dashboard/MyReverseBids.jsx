import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMyReverseBids,
  selectMyReverseBids,
  selectMyReverseBidsLoading,
  selectMyReverseBidsError,
  selectMyReverseBidsPagination,
} from "@/redux/slices/reverseBiddingSlice";
import { Gavel, Loader2, RefreshCw } from "lucide-react";
import Pagination from "@/components/common/Pagination/Pagination";
import ReverseBidsContainer from "@/components/reverse-bidding/ReverseBidsContainer";
import MyReverseBidsSkeleton from "@/components/skeletons/ReverseBidding/MyReverseBidsSkeleton";

const MyReverseBids = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const userRole = user?.role;
  const isAdminOrSalesManager = userRole === 'administrator' || userRole === 'sales_manager';
  const bids = useSelector(selectMyReverseBids);
  const isLoading = useSelector(selectMyReverseBidsLoading);
  const error = useSelector(selectMyReverseBidsError);
  const pagination = useSelector(selectMyReverseBidsPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const itemsPerPage = 20;

  // Fetch my reverse bids on mount and when page/status changes
  useEffect(() => {
    const params = { page: currentPage, per_page: itemsPerPage };
    if (statusFilter) {
      params.status = statusFilter;
    }
    dispatch(fetchMyReverseBids(params));
  }, [dispatch, currentPage, statusFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const params = { page: currentPage, per_page: itemsPerPage };
    if (statusFilter) {
      params.status = statusFilter;
    }
    await dispatch(fetchMyReverseBids(params));
    setIsRefreshing(false);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status === 'all' ? null : status);
    setCurrentPage(1);
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const filterButtonVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  if (isLoading && !bids.length) {
    return <MyReverseBidsSkeleton />;
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 md:px-6">
        {/* Header Section */}
        <motion.div className="mb-8" variants={headerVariants}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Gavel className="w-8 h-8 text-primary-600" />
              </motion.div>
              <motion.h1
                className="text-3xl font-bold text-neutral-900"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {isAdminOrSalesManager ? 'All Reverse Bids' : 'My Reverse Bids'}
              </motion.h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
          <motion.p
            className="text-neutral-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isAdminOrSalesManager 
              ? 'View all reverse bids submitted across different sessions. Track bid status and dealer information.'
              : 'View all reverse bids you have submitted across different sessions. Track your bid status and performance.'}
          </motion.p>
        </motion.div>

        {/* Status Filter */}
        <motion.div 
          className="mb-6 flex flex-wrap gap-3" 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'revised', label: 'Revised' },
            { id: 'withdrawn', label: 'Withdrawn' }
          ].map((filter) => (
            <motion.button
              key={filter.id}
              variants={filterButtonVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusFilterChange(filter.id)}
              className={`
                relative px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 cursor-pointer
                border-2 min-w-[120px] flex items-center justify-center gap-2
                ${!statusFilter && filter.id === 'all'
                  ? 'bg-[var(--brand-orange)] text-white border-[var(--brand-orange)] shadow-lg'
                  : statusFilter === filter.id
                  ? 'bg-[var(--brand-orange)] text-white border-[var(--brand-orange)] shadow-lg'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-orange-200 hover:border-orange-300'
                }
              `}
            >
              {filter.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-red-600 text-center">
              Error loading reverse bids: {error}
            </p>
          </motion.div>
        )}

        {/* Bids Container */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ReverseBidsContainer
              bids={bids}
              currentPage={currentPage}
              totalPages={pagination?.total_pages || 1}
              totalCount={pagination?.total_items || 0}
              pagination={pagination}
              onPageChange={handlePageChange}
              onViewBid={(bid) => {
                if (bid.session_id) {
                  navigate(`/reverse-bidding/session/${bid.session_id}`);
                }
              }}
            />

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={pagination.current_page || currentPage}
                  totalPages={pagination.total_pages || 1}
                  onPageChange={handlePageChange}
                  className="w-full max-w-md"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>

    </motion.div>
  );
};

export default MyReverseBids;

