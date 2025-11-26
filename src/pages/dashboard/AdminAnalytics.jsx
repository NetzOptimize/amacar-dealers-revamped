import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAdminAnalytics, exportAdminData } from "@/lib/api";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Award,
  FileDown,
  Calendar,
  Loader2
} from "lucide-react";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    date_from: "",
    date_to: "",
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(dateRange.date_from && { date_from: dateRange.date_from }),
        ...(dateRange.date_to && { date_to: dateRange.date_to }),
      };

      const response = await getAdminAnalytics(params);

      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch analytics");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load analytics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async (type) => {
    try {
      setExporting(true);
      const blob = await exportAdminData(type, "csv", dateRange);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reverse_bid_${type}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-neutral-600">
                Comprehensive analytics and insights for reverse bidding system
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport("sessions")}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Export Sessions
              </button>
              <button
                onClick={() => handleExport("bids")}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Export Bids
              </button>
            </div>
          </div>
        </motion.div>

        {/* Date Range Filter */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateRange.date_from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, date_from: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateRange.date_to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, date_to: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        ) : !analytics ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No analytics data available</p>
          </div>
        ) : (
          <>
            {/* Sessions Analytics */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 mb-6"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sessions Analytics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {analytics.sessions?.total || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {analytics.sessions?.active || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Closed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics.sessions?.closed || 0}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-600">Cancelled Sessions</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">
                    {analytics.sessions?.cancelled || 0}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-600">Successful Sessions</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {analytics.sessions?.successful || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-600">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {formatPercentage(analytics.sessions?.success_rate || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bids Analytics */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 mb-6"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Bids Analytics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-600">Total Bids</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {analytics.bids?.total || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600">Active Bids</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {analytics.bids?.active || 0}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-600">Avg Bid Amount</p>
                  <p className="text-2xl font-bold text-yellow-900 mt-1">
                    {formatCurrency(analytics.bids?.avg_amount || 0)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-600">Min Bid</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">
                    {formatCurrency(analytics.bids?.min_amount || 0)}
                  </p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-indigo-600">Max Bid</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">
                    {formatCurrency(analytics.bids?.max_amount || 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Certificates Analytics */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 mb-6"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certificates Analytics
              </h2>
              <div className="bg-yellow-50 rounded-lg p-4 inline-block">
                <p className="text-sm font-medium text-yellow-600">Total Certificates</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">
                  {analytics.certificates?.total || 0}
                </p>
              </div>
            </motion.div>

            {/* Period Info */}
            {dateRange.date_from || dateRange.date_to ? (
              <motion.div
                className="bg-gray-50 rounded-lg p-4"
                variants={itemVariants}
              >
                <p className="text-sm text-gray-600">
                  Analytics period:{" "}
                  <span className="font-medium">
                    {dateRange.date_from || "Beginning"} to {dateRange.date_to || "Today"}
                  </span>
                </p>
              </motion.div>
            ) : null}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AdminAnalytics;

