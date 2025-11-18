import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLiveSessions,
  selectSessions,
  selectSessionsLoading,
  selectSessionsError,
  addSessionFromSSE,
  removeSessionFromSSE,
  updateSessionFromSSE,
} from "@/redux/slices/reverseBiddingSlice";
import LiveSessionsContainer from "@/components/reverse-bidding/LiveSessionsContainer";
import { TrendingDown, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

const LiveSessions = () => {
  const dispatch = useDispatch();
  const sessions = useSelector(selectSessions);
  const isLoading = useSelector(selectSessionsLoading);
  const error = useSelector(selectSessionsError);
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

  // Initial fetch of sessions
  useEffect(() => {
    dispatch(fetchLiveSessions());
  }, [dispatch]);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (!token) {
      console.error('No auth token found for SSE connection');
      return;
    }

    const baseURL = getReverseBidBaseURL();
    const sseUrl = `${baseURL}/reverse-bid/v1/sse/dealer?token=${encodeURIComponent(token)}`;
    
    // Create EventSource connection
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;
    let reconnectTimeout = null;
    let reconnectAttempts = 0;
    let fallbackInterval = null;
    let isConnected = false;

    // Handle connection opened
    eventSource.onopen = () => {
      console.log('Dealer SSE connection opened');
      reconnectAttempts = 0;
      reconnectAttemptsRef.current = 0;
      isConnected = true;
    };

    // Handle connected event
    eventSource.addEventListener('connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Dealer SSE connected:', data);
        isConnected = true;
      } catch (err) {
        console.error('Error parsing connected event:', err);
      }
    });

    // Handle session_started event - new session available
    eventSource.addEventListener('session_started', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id && data.data) {
          // Refresh sessions list to get the new session
          dispatch(fetchLiveSessions());
        }
      } catch (err) {
        console.error('Error parsing session_started event:', err);
      }
    });

    // Handle session_closed event - remove closed session
    eventSource.addEventListener('session_closed', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id) {
          dispatch(removeSessionFromSSE(data.session_id));
        }
      } catch (err) {
        console.error('Error parsing session_closed event:', err);
      }
    });

    // Handle bid_received event - update session if it's for a session we're viewing
    eventSource.addEventListener('bid_received', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id) {
          // Refresh sessions to get updated bid counts
          dispatch(fetchLiveSessions());
        }
      } catch (err) {
        console.error('Error parsing bid_received event:', err);
      }
    });

    // Handle bid_revised event
    eventSource.addEventListener('bid_revised', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id) {
          // Refresh sessions to get updated bid counts
          dispatch(fetchLiveSessions());
        }
      } catch (err) {
        console.error('Error parsing bid_revised event:', err);
      }
    });

    // Handle heartbeat
    eventSource.addEventListener('heartbeat', (event) => {
      // Connection is alive, no action needed
    });

    // Handle disconnected event
    eventSource.addEventListener('disconnected', (event) => {
      console.log('Dealer SSE disconnected');
      isConnected = false;
    });

    // Handle connection errors
    eventSource.onerror = (error) => {
      if (eventSource.readyState === EventSource.CLOSED) {
        console.error('Dealer SSE connection closed:', error);
        isConnected = false;
        
        // Close the connection
        eventSource.close();
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          reconnectAttemptsRef.current = reconnectAttempts;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff, max 10s
          
          reconnectTimeout = setTimeout(() => {
            console.log(`Attempting to reconnect dealer SSE (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
            // Trigger reconnection by refreshing sessions
            dispatch(fetchLiveSessions());
          }, delay);
          reconnectTimeoutRef.current = reconnectTimeout;
        } else {
          console.error('Max dealer SSE reconnection attempts reached. Falling back to polling.');
          // Fallback to polling if SSE fails completely
          fallbackInterval = setInterval(() => {
            dispatch(fetchLiveSessions());
          }, 10000); // Poll every 10 seconds
        }
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
        console.log('Dealer SSE connection closed');
      }
    };
  }, [dispatch]);

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
          <p className="text-neutral-600">Loading live sessions...</p>
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
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-8 h-8 text-primary-600" />
            <motion.h1
              className="text-3xl font-bold text-neutral-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Live Sessions
            </motion.h1>
          </div>
          <motion.p
            className="text-neutral-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Participate in reverse bidding sessions initiated by customers.
            Compete by offering lower prices and attractive perks.
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
              Error loading sessions: {error}
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
              <LiveSessionsContainer sessions={sessions} />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mb-6">
                    <TrendingDown className="w-12 h-12 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    No active sessions
                  </h3>
                  <p className="text-neutral-500 text-center max-w-md">
                    There are currently no reverse bidding sessions available.
                    Check back later for new opportunities.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveSessions;

