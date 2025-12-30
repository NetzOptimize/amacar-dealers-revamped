import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getAuctionActivityReport,
  getBidPerformanceReport,
  getCustomerEngagementReport,
  getAppointmentsReport,
  getDashboardSummaryReport,
  getDealerPerformanceReport,
  getUserActivityReport,
  getSubscriptionRevenueReport
} from '@/lib/api';

// Request cache to prevent duplicate API calls
const requestCache = new Map();
const pendingRequests = new Map();

// Generate cache key
const getCacheKey = (endpoint, dateFrom, dateTo, groupBy = 'day') => {
  return `${endpoint}_${dateFrom}_${dateTo}_${groupBy}`;
};

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Check if cache is valid
const isCacheValid = (cachedData) => {
  if (!cachedData) return false;
  return Date.now() - cachedData.timestamp < CACHE_DURATION;
};

// Deduplicate and cache API requests
const fetchWithCache = async (endpoint, dateFrom, dateTo, groupBy = 'day') => {
  const cacheKey = getCacheKey(endpoint, dateFrom, dateTo, groupBy);
  
  // Check cache first
  const cached = requestCache.get(cacheKey);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }
  
  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    // Return the pending promise
    return pendingRequests.get(cacheKey);
  }
  
  // Create new request
  const apiFunctions = {
    'auction-activity': getAuctionActivityReport,
    'bid-performance': getBidPerformanceReport,
    'customer-engagement': getCustomerEngagementReport,
    'appointments': getAppointmentsReport,
    'dashboard-summary': getDashboardSummaryReport,
    'dealer-performance': getDealerPerformanceReport,
    'user-activity': getUserActivityReport,
    'subscription-revenue': getSubscriptionRevenueReport,
  };
  
  const apiFunction = apiFunctions[endpoint];
  if (!apiFunction) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  
  // Create promise for this request
  const requestPromise = apiFunction(dateFrom, dateTo, groupBy)
    .then((response) => {
      // Cache the response
      requestCache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });
      
      // Remove from pending
      pendingRequests.delete(cacheKey);
      
      return response;
    })
    .catch((error) => {
      // Remove from pending on error
      pendingRequests.delete(cacheKey);
      throw error;
    });
  
  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

// Clear cache for specific date range
export const clearCacheForDateRange = (dateFrom, dateTo) => {
  const keysToDelete = [];
  requestCache.forEach((value, key) => {
    if (key.includes(dateFrom) || key.includes(dateTo)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => requestCache.delete(key));
};

// Hook to manage all report data with caching
export const useReportDataCache = (startDate, endDate, groupBy = 'day') => {
  const [data, setData] = useState({
    dashboardSummary: null,
    auctionActivity: null,
    bidPerformance: null,
    customerEngagement: null,
    appointments: null,
    dealerPerformance: null,
    userActivity: null,
    subscriptionRevenue: null,
  });
  
  const [loading, setLoading] = useState({
    dashboardSummary: false,
    auctionActivity: false,
    bidPerformance: false,
    customerEngagement: false,
    appointments: false,
    dealerPerformance: false,
    userActivity: false,
    subscriptionRevenue: false,
  });
  
  const [errors, setErrors] = useState({});
  const abortControllerRef = useRef(null);
  
  // Fetch all report data
  const fetchAllReports = useCallback(async (dateFrom, dateTo, groupByParam) => {
    // Cancel previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // Set all loading states
    setLoading({
      dashboardSummary: true,
      auctionActivity: true,
      bidPerformance: true,
      customerEngagement: true,
      appointments: true,
      dealerPerformance: true,
      userActivity: true,
      subscriptionRevenue: true,
    });
    
    setErrors({});
    
    try {
      // Fetch all reports in parallel
      const [
        dashboardSummary,
        auctionActivity,
        bidPerformance,
        customerEngagement,
        appointments,
        dealerPerformance,
        userActivity,
        subscriptionRevenue,
      ] = await Promise.allSettled([
        fetchWithCache('dashboard-summary', dateFrom, dateTo, groupByParam),
        fetchWithCache('auction-activity', dateFrom, dateTo, groupByParam),
        fetchWithCache('bid-performance', dateFrom, dateTo, groupByParam),
        fetchWithCache('customer-engagement', dateFrom, dateTo, groupByParam),
        fetchWithCache('appointments', dateFrom, dateTo, groupByParam),
        fetchWithCache('dealer-performance', dateFrom, dateTo, groupByParam),
        fetchWithCache('user-activity', dateFrom, dateTo, groupByParam),
        fetchWithCache('subscription-revenue', dateFrom, dateTo, groupByParam),
      ]);
      
      // Process results
      const newData = {};
      const newErrors = {};
      const newLoading = {};
      
      const processResult = (result, key) => {
        if (result.status === 'fulfilled') {
          newData[key] = result.value;
          newErrors[key] = null;
        } else {
          newData[key] = null;
          newErrors[key] = result.reason?.message || 'Failed to fetch data';
        }
        newLoading[key] = false;
      };
      
      processResult(dashboardSummary, 'dashboardSummary');
      processResult(auctionActivity, 'auctionActivity');
      processResult(bidPerformance, 'bidPerformance');
      processResult(customerEngagement, 'customerEngagement');
      processResult(appointments, 'appointments');
      processResult(dealerPerformance, 'dealerPerformance');
      processResult(userActivity, 'userActivity');
      processResult(subscriptionRevenue, 'subscriptionRevenue');
      
      setData(prev => ({ ...prev, ...newData }));
      setErrors(prev => ({ ...prev, ...newErrors }));
      setLoading(prev => ({ ...prev, ...newLoading }));
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching reports:', error);
      }
    }
  }, []);
  
  // Fetch data when dates change
  useEffect(() => {
    if (!startDate || !endDate) return;
    
    const dateFrom = startDate;
    const dateTo = endDate;
    
    fetchAllReports(dateFrom, dateTo, groupBy);
    
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [startDate, endDate, groupBy, fetchAllReports]);
  
  // Check if any data is loading
  const isLoading = Object.values(loading).some(Boolean);
  
  // Check if any data has errors
  const hasErrors = Object.values(errors).some(Boolean);
  
  return {
    data,
    loading,
    errors,
    isLoading,
    hasErrors,
    refetch: () => {
      if (startDate && endDate) {
        // Clear cache for this date range
        clearCacheForDateRange(startDate, endDate);
        fetchAllReports(startDate, endDate, groupBy);
      }
    },
  };
};

