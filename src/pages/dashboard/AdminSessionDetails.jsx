import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  getAdminSessionDetails, 
  getAdminSessionBids,
  closeAdminSession 
} from "@/lib/api";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Mail, 
  Calendar,
  DollarSign,
  Users,
  XCircle,
  Loader2,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

const AdminSessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sessionResponse, bidsResponse] = await Promise.all([
        getAdminSessionDetails(id),
        getAdminSessionBids(id),
      ]);

      if (sessionResponse.success) {
        setSession(sessionResponse.data);
      } else {
        throw new Error(sessionResponse.message || "Failed to fetch session details");
      }

      if (bidsResponse.success) {
        setBids(bidsResponse.data?.bids || []);
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load session details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm("Are you sure you want to close this session?")) {
      return;
    }

    try {
      setClosing(true);
      const response = await closeAdminSession(id);
      
      if (response.success) {
        toast.success("Session closed successfully");
        fetchSessionDetails();
      } else {
        throw new Error(response.message || "Failed to close session");
      }
    } catch (error) {
      console.error("Error closing session:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to close session";
      toast.error(errorMessage);
    } finally {
      setClosing(false);
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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6">
        <div className="px-4 md:px-6">
          <button
            onClick={() => navigate("/admin/sessions")}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Sessions
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || "Session not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  const winningBid = bids.find(bid => bid.id === session.winning_bid_id);

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="px-4 md:px-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/sessions")}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Sessions
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Session #{session.id}
              </h1>
              <p className="text-neutral-600">
                Detailed view of reverse bidding session
              </p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(session.status)}
              {session.status === "running" && (
                <button
                  onClick={handleCloseSession}
                  disabled={closing}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {closing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Close Session
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Session Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-gray-900">{formatDate(session.start_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-gray-900">{formatDate(session.end_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-900">{formatDate(session.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time Remaining</label>
                  <p className="text-gray-900">
                    {session.status === "running" ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTimeRemaining(session.time_remaining)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Customer Info */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h2>
              {session.customer ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{session.customer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {session.customer.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer ID</label>
                    <p className="text-gray-900">#{session.customer.id}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Customer information not available</p>
              )}
            </motion.div>

            {/* Criteria */}
            {session.criteria && (
              <motion.div
                className="bg-white rounded-lg shadow-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Vehicle Criteria
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(session.criteria, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Bids Table */}
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Bids ({bids.length})
                </h2>
              </div>
              {bids.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No bids submitted yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Dealer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Perks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bids.map((bid, index) => (
                        <tr
                          key={bid.id}
                          className={`hover:bg-gray-50 ${
                            bid.id === session.winning_bid_id ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                            {bid.id === session.winning_bid_id && (
                              <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{bid.dealer_name || "N/A"}</div>
                            <div className="text-sm text-gray-500">{bid.dealer_email || ""}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(bid.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {bid.perks && Object.keys(bid.perks).length > 0 ? (
                              <ul className="list-disc list-inside">
                                {Object.entries(bid.perks).map(([key, value]) => (
                                  <li key={key}>
                                    <span className="font-medium">{key}:</span> {value}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              "No perks"
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(bid.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bid.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Bids</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {session.total_bids || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unique Dealers</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {bids.length > 0 ? new Set(bids.map(b => b.dealer_id)).size : 0}
                  </span>
                </div>
                {winningBid && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Winning Bid</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(winningBid.amount)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      by {winningBid.dealer_name}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSessionDetails;

