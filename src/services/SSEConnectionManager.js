/**
 * SSE Connection Manager - Singleton pattern
 * Manages SSE connections outside of React component lifecycle
 * This prevents connections from being torn down when components remount
 */
class SSEConnectionManager {
  constructor() {
    this.connections = new Map(); // Map<sessionId, EventSource>
    this.subscribers = new Map(); // Map<sessionId, Set<callback>>
    this.reconnectAttempts = new Map(); // Map<sessionId, number>
    this.reconnectTimeouts = new Map(); // Map<sessionId, timeout>
    this.fallbackIntervals = new Map(); // Map<sessionId, interval>
    this.maxReconnectAttempts = 5;
    this.isConnecting = new Map(); // Map<sessionId, boolean>
  }

  /**
   * Get base URL for reverse bid API
   */
  getReverseBidBaseURL() {
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
  }

  /**
   * Subscribe to SSE events for a session
   * @param {string} sessionId - Session ID to connect to
   * @param {Function} callback - Callback function to receive events
   * @param {string} token - Auth token
   * @returns {Function} Unsubscribe function
   */
  subscribe(sessionId, callback, token) {
    if (!sessionId || !callback || !token) {
      console.warn('SSEConnectionManager: Invalid subscribe parameters');
      return () => {};
    }

    // Add callback to subscribers
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }
    this.subscribers.get(sessionId).add(callback);

