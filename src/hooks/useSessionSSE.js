import { useEffect, useRef, useCallback } from 'react';
import { useSSE } from '../context/SSEContext';
import { useDispatch } from 'react-redux';
import { fetchSessionLeaderboard } from '@/redux/slices/reverseBiddingSlice';

/**
 * Custom hook to manage SSE connection for a session
 * This hook handles subscribing/unsubscribing and event handling
 * The connection is managed by SSEConnectionManager, so it persists across remounts
 */
export const useSessionSSE = (sessionId, options = {}) => {
  const { subscribe, isConnected, getConnectionStatus } = useSSE();
  const dispatch = useDispatch();
  const callbackRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const isFetchingRef = useRef(false);
  const optionsRef = useRef(options);
  const lastFetchTimeRef = useRef(0);
  const fetchDebounceMs = 1000; // Minimum 1 second between fetches
  const sessionIdRef = useRef(sessionId);
  const dispatchRef = useRef(dispatch);

  // Keep refs up to date
  useEffect(() => {
    sessionIdRef.current = sessionId;
    dispatchRef.current = dispatch;
  }, [sessionId, dispatch]);

  // Store latest options in ref so we can access them in the callback without dependencies
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Extract enabled - we'll track it but only re-subscribe when it actually changes meaningfully
  const enabled = options.enabled !== false; // Default to true if not explicitly false

  // Helper to safely fetch session leaderboard with debouncing - stored in ref to avoid dependency issues
  const safeFetchSessionLeaderboardRef = useRef(() => {
    const currentSessionId = sessionIdRef.current;
    const currentDispatch = dispatchRef.current;
    
    if (!currentSessionId || isFetchingRef.current) {
      return;
    }
    
    // Debounce: Don't fetch if we've fetched recently
    const now = Date.now();
    if (now - lastFetchTimeRef.current < fetchDebounceMs) {
      console.log('useSessionSSE: Skipping fetch, too soon since last fetch');
      return;
    }
    
    lastFetchTimeRef.current = now;
    isFetchingRef.current = true;
    currentDispatch(fetchSessionLeaderboard(currentSessionId)).finally(() => {
      isFetchingRef.current = false;
    });
  });

  // Track if we're already subscribed to prevent duplicate subscriptions
  const subscribedSessionIdRef = useRef(null);

  // Create callback that handles all event types
  useEffect(() => {
    if (!sessionId || !enabled) {
      // Unsubscribe if we were subscribed to a different session
      if (subscribedSessionIdRef.current && subscribedSessionIdRef.current !== sessionId) {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        subscribedSessionIdRef.current = null;
      }
      return;
    }

    // If already subscribed to this session, don't subscribe again
    if (subscribedSessionIdRef.current === sessionId && unsubscribeRef.current) {
      console.log('useSessionSSE: Already subscribed to session', sessionId);
      return;
    }

    // Unsubscribe from previous session if different
    if (subscribedSessionIdRef.current && subscribedSessionIdRef.current !== sessionId) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }

    callbackRef.current = (event) => {
      const { type, data } = event;
      const currentOptions = optionsRef.current;

      switch (type) {
        case 'connected':
          console.log('useSessionSSE: Connected event received', data);
          currentOptions.onConnected?.(data);
          break;

        case 'disconnected':
          console.log('useSessionSSE: Disconnected event received', data);
          currentOptions.onDisconnected?.(data);
          break;

        case 'leaderboard_updated':
          console.log('useSessionSSE: Leaderboard updated event received', data);
          if (data.session_id && parseInt(data.session_id) === parseInt(sessionIdRef.current) && data.leaderboard) {
            safeFetchSessionLeaderboardRef.current();
          }
          currentOptions.onLeaderboardUpdated?.(data);
          break;

        case 'bid_received':
          console.log('useSessionSSE: Bid received event received', data);
          if (data.session_id && parseInt(data.session_id) === parseInt(sessionIdRef.current)) {
            safeFetchSessionLeaderboardRef.current();
          }
          currentOptions.onBidReceived?.(data);
          break;

        case 'bid_revised':
          console.log('useSessionSSE: Bid revised event received', data);
          if (data.session_id && parseInt(data.session_id) === parseInt(sessionIdRef.current)) {
            safeFetchSessionLeaderboardRef.current();
          }
          currentOptions.onBidRevised?.(data);
          break;

        case 'session_ended':
          console.log('useSessionSSE: Session ended event received', data);
          if (data.session_id && parseInt(data.session_id) === parseInt(sessionIdRef.current)) {
            safeFetchSessionLeaderboardRef.current();
          }
          currentOptions.onSessionEnded?.(data);
          break;

        case 'error':
          console.error('useSessionSSE: Error event received', data);
          currentOptions.onError?.(data);
          break;

        case 'fallback_polling':
          console.warn('useSessionSSE: Fallback polling required', data);
          // Optionally start polling here
          break;

        default:
          console.log('useSessionSSE: Unknown event type', type, data);
      }
    };

    // Subscribe to SSE events
    unsubscribeRef.current = subscribe(sessionId, callbackRef.current);
    subscribedSessionIdRef.current = sessionId;

    // Cleanup on unmount or when sessionId/enabled changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (subscribedSessionIdRef.current === sessionId) {
        subscribedSessionIdRef.current = null;
      }
      callbackRef.current = null;
    };
  }, [sessionId, enabled, subscribe]); // Depend on sessionId, enabled, and subscribe
  // The subscription check prevents duplicate subscriptions even if this effect re-runs

  return {
    isConnected: isConnected(sessionId),
    connectionStatus: getConnectionStatus(sessionId),
  };
};

