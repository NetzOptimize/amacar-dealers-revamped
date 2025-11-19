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
import { Gavel, Loader2, RefreshCw, Eye, CheckCircle2, Clock, DollarSign, MapPin, Sparkles } from "lucide-react";
import Pagination from "@/components/common/Pagination/Pagination";
import { Badge } from "@/components/ui/badge";
import PerksModal from "@/components/reverse-bidding/PerksModal";
import PhotoSwipeGallery from "@/components/ui/PhotoSwipeGallery";

const MyReverseBids = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bids = useSelector(selectMyReverseBids);
  const isLoading = useSelector(selectMyReverseBidsLoading);
  const error = useSelector(selectMyReverseBidsError);
  const pagination = useSelector(selectMyReverseBidsPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [selectedPerks, setSelectedPerks] = useState(null);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);
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

  // Handle perks modal
  const handleViewPerks = (perks) => {
    setSelectedPerks(perks);
    setIsPerksModalOpen(true);
  };

  const handleClosePerksModal = () => {
    setIsPerksModalOpen(false);
    setSelectedPerks(null);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'revised':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'withdrawn':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-300';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
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
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-neutral-600">Loading your reverse bids...</p>
        </div>
      </div>
    );
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
                My Reverse Bids
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
            View all reverse bids you have submitted across different sessions. Track your bid status and performance.
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
            {bids.length > 0 ? (
              <>
                <div className="space-y-4 mb-8">
                  {bids.map((bid) => {
                    // Get vehicle image - prioritize session image, then product images
                    const vehicleImages = bid.session?.primary_vehicle_image 
                      ? [bid.session.primary_vehicle_image]
                      : bid.product?.images?.map(img => typeof img === 'string' ? img : img.url) || [];
                    
                    const vehicleName = bid.product 
                      ? `${bid.product.year} ${bid.product.make} ${bid.product.model}`
                      : bid.session?.primary_vehicle_name || 'Vehicle';

                    return (
                      <motion.div
                        key={bid.bid_id}
                        variants={cardVariants}
                        whileHover={{ 
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        className="bg-white rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl hover:border-neutral-200 transition-all duration-500 group"
                      >
                        {/* Horizontal Layout */}
                        <div className="flex bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-36">
                          {/* Left Section - Image */}
                          <div className="w-48 xl:w-56 relative rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 group/image rounded-l-xl overflow-hidden flex-shrink-0">
                            {vehicleImages.length > 0 ? (
                              <PhotoSwipeGallery
                                images={vehicleImages}
                                vehicleName={vehicleName}
                                className="w-full h-full rounded-l-xl"
                                imageClassName="w-full h-full object-cover rounded-xl"
                                showOverlay={true}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Gavel className="w-12 h-12 text-neutral-300" />
                              </div>
                            )}
                          </div>

                          {/* Middle Section - Bid Details */}
                          <div className="flex-1 px-4 lg:px-6 xl:px-6 2xl:px-8 py-3 flex flex-col justify-between min-w-0">
                            {/* Header with Bid ID and Status */}
                            <div className="flex items-start justify-between mb-3 gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-orange-500 transition-colors duration-200">
                                    Bid #{bid.bid_id}
                                  </h3>
                                  {bid.is_winning_bid && (
                                    <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Won
                                    </Badge>
                                  )}
                                  <Badge className={`${getStatusBadgeColor(bid.status)} text-xs px-2 py-0.5`}>
                                    {bid.status?.charAt(0).toUpperCase() + bid.status?.slice(1)}
                                  </Badge>
                                </div>
                                {bid.product && (
                                  <p className="text-xs text-neutral-500 font-normal">
                                    {bid.product.year} {bid.product.make} {bid.product.model}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 justify-end items-center flex-shrink-0">
                                {bid.session && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/reverse-bidding/session/${bid.session_id}`)}
                                    className="h-8 px-4 bg-[var(--brand-orange)] hover:bg-[var(--color-primary-600)] text-white font-medium rounded-md text-sm transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Session
                                  </motion.button>
                                )}
                                {bid.product_id && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/vehicle-details/${bid.product_id}`)}
                                    className="h-8 px-4 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium rounded-md text-sm transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Vehicle
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-1 xl:gap-2">
                              {/* Bid Amount */}
                              <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                                <div className="flex items-center mb-1">
                                  <DollarSign className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
                                  <span className="text-xs font-normal text-neutral-500">
                                    Your Offer
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-green-600">
                                  {formatCurrency(bid.amount)}
                                </p>
                              </div>

                              {/* Position */}
                              {bid.position && (
                                <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                                  <div className="flex items-center mb-1">
                                    <Gavel className="w-3 h-3 mr-1 text-neutral-400 flex-shrink-0" />
                                    <span className="text-xs font-normal text-neutral-500">
                                      Position
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold">
                                    #{bid.position}
                                  </p>
                                </div>
                              )}

                              {/* Date */}
                              <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                                <div className="flex items-center mb-1">
                                  <Clock className="w-3 h-3 mr-1 text-neutral-400 flex-shrink-0" />
                                  <span className="text-xs font-normal text-neutral-500">
                                    Date
                                  </span>
                                </div>
                                <p className="text-xs font-semibold">
                                  {formatDate(bid.created_at)}
                                </p>
                              </div>

                              {/* Location */}
                              {bid.session && (bid.session.city || bid.session.state || bid.session.zip_code) && (
                                <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                                  <div className="flex items-center mb-1">
                                    <MapPin className="w-3 h-3 mr-1 text-neutral-400 flex-shrink-0" />
                                    <span className="text-xs font-normal text-neutral-500">
                                      Location
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold">
                                    {bid.session.city && bid.session.state
                                      ? `${bid.session.city}, ${bid.session.state}`
                                      : bid.session.zip_code || 'N/A'}
                                  </p>
                                </div>
                              )}

                              {/* Session Status */}
                              {bid.session && (
                                <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                                  <div className="flex items-center mb-1">
                                    <Clock className="w-3 h-3 mr-1 text-neutral-400 flex-shrink-0" />
                                    <span className="text-xs font-normal text-neutral-500">
                                      Session Status
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold">
                                    {bid.session.status?.charAt(0).toUpperCase() + bid.session.status?.slice(1)}
                                  </p>
                                </div>
                              )}

                              {/* Perks Button */}
                              {bid.perks && Object.keys(bid.perks).length > 0 && (
                                <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleViewPerks(bid.perks)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 hover:border-orange-300 text-orange-700 hover:text-orange-800 transition-all duration-200 group text-xs font-medium"
                                  >
                                    <Sparkles className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                                    <span>View Perks</span>
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

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
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mb-6">
                    <Gavel className="w-12 h-12 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No reverse bids yet
                  </h3>
                  <p className="text-neutral-500 text-center max-w-md">
                    {statusFilter
                      ? `You don't have any ${statusFilter} reverse bids.`
                      : "You haven't submitted any reverse bids yet. Start participating in live sessions to place your bids!"}
                  </p>
                  {statusFilter && (
                    <button
                      onClick={() => handleStatusFilterChange('all')}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      View All Bids
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Perks Modal */}
      <PerksModal
        isOpen={isPerksModalOpen}
        onClose={handleClosePerksModal}
        perks={selectedPerks}
      />
    </motion.div>
  );
};

export default MyReverseBids;

