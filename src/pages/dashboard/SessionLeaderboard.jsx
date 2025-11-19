import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSessionLeaderboard,
  submitBid,
  withdrawBid,
  selectCurrentSession,
  selectLeaderboard,
  selectLeaderboardLoading,
  selectLeaderboardError,
  selectBidOperationLoading,
  selectBidOperationSuccess,
  clearBidOperationStates,
} from "@/redux/slices/reverseBiddingSlice";
import SessionLeaderboardContainer from "@/components/reverse-bidding/SessionLeaderboardContainer";
import BidNowDialog from "@/components/reverse-bidding/BidNowDialog";
import WithdrawBidDialog from "@/components/reverse-bidding/WithdrawBidDialog";
import SessionDetailsModal from "@/components/reverse-bidding/SessionDetailsModal";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import Cookies from "js-cookie";

const SessionLeaderboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const session = useSelector(selectCurrentSession);
  const leaderboard = useSelector(selectLeaderboard);
  const isLoading = useSelector(selectLeaderboardLoading);
  const error = useSelector(selectLeaderboardError);
  const bidOperationLoading = useSelector(selectBidOperationLoading);
  const bidOperationSuccess = useSelector(selectBidOperationSuccess);

  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Get base URL for reverse bid API
  const getReverseBidBaseURL = () => {
    let baseURL = import.meta.env.VITE_BASE_URL || 'https://dealer.amacar.ai/wp-json/dealer-portal/v1';
    
    // Remove /dealer-portal/v1 if present
    if (baseURL.includes('/dealer-portal/v1')) {
      baseURL = baseURL.replace('/dealer-portal/v1', '');
    }
    
    // Ensure we have the base URL without /wp-json
    if (baseURL.includes('/wp-json')) {
      baseURL = baseURL.replace('/wp-json', '');
    }
    
    if (!baseURL.includes('/wp-json')) {
      if (!baseURL.endsWith('/')) {
        baseURL += '/wp-json';
      } else {
        baseURL += 'wp-json';
      }
    }
    
    return baseURL;
  };

  // Initial fetch of session leaderboard
  useEffect(() => {
    if (sessionId) {
      dispatch(fetchSessionLeaderboard(sessionId));
    }
  }, [dispatch, sessionId]);

  // Set up SSE connection for real-time leaderboard updates
  useEffect(() => {
    if (!sessionId) {
      console.log('SessionLeaderboard SSE: No sessionId, skipping SSE connection');
      return;
    }

    const token = Cookies.get('authToken');
    if (!token) {
      console.error('SessionLeaderboard SSE: No auth token found for SSE connection');
      return;
    }

    // Only skip SSE if session is explicitly closed/ended
    // Allow SSE for active, running, or pending sessions (or if session not loaded yet)
    if (session && (session.status === 'closed' || session.status === 'ended')) {
      console.log('SessionLeaderboard SSE: Session is closed, skipping SSE connection');
      return;
    }

    // Prevent multiple connections
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log('SessionLeaderboard SSE: Connection already exists, skipping');
      return;
    }

    console.log('SessionLeaderboard SSE: Setting up SSE connection for session', sessionId, 'Status:', session?.status);

    const baseURL = getReverseBidBaseURL();
    // Connect to session-specific SSE endpoint (sends leaderboard_updated events)
    const sseUrl = `${baseURL}/reverse-bid/v1/sse/session/${sessionId}?token=${encodeURIComponent(token)}`;
    
    console.log('SessionLeaderboard SSE: Connecting to', sseUrl);
    
    // Create EventSource connection
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    let fallbackInterval = null;
    let isConnected = false;

    // Handle connection opened
    eventSource.onopen = () => {
      console.log('SessionLeaderboard SSE: Connection opened');
      reconnectAttempts = 0;
      reconnectAttemptsRef.current = 0;
      isConnected = true;
    };

    // Handle connected event
    eventSource.addEventListener('connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SessionLeaderboard SSE: Connected event received', data);
        isConnected = true;
      } catch (err) {
        console.error('SessionLeaderboard SSE: Error parsing connected event:', err);
      }
    });

    // Handle leaderboard_updated event - update leaderboard directly from SSE
    eventSource.addEventListener('leaderboard_updated', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SessionLeaderboard SSE: leaderboard_updated event', data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId) && data.leaderboard) {
          console.log('SessionLeaderboard SSE: Updating leaderboard from SSE for session', sessionId);
          // Update leaderboard directly from SSE data
          // We need to refresh the full session to get updated session data as well
          dispatch(fetchSessionLeaderboard(sessionId));
        }
      } catch (err) {
        console.error('SessionLeaderboard SSE: Error parsing leaderboard_updated event:', err);
      }
    });

    // Handle bid_received event - refresh leaderboard
    eventSource.addEventListener('bid_received', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SessionLeaderboard SSE: bid_received event', data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          console.log('SessionLeaderboard SSE: Refreshing leaderboard for session', sessionId);
          // Refresh leaderboard for this session
          dispatch(fetchSessionLeaderboard(sessionId));
        }
      } catch (err) {
        console.error('SessionLeaderboard SSE: Error parsing bid_received event:', err);
      }
    });

    // Handle bid_revised event
    eventSource.addEventListener('bid_revised', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SessionLeaderboard SSE: bid_revised event', data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          console.log('SessionLeaderboard SSE: Refreshing leaderboard for session', sessionId);
          // Refresh leaderboard for this session
          dispatch(fetchSessionLeaderboard(sessionId));
        }
      } catch (err) {
        console.error('SessionLeaderboard SSE: Error parsing bid_revised event:', err);
      }
    });

    // Handle session_ended event
    eventSource.addEventListener('session_ended', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SessionLeaderboard SSE: session_ended event', data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          console.log('SessionLeaderboard SSE: Refreshing session status for session', sessionId);
          // Refresh to get updated session status
          dispatch(fetchSessionLeaderboard(sessionId));
        }
      } catch (err) {
        console.error('SessionLeaderboard SSE: Error parsing session_ended event:', err);
      }
    });

    // Handle heartbeat
    eventSource.addEventListener('heartbeat', (event) => {
      // Connection is alive, no action needed
      console.log('SessionLeaderboard SSE: Heartbeat received');
    });

    // Handle disconnected event
    eventSource.addEventListener('disconnected', (event) => {
      console.log('SessionLeaderboard SSE: Disconnected event received');
      isConnected = false;
    });

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.log('SessionLeaderboard SSE: Error event, readyState:', eventSource.readyState);
      
      // Don't try to reconnect if we got a 403 (permission denied) - just log and stop
      if (eventSource.readyState === EventSource.CLOSED) {
        // Check if it's a 403 error by checking the last response
        // If it's a 403, don't try to reconnect - the dealer doesn't have access
        console.warn('SessionLeaderboard SSE: Connection closed. This may be due to insufficient permissions.');
        isConnected = false;
        
        // Close the connection
        eventSource.close();
        
        // Only attempt to reconnect if we haven't exceeded max attempts
        // But skip reconnection if we suspect it's a 403 (permission issue)
        if (reconnectAttempts < maxReconnectAttempts && reconnectAttempts === 0) {
          // Only try once - if it fails again, it's likely a permission issue
          reconnectAttempts++;
          reconnectAttemptsRef.current = reconnectAttempts;
          const delay = 2000; // 2 second delay
          
          reconnectTimeout = setTimeout(() => {
            console.log(`SessionLeaderboard SSE: Attempting to reconnect (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
            // Don't trigger a page reload - just try to reconnect
            // The useEffect will handle reconnection by recreating the EventSource
          }, delay);
          reconnectTimeoutRef.current = reconnectTimeout;
        } else {
          console.error('SessionLeaderboard SSE: Connection failed. Falling back to polling.');
          // Fallback to polling if SSE fails completely
          fallbackInterval = setInterval(() => {
            dispatch(fetchSessionLeaderboard(sessionId));
          }, 10000); // Poll every 10 seconds
        }
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log('SessionLeaderboard SSE: Reconnecting...');
      } else if (eventSource.readyState === EventSource.OPEN) {
        // Connection is open, reset reconnect attempts
        reconnectAttempts = 0;
        reconnectAttemptsRef.current = 0;
      }
    };

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('SessionLeaderboard SSE: Connection closed and cleaned up');
      }
    };
  }, [dispatch, sessionId]); // Removed session?.status from dependencies to prevent unnecessary reconnections

  useEffect(() => {
    if (bidOperationSuccess) {
      // Refresh leaderboard after successful bid operation
      dispatch(fetchSessionLeaderboard(sessionId));
      dispatch(clearBidOperationStates());
    }
  }, [bidOperationSuccess, dispatch, sessionId]);

  const handleBidNow = () => {
    setBidDialogOpen(true);
  };

  const handleSubmitBid = async (bidData) => {
    try {
      await dispatch(submitBid(bidData)).unwrap();
      toast.success("Bid submitted successfully");
      setBidDialogOpen(false);
    } catch (error) {
      toast.error(error || "Failed to submit bid");
      throw error;
    }
  };

  const handleWithdrawBid = (bidId) => {
    const bid = leaderboard.find((b) => b.id === bidId);
    if (bid) {
      setSelectedBid(bid);
      setWithdrawDialogOpen(true);
    }
  };

  const handleConfirmWithdraw = async (withdrawData) => {
    try {
      await dispatch(withdrawBid(withdrawData)).unwrap();
      toast.success("Bid withdrawn successfully");
      setWithdrawDialogOpen(false);
      setSelectedBid(null);
    } catch (error) {
      toast.error(error || "Failed to withdraw bid");
      throw error;
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-neutral-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12">
        <div className="px-4 md:px-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 text-center mb-4">
              Error loading session: {error}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/reverse-bidding")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12">
        <div className="px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Session not found
              </h3>
              <p className="text-neutral-500 text-center mb-6">
                The session you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/reverse-bidding")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Button>
            </div>
          </div>
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
        <motion.div className="mb-6" variants={headerVariants}>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reverse-bidding")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsModalOpen(true)}
              className="flex items-center gap-2 ml-auto"
            >
              <Info className="w-4 h-4" />
              View Details
            </Button>
          </div>
        </motion.div>

        {/* Leaderboard Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SessionLeaderboardContainer
            leaderboard={leaderboard}
            session={session}
            onBidNow={handleBidNow}
            onWithdrawBid={handleWithdrawBid}
          />
        </motion.div>

        {/* Bid Now Dialog */}
        <BidNowDialog
          isOpen={bidDialogOpen}
          onClose={() => setBidDialogOpen(false)}
          session={session}
          onSubmit={handleSubmitBid}
        />

        {/* Withdraw Bid Dialog */}
        <WithdrawBidDialog
          isOpen={withdrawDialogOpen}
          onClose={() => {
            setWithdrawDialogOpen(false);
            setSelectedBid(null);
          }}
          session={session}
          bid={selectedBid}
          onConfirm={handleConfirmWithdraw}
          isLoading={bidOperationLoading}
        />

        {/* Session Details Modal */}
        <SessionDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          session={session}
          bidHistory={leaderboard}
        />
      </div>
    </motion.div>
  );
};

export default SessionLeaderboard;

