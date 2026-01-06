import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import DealershipContainer from "@/components/dealership/DealershipContainer";
import DealershipSkeleton from "@/components/skeletons/Dealership/DealershipSkeleton";
import Pagination from "@/components/common/Pagination/Pagination";
import InviteDealershipsModal from "@/components/ui/InviteDealershipsModal";
import ResendAndCancelInvitationModal from "@/components/ui/ResendAndCancelInvitationModal";
import { Building2, UserPlus, Mail, Clock, CheckCircle, XCircle, UserCheck, UserX } from "lucide-react";
import { getInvitations, resendInvitation, cancelInvitation, getPendingApprovals, approveDealer, rejectDealer } from "@/lib/api";
import { useSelector } from "react-redux";

const InvitedDealerships = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('invitations'); // 'invitations' or 'pending'
  
  // Invitations state
  const [invitations, setInvitations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Pending approvals state
  const [pendingDealers, setPendingDealers] = useState([]);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotalCount, setPendingTotalCount] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);
  const [pendingPagination, setPendingPagination] = useState({});
  
  // Confirmation modal state
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null); // 'resend', 'cancel', 'approve', or 'reject'
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [selectedPendingDealer, setSelectedPendingDealer] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { user } = useSelector((state) => state.user);

  const itemsPerPage = 20;
  const maxRetries = 3;

  // Error handling utility
  const handleApiError = useCallback((error) => {
    console.error("API Error:", error);

    let errorMessage = "An unexpected error occurred";
    let errorType = "error";

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 403:
          errorMessage =
            data?.message || "You don't have permission to view invitations";
          errorType = "permission";
          break;
        case 401:
          errorMessage = "Please log in to view invitations";
          errorType = "auth";
          break;
        case 404:
          errorMessage = "Invitations endpoint not found";
          errorType = "notFound";
          break;
        case 500:
          errorMessage = "Server error. Please try again later";
          errorType = "server";
          break;
        case 429:
          errorMessage =
            "Too many requests. Please wait a moment and try again";
          errorType = "rateLimit";
          break;
        default:
          errorMessage =
            data?.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      errorMessage = "Network error. Please check your connection";
      errorType = "network";
    } else {
      errorMessage = error.message || "An unexpected error occurred";
    }

    return { message: errorMessage, type: errorType };
  }, []);

  // Transform API data to match component expectations
  const transformInvitationData = (apiData) => {
    return apiData.map((item) => {
      const fullName = `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A';
      const isExpired = new Date(item.expires_at) < new Date();
      
      return {
        id: item.id,
        name: item.dealership_name || 'N/A',
        email: item.email || "N/A",
        firstName: item.first_name || 'N/A',
        lastName: item.last_name || 'N/A',
        phone: "N/A", // Not provided in API
        city: "N/A", // Not provided in API
        state: "N/A", // Not provided in API
        zip: "N/A", // Not provided in API
        street: "N/A", // Not provided in API
        status: isExpired ? "Expired" : (item.status === "pending" ? "Pending" : item.status === "accepted" ? "Accepted" : item.status === "cancelled" ? "Cancelled": "Unknown"),
        role: "Invited Dealer",
        salesManager: fullName,
        joinDate: item.created_at,
        address: "Address not provided", // Not provided in API
        totalSales: 0, // Not applicable for invitations
        vehiclesInStock: 0, // Not applicable for invitations
        rating: 0, // Not applicable for invitations
        latitude: null,
        longitude: null,
        userId: item.sales_manager_id || null,
        updatedAt: item.created_at,
        // Additional invitation-specific fields
        dealerCode: item.dealer_code || 'N/A',
        expiresAt: item.expires_at,
        acceptedAt: item.accepted_at,
        isExpired: isExpired,
        invitationId: item.id,
        token: item.token // Add token field for API calls
      };
    });
  };

  // Retry function with exponential backoff
  const retryWithBackoff = useCallback(async (fn, retries = maxRetries) => {
    try {
      return await fn();
    } catch (error) {
      if (
        retries > 0 &&
        (error.response?.status >= 500 || error.code === "NETWORK_ERROR")
      ) {
        const delay = Math.pow(2, maxRetries - retries) * 1000; // Exponential backoff
        console.log(
          `Retrying in ${delay}ms... (${
            maxRetries - retries + 1
          }/${maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, [maxRetries]);

  // Fetch invitations data from API
  const fetchInvitations = useCallback(async (page = 1, perPage = 20, isRetry = false) => {
    try {
      setLoading(true);
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }

      const response = await retryWithBackoff(() =>
        getInvitations(page, perPage)
      );

      if (response.success) {
        const transformedData = transformInvitationData(response.data);
        setInvitations(transformedData);
        setPagination(response.pagination);
        setTotalPages(response.pagination.total_pages || 1);
        setTotalCount(parseInt(response.pagination.total) || 0);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.message || "Failed to fetch invitations");
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo);

      // Show appropriate toast based on error type
      const toastMessages = {
        permission:
          "Access denied. You don't have permission to view invitations.",
        auth: "Please log in to continue.",
        network: "Network error. Please check your connection.",
        rateLimit: "Too many requests. Please wait a moment and try again.",
        server: "Server error. Please try again later.",
        notFound: "Invitations endpoint not found.",
        error: "Failed to load invitations. Please try again.",
      };

      toast.error(toastMessages[errorInfo.type] || toastMessages.error);
    } finally {
      setLoading(false);
    }
  }, [retryWithBackoff, handleApiError]);

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  // Transform pending dealer data to match component expectations
  const transformPendingDealerData = (apiData) => {
    return apiData.map((item) => {
      // Format dealer position (replace hyphens with spaces and capitalize)
      const formatDealerPosition = (position) => {
        if (!position || position === 'N/A') return 'N/A';
        return position
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      // Format dealer group (capitalize first letter)
      const formatDealerGroup = (group) => {
        if (!group || group === 'N/A') return 'N/A';
        return group.charAt(0).toUpperCase() + group.slice(1);
      };

      return {
        id: item.id,
        name: item.dealership_name || 'N/A',
        email: item.email || "N/A",
        firstName: item.first_name || 'N/A',
        lastName: item.last_name || 'N/A',
        fullName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A',
        phone: item.phone || "N/A",
        city: item.city || "N/A",
        state: item.state || "N/A",
        zip: item.zip || "N/A",
        street: "N/A",
        status: "Pending Approval",
        role: "Dealer",
        salesManager: "N/A",
        joinDate: item.registration_date,
        registrationDate: item.registration_date,
        registrationDateFormatted: item.registration_date_formatted || item.registration_date,
        address: [
          item.city,
          item.state,
          item.zip,
        ]
          .filter(Boolean)
          .join(", ") || "Address not provided",
        totalSales: 0,
        vehiclesInStock: 0,
        rating: 0,
        latitude: null,
        longitude: null,
        userId: item.user_id,
        updatedAt: item.registration_date,
        dealerCode: item.dealer_code || 'N/A',
        dealerPosition: formatDealerPosition(item.dealer_position),
        dealerGroup: formatDealerGroup(item.dealer_group),
      };
    });
  };

  // Fetch pending approvals data from API
  const fetchPendingApprovals = useCallback(async (page = 1, perPage = 20, isRetry = false) => {
    try {
      setPendingLoading(true);
      if (!isRetry) {
        setPendingError(null);
      }

      const response = await retryWithBackoff(() =>
        getPendingApprovals(page, perPage)
      );

      if (response.success) {
        const transformedData = transformPendingDealerData(response.data);
        setPendingDealers(transformedData);
        setPendingPagination(response.pagination);
        setPendingTotalPages(response.pagination.total_pages || 1);
        setPendingTotalCount(parseInt(response.pagination.total) || 0);
      } else {
        throw new Error(response.message || "Failed to fetch pending approvals");
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      setPendingError(errorInfo);
      toast.error(errorInfo.message || "Failed to load pending approvals. Please try again.");
    } finally {
      setPendingLoading(false);
    }
  }, [retryWithBackoff, handleApiError]);

  // Handle approve dealer
  const handleApproveDealer = (dealerId) => {
    const dealer = pendingDealers.find(d => d.id === dealerId || d.userId === dealerId);
    if (dealer) {
      setSelectedPendingDealer(dealer);
      setConfirmationAction('approve');
      setIsConfirmationModalOpen(true);
    }
  };

  // Handle reject dealer
  const handleRejectDealer = (dealerId) => {
    const dealer = pendingDealers.find(d => d.id === dealerId || d.userId === dealerId);
    if (dealer) {
      setSelectedPendingDealer(dealer);
      setConfirmationAction('reject');
      setIsConfirmationModalOpen(true);
    }
  };

  // Load invitations data on component mount and when page changes
  useEffect(() => {
    if (activeTab === 'invitations') {
      fetchInvitations(currentPage, itemsPerPage);
    }
  }, [currentPage, fetchInvitations, activeTab]);

  // Load pending approvals data on component mount and when page changes
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingApprovals(pendingCurrentPage, itemsPerPage);
    }
  }, [pendingCurrentPage, fetchPendingApprovals, activeTab]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle invitation actions
  const handleViewInvitation = (invitationId) => {
    console.log("View invitation:", invitationId);
    // Navigate to invitation details page
  };

  const handleResendInvitation = (invitationId) => {
    const invitation = invitations.find(inv => inv.invitationId === invitationId);
    if (invitation) {
      setSelectedInvitation(invitation);
      setConfirmationAction('resend');
      setIsConfirmationModalOpen(true);
    }
  };

  const handleCancelInvitation = (invitationId) => {
    const invitation = invitations.find(inv => inv.invitationId === invitationId);
    if (invitation) {
      setSelectedInvitation(invitation);
      setConfirmationAction('cancel');
      setIsConfirmationModalOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmationAction) return;

    setIsActionLoading(true);
    try {
      let response;
      if (confirmationAction === 'resend') {
        if (!selectedInvitation) return;
        response = await resendInvitation(selectedInvitation.token);
        if (response.success) {
          toast.success('Invitation resent successfully!');
          fetchInvitations(currentPage, itemsPerPage);
        }
      } else if (confirmationAction === 'cancel') {
        if (!selectedInvitation) return;
        response = await cancelInvitation(selectedInvitation.token);
        if (response.success) {
          toast.success('Invitation canceled successfully!');
          fetchInvitations(currentPage, itemsPerPage);
        }
      } else if (confirmationAction === 'approve') {
        if (!selectedPendingDealer) return;
        const userId = selectedPendingDealer.userId || selectedPendingDealer.id;
        response = await approveDealer(userId);
        if (response.success) {
          toast.success('Dealer approved successfully!');
          fetchPendingApprovals(pendingCurrentPage, itemsPerPage);
        }
      } else if (confirmationAction === 'reject') {
        if (!selectedPendingDealer) return;
        const userId = selectedPendingDealer.userId || selectedPendingDealer.id;
        response = await rejectDealer(userId);
        if (response.success) {
          toast.success('Dealer rejected successfully!');
          fetchPendingApprovals(pendingCurrentPage, itemsPerPage);
        }
      }

      if (response && !response.success) {
        const actionText = confirmationAction === 'resend' ? 'resend' : 
                          confirmationAction === 'cancel' ? 'cancel' :
                          confirmationAction === 'approve' ? 'approve' : 'reject';
        toast.error(response.message || `Failed to ${actionText}. Please try again.`);
      } else if (response && response.success) {
        handleCloseConfirmationModal();
      }
    } catch (error) {
      console.error(`Error ${confirmationAction}ing:`, error);
      const actionText = confirmationAction === 'resend' ? 'resend' : 
                        confirmationAction === 'cancel' ? 'cancel' :
                        confirmationAction === 'approve' ? 'approve' : 'reject';
      toast.error(`Failed to ${actionText}. Please try again.`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
    setConfirmationAction(null);
    setSelectedInvitation(null);
    setSelectedPendingDealer(null);
    setIsActionLoading(false);
  };

  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  // Handle page change for pending approvals
  const handlePendingPageChange = (page) => {
    setPendingCurrentPage(page);
  };

  if (loading && activeTab === 'invitations') {
    return (
      <motion.div
        className="space-y-6 min-h-screen bg-gray-50 pt-28 px-8 md:px-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DealershipSkeleton />
      </motion.div>
    );
  }

  if (pendingLoading && activeTab === 'pending') {
    return (
      <motion.div
        className="space-y-6 min-h-screen bg-gray-50 pt-28 px-8 md:px-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DealershipSkeleton />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="space-y-6 min-h-screen bg-gray-50 pt-10 md:pt-24 px-8 md:px-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        key={currentPage}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <motion.div
              className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'pending' ? (
                <Clock className="w-5 h-5 text-orange-600" />
              ) : (
                <Mail className="w-5 h-5 text-orange-600" />
              )}
            </motion.div>
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                {activeTab === 'pending' ? 'Pending Approvals' : 'Invited Dealerships'}
              </h2>
              <p className="text-sm text-neutral-600">
                {activeTab === 'pending' 
                  ? 'Dealer registrations awaiting approval'
                  : 'Pending dealership invitations and status'}
              </p>
            </div>
          </motion.div>
          {activeTab === 'invitations' && (
            <motion.button
              onClick={handleOpenInviteModal}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus className="w-4 h-4" />
              Invite Dealership
            </motion.button>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-2 mb-6 border-b border-neutral-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => {
              setActiveTab('pending');
              setPendingCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'pending'
                ? 'text-orange-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approval
              {pendingTotalCount > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {pendingTotalCount}
                </span>
              )}
            </div>
            {activeTab === 'pending' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                layoutId="activeTab"
              />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('invitations');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'invitations'
                ? 'text-orange-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Invited Dealerships
              {totalCount > 0 && (
                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </div>
            {activeTab === 'invitations' && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"
                layoutId="activeTab"
              />
            )}
          </button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeTab === 'pending' ? (
            // Pending Approvals Tab Content
            <>
              {pendingError ? (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-red-500 text-lg mb-2 font-semibold">
                    Error Loading Pending Approvals
                  </div>
                  <div className="text-red-400 text-sm mb-4">
                    {pendingError.message}
                  </div>
                  <button
                    onClick={() => fetchPendingApprovals(pendingCurrentPage, itemsPerPage)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : pendingDealers.length > 0 ? (
                <>
                  {user?.role == "administrator" || user?.role == "sales_manager" ? (
                    <DealershipContainer
                      dealerships={pendingDealers}
                      currentPage={pendingCurrentPage}
                      totalPages={pendingTotalPages}
                      totalCount={pendingTotalCount}
                      onPageChange={handlePendingPageChange}
                      onViewDealership={() => {}}
                      onEditDealership={() => {}}
                      onDeleteDealership={() => {}}
                      onContactDealership={() => {}}
                      onActivateDealership={handleApproveDealer}
                      onDeactivateDealership={handleRejectDealer}
                      isPendingApprovalView={true}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                      <div className="text-neutral-500 text-lg mb-2">
                        You are not authorized to view pending approvals
                      </div>
                      <div className="text-neutral-400 text-sm">
                        Please contact your administrator to request access
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="text-neutral-500 text-lg mb-2">
                    No pending approvals
                  </div>
                  <div className="text-neutral-400 text-sm mb-4">
                    All dealer registrations have been processed
                  </div>
                </div>
              )}
            </>
          ) : (
            // Invitations Tab Content
            <>
              {error ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              {error.type === "permission" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-red-500 text-lg mb-2 font-semibold">
                    Access Denied
                  </div>
                  <div className="text-red-400 text-sm mb-4">
                    {error.message}
                  </div>
                  <div className="text-gray-500 text-xs mb-6">
                    Contact your administrator to request access to invitation
                    management
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-2"
                  >
                    Refresh Page
                  </button>
                </>
              ) : error.type === "auth" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="text-yellow-600 text-lg mb-2 font-semibold">
                    Authentication Required
                  </div>
                  <div className="text-yellow-500 text-sm mb-4">
                    {error.message}
                  </div>
                  <button
                    onClick={() => (window.location.href = "/login")}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Go to Login
                  </button>
                </>
              ) : error.type === "network" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-blue-500 text-lg mb-2 font-semibold">
                    Connection Error
                  </div>
                  <div className="text-blue-400 text-sm mb-4">
                    {error.message}
                  </div>
                  <button
                    onClick={() => fetchInvitations(currentPage, itemsPerPage)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              ) : error.type === "rateLimit" ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div className="text-yellow-600 text-lg mb-2 font-semibold">
                    Rate Limit Exceeded
                  </div>
                  <div className="text-yellow-500 text-sm mb-4">
                    {error.message}
                  </div>
                  <div className="text-gray-500 text-xs mb-6">
                    Please wait a moment before trying again
                  </div>
                  <button
                    onClick={() => fetchInvitations(currentPage, itemsPerPage)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-red-500 text-lg mb-2 font-semibold">
                    Error Loading Invitations
                  </div>
                  <div className="text-red-400 text-sm mb-4">
                    {error.message}
                  </div>
                  <button
                    onClick={() => fetchInvitations(currentPage, itemsPerPage)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          ) : invitations.length > 0 ? (
            <>
              {user?.role == "administrator" || user?.role == "sales_manager" ? (
                <DealershipContainer
                  dealerships={invitations}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={handlePageChange}
                  onViewDealership={handleViewInvitation}
                  onEditDealership={() => {}} // Not applicable for invitations
                  onDeleteDealership={handleCancelInvitation}
                  onContactDealership={() => {}} // Not applicable for invitations
                  onActivateDealership={() => {}} // Not applicable for invitations
                  onDeactivateDealership={() => {}} // Not applicable for invitations
                  // Custom actions for invitations
                  onResendInvitation={handleResendInvitation}
                  onCancelInvitation={handleCancelInvitation}
                  isInvitationView={true}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
                  <div className="text-neutral-500 text-lg mb-2">
                    You are not authorized to view invitations
                  </div>
                  <div className="text-neutral-400 text-sm">
                    Please contact your administrator to request access to
                    invitation management
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-neutral-500 text-lg mb-2">
                No invitations found
              </div>
              <div className="text-neutral-400 text-sm mb-4">
                No dealership invitations have been sent yet
              </div>
              <button
                onClick={handleOpenInviteModal}
                className="cursor-pointer px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Send First Invitation
              </button>
            </div>
          )}
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {activeTab === 'invitations' && totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="w-full max-w-md mb-4"
              />
            </motion.div>
          )}
          {activeTab === 'pending' && pendingTotalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Pagination
                currentPage={pendingCurrentPage}
                totalPages={pendingTotalPages}
                onPageChange={handlePendingPageChange}
                className="w-full max-w-md mb-4"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invite Dealership Modal */}
        <InviteDealershipsModal
          isOpen={isInviteModalOpen}
          onClose={handleCloseInviteModal}
          onSuccess={() => {
            handleCloseInviteModal();
            fetchInvitations(currentPage, itemsPerPage);
          }}
        />

        {/* Confirmation Modal */}
        <ResendAndCancelInvitationModal
          isOpen={isConfirmationModalOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={handleConfirmAction}
          actionType={confirmationAction}
          dealershipName={
            selectedInvitation?.name || 
            selectedPendingDealer?.name || 
            ''
          }
          isLoading={isActionLoading}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default InvitedDealerships;