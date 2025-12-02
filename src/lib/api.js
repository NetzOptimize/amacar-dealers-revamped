import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'https://dealer.amacar.ai/wp-json/dealer-portal/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Enable cookies for HTTP-only token storage
});

api.interceptors.request.use(
  (config) => {
    // Get token from cookie and add to Authorization header for protected routes
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Ensure token refresh service is running for protected routes
      const isProtectedRoute = !config.url?.includes('/auth/login') && 
                              !config.url?.includes('/auth/forgot-password') &&
                              !config.url?.includes('/auth/verify-otp') &&
                              !config.url?.includes('/auth/reset-password') &&
                              !config.url?.includes('/registration/');
      
      if (isProtectedRoute) {
        // Import and ensure service is running
        import('@/services/tokenRefreshService').then(({ default: tokenRefreshService }) => {
          tokenRefreshService.ensureRunning();
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't auto-refresh for these endpoints to prevent infinite loops
      const isTwoFAToggle = error.config?.url?.includes('/user/twofa');
      const isRefreshToken = error.config?.url?.includes('/auth/refresh-token');
      const isLogout = error.config?.url?.includes('/auth/logout');
      const isLogin = error.config?.url?.includes('/auth/login');
      
      if (!isTwoFAToggle && !isRefreshToken && !isLogout && !isLogin) {
        // Mark this request as retried to prevent infinite loops
        originalRequest._retry = true;
        
        try {
          // Import the token refresh service dynamically to avoid circular imports
          const { default: tokenRefreshService } = await import('@/services/tokenRefreshService');
          
          // Check if we have a valid user session before attempting refresh
          const user = localStorage.getItem('authUser');
          const expiration = localStorage.getItem('authExpiration');
          
          if (!user || !expiration) {
            console.warn('No valid session found, skipping token refresh');
            return Promise.reject(error);
          }
          
          // Check if token is already expired
          const expTime = parseInt(expiration, 10);
          if (Date.now() >= expTime) {
            console.warn('Token already expired, skipping refresh');
            localStorage.removeItem('authUser');
            localStorage.removeItem('authExpiration');
            Cookies.remove('authToken');
            return Promise.reject(error);
          }
          
          // Attempt to refresh the token
          const refreshResult = await tokenRefreshService.forceRefresh();
          
          if (refreshResult.type === 'user/refreshToken/fulfilled') {
            // Token refreshed successfully, retry the original request
            return api(originalRequest);
          } else {
            // Refresh failed, clear data and let the app handle logout
            console.warn('Token refresh failed, clearing session');
            localStorage.removeItem('authUser');
            localStorage.removeItem('authExpiration');
            Cookies.remove('authToken');
          }
        } catch (refreshError) {
          console.error('Token refresh failed in interceptor:', refreshError);
          // Clear any remaining localStorage data (for backward compatibility)
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          localStorage.removeItem('authExpiration');
          Cookies.remove('authToken');
        }
      }
    }
    return Promise.reject(error);
  }
);



// Dashboard Cards API
export const getDashboardCards = async () => {
  try {
    const response = await api.get('/dashboard/cards');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard cards:', error);
    throw error;
  }
};

// Recent Vehicles API (using live auctions endpoint)
export const getRecentVehicles = async (limit = 6) => {
  try {
    const response = await api.get('/live-auctions', {
        params: {
          page: 1,
          per_page: limit
        }
      });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent vehicles:', error);
    throw error;
  }
};

// Recent Customers API (using active customers endpoint)
export const getRecentCustomers = async (limit = 5) => {
  try {
    const response = await api.get('/active-customers', {
      params: {
        page: 1,
        per_page: limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent customers:', error);
    throw error;
  }
};

// Live Auctions API
export const getLiveAuctions = async (page = 1, perPage = 4, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...filters
    });
    
    const response = await api.get(`/live-auctions?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live auctions:', error);
    throw error;
  }
};

// Dashboard Activity API
export const getDashboardActivity = async (limit = 6) => {
  try {
    const response = await api.get('/dealer-dashboard/activity', {
      params: {
        limit: limit
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    throw error;
  }
};

// Customer Details API
export const getCustomerDetails = async (customerId) => {
  try {
    const response = await api.get(`/customer/details/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer details:', error);
    throw error;
  }
};

// Pass Vehicle API
export const passVehicle = async (productId) => {
  try {
    const response = await api.post('/bids/pass-vehicle', {
      product_id: productId
    });
    return response.data;
  } catch (error) {
    console.error('Error passing vehicle:', error);
    throw error;
  }
};

// Unpass Vehicle API
export const unpassVehicle = async (productId) => {
  try {
    const response = await api.post('/bids/unpass-vehicle', {
      product_id: productId
    });
    return response.data;
  } catch (error) {
    console.error('Error unpassing vehicle:', error);
    throw error;
  }
};

// Reports API functions
export const getAuctionActivityReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/auction-activity?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching auction activity report:', error);
    throw error;
  }
};

export const getBidPerformanceReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/bid-performance?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bid performance report:', error);
    throw error;
  }
};