    // If connection doesn't exist or is closed, create it
    const connection = this.connections.get(sessionId);
    if (!connection || connection.readyState === EventSource.CLOSED) {
      this.connect(sessionId, token);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(sessionId, callback);
    };
  }

  /**
   * Unsubscribe from SSE events
   */
  unsubscribe(sessionId, callback) {
    if (!this.subscribers.has(sessionId)) {
      return;
    }

    const subscribers = this.subscribers.get(sessionId);
    subscribers.delete(callback);

    // If no more subscribers, close the connection
    if (subscribers.size === 0) {
      this.disconnect(sessionId);
    }
  }

  /**
   * Connect to SSE endpoint
   */
  connect(sessionId, token) {
    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting.get(sessionId)) {
      console.log(`SSEConnectionManager: Connection already in progress for session ${sessionId}`);
      return;
    }

    // If connection exists and is open, don't reconnect
    const existingConnection = this.connections.get(sessionId);
    if (existingConnection && existingConnection.readyState === EventSource.OPEN) {
      console.log(`SSEConnectionManager: Connection already open for session ${sessionId}`);
      return;
    }

    // Close existing connection if any
    if (existingConnection) {
      existingConnection.close();
    }

    this.isConnecting.set(sessionId, true);
    const baseURL = this.getReverseBidBaseURL();
    const sseUrl = `${baseURL}/reverse-bid/v1/sse/session/${sessionId}?token=${encodeURIComponent(token)}`;
    
    console.log(`SSEConnectionManager: Connecting to session ${sessionId}`);

    const eventSource = new EventSource(sseUrl);
    this.connections.set(sessionId, eventSource);
    this.reconnectAttempts.set(sessionId, 0);

    // Handle connection opened
    eventSource.onopen = () => {
      console.log(`SSEConnectionManager: Connection opened for session ${sessionId}`);
      this.isConnecting.set(sessionId, false);
      this.reconnectAttempts.set(sessionId, 0);
      this.notifySubscribers(sessionId, { type: 'connected', data: { session_id: sessionId } });
    };

    // Handle connected event
    eventSource.addEventListener('connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`SSEConnectionManager: Connected event for session ${sessionId}`, data);
        this.isConnecting.set(sessionId, false);
        this.notifySubscribers(sessionId, { type: 'connected', data });
      } catch (err) {
        console.error(`SSEConnectionManager: Error parsing connected event:`, err);
      }
    });

    // Handle leaderboard_updated event
    eventSource.addEventListener('leaderboard_updated', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          this.notifySubscribers(sessionId, { type: 'leaderboard_updated', data });
        }
      } catch (err) {
        console.error(`SSEConnectionManager: Error parsing leaderboard_updated event:`, err);
      }
    });

    // Handle bid_received event
    eventSource.addEventListener('bid_received', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          this.notifySubscribers(sessionId, { type: 'bid_received', data });
        }
      } catch (err) {
        console.error(`SSEConnectionManager: Error parsing bid_received event:`, err);
      }
    });

    // Handle bid_revised event
    eventSource.addEventListener('bid_revised', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          this.notifySubscribers(sessionId, { type: 'bid_revised', data });
        }
      } catch (err) {
        console.error(`SSEConnectionManager: Error parsing bid_revised event:`, err);
      }
    });

    // Handle session_ended event
    eventSource.addEventListener('session_ended', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.session_id && parseInt(data.session_id) === parseInt(sessionId)) {
          this.notifySubscribers(sessionId, { type: 'session_ended', data });
        }
      } catch (err) {
        console.error(`SSEConnectionManager: Error parsing session_ended event:`, err);
      }
    });

    // Handle heartbeat
    eventSource.addEventListener('heartbeat', (event) => {
      // Connection is alive, no action needed
    });

    // Handle disconnected event
    eventSource.addEventListener('disconnected', (event) => {
      console.log(`SSEConnectionManager: Disconnected event for session ${sessionId}`);
      this.notifySubscribers(sessionId, { type: 'disconnected', data: { session_id: sessionId } });
    });

    // Handle connection errors
    eventSource.onerror = (error) => {
      console.log(`SSEConnectionManager: Error event for session ${sessionId}, readyState:`, eventSource.readyState);
      
      if (eventSource.readyState === EventSource.CLOSED) {
        console.warn(`SSEConnectionManager: Connection closed for session ${sessionId}`);
        this.isConnecting.set(sessionId, false);
        
        // Notify subscribers
        this.notifySubscribers(sessionId, { type: 'error', data: { session_id: sessionId, error: 'Connection closed' } });
        
        // Attempt to reconnect
        const attempts = this.reconnectAttempts.get(sessionId) || 0;
        if (attempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(sessionId, token, attempts + 1);
        } else {
          console.error(`SSEConnectionManager: Max reconnection attempts reached for session ${sessionId}. Falling back to polling.`);
          this.startFallbackPolling(sessionId);
        }
      } else if (eventSource.readyState === EventSource.CONNECTING) {
        console.log(`SSEConnectionManager: Still connecting for session ${sessionId}...`);
      } else if (eventSource.readyState === EventSource.OPEN) {
        // Connection is open, reset reconnect attempts
        this.reconnectAttempts.set(sessionId, 0);
        this.isConnecting.set(sessionId, false);
      }
    };
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect(sessionId, token, attemptNumber) {
    // Clear any existing reconnect timeout
    const existingTimeout = this.reconnectTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    this.reconnectAttempts.set(sessionId, attemptNumber);
    const delay = Math.min(2000 * attemptNumber, 10000); // Exponential backoff, max 10s
    
    const timeout = setTimeout(() => {
      // Only reconnect if there are still subscribers
      if (this.subscribers.has(sessionId) && this.subscribers.get(sessionId).size > 0) {
        console.log(`SSEConnectionManager: Attempting to reconnect to session ${sessionId} (attempt ${attemptNumber}/${this.maxReconnectAttempts})...`);
        this.connect(sessionId, token);
      }
      this.reconnectTimeouts.delete(sessionId);
    }, delay);

    this.reconnectTimeouts.set(sessionId, timeout);
  }

  /**
   * Start fallback polling
   */
  startFallbackPolling(sessionId) {
    // Clear any existing polling interval
    const existingInterval = this.fallbackIntervals.get(sessionId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Notify subscribers to poll manually (they can implement their own polling logic)
    this.notifySubscribers(sessionId, { 
      type: 'fallback_polling', 
      data: { session_id: sessionId, message: 'SSE failed, use polling' } 
    });
  }

  /**
   * Notify all subscribers of an event
   */
  notifySubscribers(sessionId, event) {
    if (!this.subscribers.has(sessionId)) {
      return;
    }

    const subscribers = this.subscribers.get(sessionId);
    subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`SSEConnectionManager: Error in subscriber callback:`, error);
      }
    });
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(sessionId) {
    console.log(`SSEConnectionManager: Disconnecting from session ${sessionId}`);

    // Close connection
    const connection = this.connections.get(sessionId);
    if (connection) {
      connection.close();
      this.connections.delete(sessionId);
    }

    // Clear reconnect timeout
    const reconnectTimeout = this.reconnectTimeouts.get(sessionId);
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      this.reconnectTimeouts.delete(sessionId);
    }

    // Clear fallback interval
    const fallbackInterval = this.fallbackIntervals.get(sessionId);
    if (fallbackInterval) {
      clearInterval(fallbackInterval);
      this.fallbackIntervals.delete(sessionId);
    }

    // Clear state
    this.reconnectAttempts.delete(sessionId);
    this.isConnecting.delete(sessionId);
    this.subscribers.delete(sessionId);
  }

  /**
   * Check if connected to a session
   */
  isConnected(sessionId) {
    const connection = this.connections.get(sessionId);
    return connection && connection.readyState === EventSource.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(sessionId) {
    const connection = this.connections.get(sessionId);
    if (!connection) {
      return 'disconnected';
    }
    
    switch (connection.readyState) {
      case EventSource.CONNECTING:
        return 'connecting';
      case EventSource.OPEN:
        return 'connected';
      case EventSource.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  /**
   * Disconnect all connections (cleanup)
   */
  disconnectAll() {
    const sessionIds = Array.from(this.connections.keys());
    sessionIds.forEach(sessionId => this.disconnect(sessionId));
  }
}

// Export singleton instance
export default new SSEConnectionManager();

