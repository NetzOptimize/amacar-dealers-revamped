import React, { createContext, useContext, useCallback } from 'react';
import SSEConnectionManager from '../services/SSEConnectionManager';
import Cookies from 'js-cookie';

const SSEContext = createContext(null);

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within an SSEProvider');
  }
  return context;
};

export const SSEProvider = ({ children }) => {
  /**
   * Subscribe to SSE events for a session
   */
  const subscribe = useCallback((sessionId, callback) => {
    if (!sessionId || !callback) {
      console.warn('SSEProvider: Invalid subscribe parameters');
      return () => {};
    }

    const token = Cookies.get('authToken');
    if (!token) {
      console.error('SSEProvider: No auth token found');
      return () => {};
    }

    return SSEConnectionManager.subscribe(sessionId, callback, token);
  }, []);

  /**
   * Check if connected to a session
   */
  const isConnected = useCallback((sessionId) => {
    return SSEConnectionManager.isConnected(sessionId);
  }, []);

  /**
   * Get connection status
   */
  const getConnectionStatus = useCallback((sessionId) => {
    return SSEConnectionManager.getConnectionStatus(sessionId);
  }, []);

  /**
   * Disconnect from a session
   */
  const disconnect = useCallback((sessionId) => {
    SSEConnectionManager.disconnect(sessionId);
  }, []);

  const value = {
    subscribe,
    isConnected,
    getConnectionStatus,
    disconnect,
  };

  return (
    <SSEContext.Provider value={value}>
      {children}
    </SSEContext.Provider>
  );
};

