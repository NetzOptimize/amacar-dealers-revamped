import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAdminDealerStats } from "@/lib/api";
import { 
  Users, 
  TrendingUp, 
  Award, 
  DollarSign,
  Loader2,
  BarChart3
} from "lucide-react";

const AdminDealerStats = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1,
  });

  const fetchDealerStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
      };

      const response = await getAdminDealerStats(params);

      if (response.success) {
        // Response structure: { success: true, data: { data: [...], total: X, total_pages: Y } }
        const dealersData = response.data?.data || response.data || [];
        setDealers(Array.isArray(dealersData) ? dealersData : []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || response.total || 0,
          total_pages: response.data?.total_pages || response.total_pages || 1,
        }));
      } else {
        throw new Error(response.message || "Failed to fetch dealer statistics");
      }
    } catch (error) {
      console.error("Error fetching dealer stats:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load dealer statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page]);

  useEffect(() => {
    fetchDealerStats();
  }, [fetchDealerStats]);

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (!value) return "0%";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Calculate summary stats
  const summaryStats = dealers.reduce(
    (acc, dealer) => ({
      totalBids: acc.totalBids + (dealer.total_bids || 0),
      totalWins: acc.totalWins + (dealer.winning_bids || 0),
      totalDealers: acc.totalDealers + 1,
      avgWinRate: acc.avgWinRate + (dealer.win_rate || 0),
    }),
    { totalBids: 0, totalWins: 0, totalDealers: 0, avgWinRate: 0 }
  );

  const avgWinRate = dealers.length > 0 ? summaryStats.avgWinRate / dealers.length : 0;

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 md:px-6">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Dealer Statistics
          </h1>
          <p className="text-neutral-600">
            Performance metrics and statistics for all dealers
          </p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dealers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summaryStats.totalDealers}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summaryStats.totalBids}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wins</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {summaryStats.totalWins}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Win Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatPercentage(avgWinRate)}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dealers Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        ) : dealers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No dealer statistics found</p>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-lg shadow-sm overflow-hidden"
            variants={itemVariants}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Bids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions Participated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Winning Bids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Bid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Bid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Bid
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dealers.map((dealer) => (
                    <tr key={dealer.dealer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {dealer.dealer_name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dealer.dealer_email || ""}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ID: {dealer.dealer_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dealer.total_bids || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dealer.sessions_participated || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="flex items-center gap-1">
                          {dealer.winning_bids || 0}
                          {dealer.winning_bids > 0 && (
                            <Award className="h-4 w-4 text-yellow-500" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dealer.win_rate >= 50
                              ? "bg-green-100 text-green-800"
                              : dealer.win_rate >= 25
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {formatPercentage(dealer.win_rate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(dealer.avg_bid_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(dealer.min_bid_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(dealer.max_bid_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.per_page) + 1} to{" "}
                  {Math.min(pagination.page * pagination.per_page, pagination.total)} of{" "}
                  {pagination.total} dealers
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDealerStats;

