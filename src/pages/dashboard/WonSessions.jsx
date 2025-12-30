import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWonSessions,
  selectWonSessions,
  selectWonSessionsLoading,
  selectWonSessionsError,
  selectWonSessionsPagination,
} from "@/redux/slices/reverseBiddingSlice";
import LiveSessionsContainer from "@/components/reverse-bidding/LiveSessionsContainer";
import WonSessionsSkeleton from "@/components/skeletons/ReverseBidding/WonSessionsSkeleton";
import { Award, Loader2, RefreshCw } from "lucide-react";
import Pagination from "@/components/common/Pagination/Pagination";

const WonSessions = () => {
  const dispatch = useDispatch();
  const sessions = useSelector(selectWonSessions);
  const isLoading = useSelector(selectWonSessionsLoading);
  const error = useSelector(selectWonSessionsError);
  const pagination = useSelector(selectWonSessionsPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 20;

  // Fetch won sessions on mount and when page changes
  useEffect(() => {
    dispatch(fetchWonSessions({ page: currentPage, per_page: itemsPerPage }));
  }, [dispatch, currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchWonSessions({ page: currentPage, per_page: itemsPerPage }));
    setIsRefreshing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
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

  if (isLoading && !sessions.length) {
    return <WonSessionsSkeleton />;
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
                <Award className="w-8 h-8 text-primary-600" />
              </motion.div>
              <motion.h1
                className="text-3xl font-bold text-neutral-900"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Won Sessions
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
            View all reverse bidding sessions you have won. These are sessions where your bid was accepted by the customer.
          </motion.p>
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
              Error loading won sessions: {error}
            </p>
          </motion.div>
        )}

        {/* Sessions Container */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {sessions.length > 0 ? (
              <>
                <LiveSessionsContainer sessions={sessions} hideMyBids={true} hideTimeLeft={true} isWonSessions={true} />
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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12"
              >
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mb-6"
                  >
                    <Award className="w-12 h-12 text-neutral-400" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-semibold text-neutral-900 mb-2"
                  >
                    No won sessions yet
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-neutral-500 text-center max-w-md"
                  >
                    You haven't won any reverse bidding sessions yet. Keep participating in live sessions to increase your chances of winning!
                  </motion.p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default WonSessions;