export const getCustomerEngagementReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/customer-engagement?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer engagement report:', error);
    throw error;
  }
};

export const getAppointmentsReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/appointments?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments report:', error);
    throw error;
  }
};

export const getDashboardSummaryReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/dashboard-summary?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary report:', error);
    throw error;
  }
};

export const getDealerPerformanceReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/dealer-performance?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer performance report:', error);
    throw error;
  }
};

export const getUserActivityReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/user-activity?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity report:', error);
    throw error;
  }
};

export const getSubscriptionRevenueReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/subscription-revenue?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription revenue report:', error);
    throw error;
  }
};

export const getSystemPerformanceReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/system-performance?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching system performance report:', error);
    throw error;
  }
};

export const getFeatureUsageReport = async (dateFrom, dateTo, groupBy = 'day') => {
  try {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      group_by: groupBy
    });
    
    const response = await api.get(`/reports/feature-usage?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching feature usage report:', error);
    throw error;
  }
};

// Invitations API functions
export const getInvitations = async (page = 1, perPage = 20) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    const response = await api.get(`/dealers/invitations?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
};

export const resendInvitation = async (token) => {
  try {
    const response = await api.post(`/dealers/invitations/${token}/resend`);
    return response.data;
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
};

export const cancelInvitation = async (token) => {
  try {
    const response = await api.delete(`/dealers/invitations/${token}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error canceling invitation:', error);
    throw error;
  }
};

// Reverse Bidding API functions
// Note: These endpoints are under /wp-json/reverse-bid/v1/ namespace
// We need to construct the full path since baseURL is dealer-portal/v1
const getReverseBidBaseURL = () => {
  let baseURL = import.meta.env.VITE_BASE_URL || 'https://dealer.amacar.ai/wp-json/dealer-portal/v1';
  
  // Extract base URL without the /dealer-portal/v1 part
  // Handle both cases: with and without trailing slash
  if (baseURL.includes('/dealer-portal/v1')) {
    baseURL = baseURL.replace('/dealer-portal/v1', '');
  }
  
  // Ensure we have /wp-json in the path
  if (!baseURL.includes('/wp-json')) {
    // If baseURL is just a domain, add /wp-json
    if (!baseURL.endsWith('/')) {
      baseURL += '/wp-json';
    } else {
      baseURL += 'wp-json';
    }
  }
  
  return baseURL;
};

// Create a separate axios instance for reverse-bid endpoints
const reverseBidApi = axios.create({
  baseURL: getReverseBidBaseURL() + '/reverse-bid/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add auth interceptor for reverse-bid API
reverseBidApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get dealer's reverse bidding sessions
export const getDealerSessions = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/dealer/sessions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer sessions:', error);
    throw error;
  }
};

// Get dealer inventory (all vehicles owned by dealer)
export const getDealerInventory = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/dealer/inventory', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer inventory:', error);
    throw error;
  }
};

// Get won sessions (sessions won by the logged-in dealer)
export const getWonSessions = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/dealer/won-sessions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching won sessions:', error);
    throw error;
  }
};

// Get vehicle details (only for vehicles owned by dealer)
export const getVehicleDetail = async (vehicleId) => {
  try {
    const response = await reverseBidApi.get(`/dealer/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    throw error;
  }
};

// Mark vehicle as sold
export const markVehicleSold = async (vehicleId) => {
  try {
    const response = await reverseBidApi.post(`/dealer/vehicles/${vehicleId}/mark-sold`);
    return response.data;
  } catch (error) {
    console.error('Error marking vehicle as sold:', error);
    throw error;
  }
};

// Get dealer's reverse bids (all bids by the logged-in dealer)
export const getMyReverseBids = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/dealer/my-bids', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching my reverse bids:', error);
    throw error;
  }
};

