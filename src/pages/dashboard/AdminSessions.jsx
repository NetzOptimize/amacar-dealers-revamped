import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  getAdminSessions, 
  closeAdminSession 
} from "@/lib/api";
import { 
  Calendar, 
  Filter, 
  Search, 
  Clock, 
  Users, 
  DollarSign,
  Eye,
  XCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import AdminSessionsSkeleton from "@/components/skeletons/ReverseBidding/AdminSessionsSkeleton";

const AdminSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    dealer_id: "",
    date_from: "",
    date_to: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1,
  });
  const [closingSessionId, setClosingSessionId] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...(filters.status && { status: filters.status }),
        ...(filters.dealer_id && { dealer_id: parseInt(filters.dealer_id) }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      };

      const response = await getAdminSessions(params);

      if (response.success) {
        // Response structure: { success: true, data: { data: [...], total: X, total_pages: Y } }
        const sessionsData = response.data?.data || response.data || [];
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || response.total || 0,
          total_pages: response.data?.total_pages || response.total_pages || 1,
        }));
      } else {
        throw new Error(response.message || "Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load sessions";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.per_page, filters]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCloseSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to close this session?")) {
      return;
    }

    try {
      setClosingSessionId(sessionId);
      const response = await closeAdminSession(sessionId);
      
      if (response.success) {
        toast.success("Session closed successfully");
        fetchSessions();
      } else {
        throw new Error(response.message || "Failed to close session");
      }
    } catch (error) {
      console.error("Error closing session:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to close session";
      toast.error(errorMessage);
    } finally {
      setClosingSessionId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      running: { bg: "bg-green-100", text: "text-green-800", label: "Running" },
      closed: { bg: "bg-gray-100", text: "text-gray-800", label: "Closed" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return "N/A";
    if (typeof timeRemaining === "number") {
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return timeRemaining;
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.id?.toString().includes(query) ||
      session.customer?.name?.toLowerCase().includes(query) ||
      session.customer?.email?.toLowerCase().includes(query)
    );
  });

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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Admin Sessions
          </h1>
          <p className="text-neutral-600">
            Manage and monitor all reverse bidding sessions
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by ID, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dealer ID Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dealer ID
            </label>
            <input
              type="number"
              placeholder="Filter by dealer ID"
              value={filters.dealer_id}
              onChange={(e) => handleFilterChange("dealer_id", e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Sessions Table */}
        {loading ? (
          <AdminSessionsSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No sessions found</p>
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
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bids
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dealers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{session.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.customer?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.customer?.email || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.total_bids || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.unique_dealers || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(session.start_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.status === "running" ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTimeRemaining(session.time_remaining)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/sessions/${session.id}`)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          {session.status === "running" && (
                            <button
                              onClick={() => handleCloseSession(session.id)}
                              disabled={closingSessionId === session.id}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                            >
                              {closingSessionId === session.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Close
                            </button>
                          )}
                        </div>
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
                  {pagination.total} sessions
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

export default AdminSessions;