// Get dealer's bids for a specific session
export const getDealerSessionBids = async (sessionId) => {
  try {
    const response = await reverseBidApi.get(`/sessions/${sessionId}/dealer-bids`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer session bids:', error);
    throw error;
  }
};

// Get detailed session information
export const getDealerSessionDetails = async (sessionId) => {
  try {
    const response = await reverseBidApi.get(`/sessions/${sessionId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dealer session details:', error);
    throw error;
  }
};

// Get eligible products for a session
export const getEligibleProducts = async (sessionId) => {
  try {
    const response = await reverseBidApi.get(`/sessions/${sessionId}/eligible-products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    throw error;
  }
};

// Submit a bid for a session
export const submitReverseBid = async (sessionId, bidData) => {
  try {
    const response = await reverseBidApi.post(`/sessions/${sessionId}/bids`, bidData);
    return response.data;
  } catch (error) {
    console.error('Error submitting bid:', error);
    throw error;
  }
};

// Revise an existing bid
export const reviseBid = async (bidId, bidData) => {
  try {
    const response = await reverseBidApi.patch(`/bids/${bidId}`, bidData);
    return response.data;
  } catch (error) {
    console.error('Error revising bid:', error);
    throw error;
  }
};

// Withdraw a bid
export const withdrawReverseBid = async (bidId) => {
  try {
    const response = await reverseBidApi.post(`/bids/${bidId}/withdraw`);
    return response.data;
  } catch (error) {
    console.error('Error withdrawing bid:', error);
    throw error;
  }
};

// Get dealer's bid history
export const getDealerBidHistory = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/dealer/bid-history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching bid history:', error);
    throw error;
  }
};

// ===== ADMIN API FUNCTIONS =====
// These endpoints require admin or sales_manager role

// Get all sessions (admin)
export const getAdminSessions = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/admin/sessions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin sessions:', error);
    throw error;
  }
};

// Get session details (admin)
export const getAdminSessionDetails = async (sessionId) => {
  try {
    const response = await reverseBidApi.get(`/admin/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin session details:', error);
    throw error;
  }
};

// Get session bids (admin)
export const getAdminSessionBids = async (sessionId) => {
  try {
    const response = await reverseBidApi.get(`/admin/sessions/${sessionId}/bids`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin session bids:', error);
    throw error;
  }
};

// Get dealer statistics (admin)
export const getAdminDealerStats = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/admin/dealers', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dealer stats:', error);
    throw error;
  }
};

// Get analytics (admin)
export const getAdminAnalytics = async (params = {}) => {
  try {
    const response = await reverseBidApi.get('/admin/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    throw error;
  }
};

// Export data (admin)
export const exportAdminData = async (type, format = 'csv', params = {}) => {
  try {
    const response = await reverseBidApi.get('/admin/export', {
      params: { type, format, ...params },
      responseType: format === 'csv' ? 'blob' : 'json',
      headers: format === 'csv' ? { 'Accept': 'text/csv' } : {}
    });
    
    // If CSV, return blob directly; if JSON, return data
    if (format === 'csv') {
      return response.data; // This is already a blob
    }
    
    return response.data;
  } catch (error) {
    console.error('Error exporting admin data:', error);
    throw error;
  }
};

// Get settings (admin)
export const getAdminSettings = async () => {
  try {
    const response = await reverseBidApi.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
};

// Update settings (admin)
export const updateAdminSettings = async (settings) => {
  try {
    const response = await reverseBidApi.post('/admin/settings', { settings });
    return response.data;
  } catch (error) {
    console.error('Error updating admin settings:', error);
    throw error;
  }
};

// Get real-time statistics (admin)
export const getAdminRealtimeStats = async () => {
  try {
    const response = await reverseBidApi.get('/admin/realtime-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin realtime stats:', error);
    throw error;
  }
};

// Close session manually (admin)
export const closeAdminSession = async (sessionId) => {
  try {
    const response = await reverseBidApi.post(`/admin/sessions/${sessionId}/close`);
    return response.data;
  } catch (error) {
    console.error('Error closing admin session:', error);
    throw error;
  }
};

export default api;