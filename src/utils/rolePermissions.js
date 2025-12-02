/**
 * Role-based access control utilities
 * Centralized permission checks for different user roles
 *
 * Usage Examples:
 *
 * // Import individual functions
 * import { canAccessDealerships, canAccessSalesManagers } from '@/utils/rolePermissions';
 *
 * // Use in component
 * const userRole = user?.role;
 * if (canAccessDealerships(userRole)) {
 *   // Show dealership management UI
 * }
 *
 * // Import all permissions at once
 * import { getUserPermissions } from '@/utils/rolePermissions';
 *
 * // Use in component
 * const permissions = getUserPermissions(userRole, user);
 * if (permissions.canAccessDealerships) {
 *   // Show dealership management UI
 * }
 *
 * // Check multiple roles
 * import { hasAnyRole, USER_ROLES } from '@/utils/rolePermissions';
 *
 * if (hasAnyRole(userRole, [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER])) {
 *   // User has admin or sales manager access
 * }
 */

// Define user roles
export const USER_ROLES = {
  ADMINISTRATOR: "administrator",
  SALES_MANAGER: "sales_manager",
  DEALER: "dealer",
  DEALER_USER: "dealer_user",
  DEALERSHIP_USER: "dealership_user",
};

/**
 * check if user can bid/pass on vehicle
 * @params {string} userRole - the user's role
 * @return {boolean} - Whether user can bid pass on vehicle
 */
export const canBidPass = (userRole) => {
    return userRole === USER_ROLES.DEALER_USER || userRole === USER_ROLES.DEALER || userRole === USER_ROLES.DEALERSHIP_USER;
};


/**
 * check if user can update delete dealerships
 * @params {string} userRole - the user's role
 * @return {boolean} - Whether user can update delete dealerships
 */
export const canUpdateDeleteDealerships = (userRole) => {
    return userRole === USER_ROLES.ADMINISTRATOR || userRole === USER_ROLES.SALES_MANAGER;
};


/**
 * Check if user can create dealership users
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can create dealership users
 */
export const canCreateDealershipUsers = (userRole) => {
  return userRole === USER_ROLES.DEALER;
};

/**
 * Check if user can delete update dealership users
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can create dealership users
 */
export const canDeleteUpdateDealershipUsers = (userRole) => {
    return userRole === USER_ROLES.DEALER || userRole === USER_ROLES.ADMINISTRATOR || userRole === USER_ROLES.SALES_MANAGER;
  };

/**
 * Check if user can access dealership users management
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access dealership users
 */
export const canAccessDealershipUsers = (userRole) => {
  return (
    userRole === USER_ROLES.ADMINISTRATOR ||
    userRole === USER_ROLES.SALES_MANAGER ||
    userRole === USER_ROLES.DEALER
  );
};

/**
 * Check if user can access dealerships management
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access dealerships
 */
export const canAccessDealerships = (userRole) => {
  return (
    userRole === USER_ROLES.SALES_MANAGER ||
    userRole === USER_ROLES.ADMINISTRATOR
  );
};

/**
 * Check if user can access invited dealerships
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access invited dealerships
 */
export const canAccessInvitedDealerships = (userRole) => {
  return (
    userRole === USER_ROLES.ADMINISTRATOR ||
    userRole === USER_ROLES.SALES_MANAGER
  );
};

/**
 * Check if user can access sales managers management
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access sales managers
 */
export const canAccessSalesManagers = (userRole) => {
  return userRole === USER_ROLES.ADMINISTRATOR;
};

/**
 * Check if user can access partner dealers
 * @param {string} userRole - The user's role
 * @param {Object} user - The user object (for additional checks like card details)
 * @returns {boolean} - Whether user can access partner dealers
 */
export const canAccessPartnerDealers = (userRole, user = null) => {
  // Basic role check
  //   const hasRoleAccess = userRole === USER_ROLES.DEALER;

  //   // Additional check for card details if user object is provided
  //   if (user && hasRoleAccess) {
  //     // Add your card details check here
  //     // Example: return hasRoleAccess && user.hasValidCard;
  //     return hasRoleAccess;
  //   }

  //   return hasRoleAccess;
  return userRole === USER_ROLES.DEALER;
};

/**
 * Check if user can access subscription cancellation requests
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access subscription cancellation requests
 */
export const canAccessSubscriptionCancellationRequest = (userRole) => {
  // Define which roles can access subscription cancellation requests
  return (
    userRole === USER_ROLES.ADMINISTRATOR ||
    userRole === USER_ROLES.SALES_MANAGER
  );
};

// ===== ADMIN REVERSE BIDDING ACCESS CONTROL FUNCTIONS =====

/**
 * Check if user can access admin reverse bidding pages
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access admin reverse bidding pages
 */
export const canAccessAdminReverseBidding = (userRole) => {
  return (
    userRole === USER_ROLES.ADMINISTRATOR ||
    userRole === USER_ROLES.SALES_MANAGER
  );
};

/**
 * Check if user can access admin sessions management
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access admin sessions
 */
export const canAccessAdminSessions = (userRole) => {
  return canAccessAdminReverseBidding(userRole);
};

/**
 * Check if user can access admin dealer statistics
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access admin dealer stats
 */
export const canAccessAdminDealerStats = (userRole) => {
  return canAccessAdminReverseBidding(userRole);
};

/**
 * Check if user can access admin analytics
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access admin analytics
 */
export const canAccessAdminAnalytics = (userRole) => {
  return canAccessAdminReverseBidding(userRole);
};

/**
 * Check if user can access admin settings
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access admin settings
 */
export const canAccessAdminSettings = (userRole) => {
  return canAccessAdminReverseBidding(userRole);
};

// ===== REPORT API ACCESS CONTROL FUNCTIONS =====

/**
 * Check if user can access dealer-level reports
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access dealer reports
 */
export const canAccessDealerReports = (userRole) => {
  return (
    userRole === USER_ROLES.DEALER ||
    userRole === USER_ROLES.DEALER_USER ||
    userRole === USER_ROLES.DEALERSHIP_USER ||
    userRole === USER_ROLES.ADMINISTRATOR ||
    userRole === USER_ROLES.SALES_MANAGER
  );
};

/**
 * Check if user can access sales manager & admin reports
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access sales manager reports
 */
export const canAccessSalesManagerReports = (userRole) => {
  return (
    userRole === USER_ROLES.ADMINISTRATOR ||
    userRole === USER_ROLES.SALES_MANAGER
  );
};

/**
 * Check if user can access admin-only reports
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access admin reports
 */
export const canAccessAdminReports = (userRole) => {
  return userRole === USER_ROLES.ADMINISTRATOR;
};

// ===== SPECIFIC REPORT API PERMISSIONS =====

/**
 * Check if user can access auction activity report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access auction activity report
 */
export const canAccessAuctionActivityReport = (userRole) => {
  return canAccessDealerReports(userRole);
};

/**
 * Check if user can access bid performance report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access bid performance report
 */
export const canAccessBidPerformanceReport = (userRole) => {
  return canAccessDealerReports(userRole);
};

/**
 * Check if user can access customer engagement report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access customer engagement report
 */
export const canAccessCustomerEngagementReport = (userRole) => {
  return canAccessDealerReports(userRole);
};

/**
 * Check if user can access appointments report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access appointments report
 */
export const canAccessAppointmentsReport = (userRole) => {
  return canAccessDealerReports(userRole);
};

/**
 * Check if user can access dashboard summary report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access dashboard summary report
 */
export const canAccessDashboardSummaryReport = (userRole) => {
  return canAccessDealerReports(userRole);
};

/**
 * Check if user can access dealer performance report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access dealer performance report
 */
export const canAccessDealerPerformanceReport = (userRole) => {
  return canAccessSalesManagerReports(userRole);
};

/**
 * Check if user can access user activity report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access user activity report
 */
export const canAccessUserActivityReport = (userRole) => {
  return canAccessSalesManagerReports(userRole);
};

/**
 * Check if user can access subscription revenue report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access subscription revenue report
 */
export const canAccessSubscriptionRevenueReport = (userRole) => {
  return canAccessSalesManagerReports(userRole);
};

/**
 * Check if user can access system performance report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access system performance report
 */
export const canAccessSystemPerformanceReport = (userRole) => {
  return canAccessAdminReports(userRole);
};

/**
 * Check if user can access feature usage report
 * @param {string} userRole - The user's role
 * @returns {boolean} - Whether user can access feature usage report
 */
export const canAccessFeatureUsageReport = (userRole) => {
  return canAccessAdminReports(userRole);
};

// ===== REPORT API MAPPING =====

/**
 * Report API to permission mapping
 * Maps each report API endpoint to its permission function
 */
export const REPORT_API_PERMISSIONS = {
  '/reports/auction-activity': canAccessAuctionActivityReport,
  '/reports/bid-performance': canAccessBidPerformanceReport,
  '/reports/customer-engagement': canAccessCustomerEngagementReport,
  '/reports/appointments': canAccessAppointmentsReport,
  '/reports/dashboard-summary': canAccessDashboardSummaryReport,
  '/reports/dealer-performance': canAccessDealerPerformanceReport,
  '/reports/user-activity': canAccessUserActivityReport,
  '/reports/subscription-revenue': canAccessSubscriptionRevenueReport,
  '/reports/system-performance': canAccessSystemPerformanceReport,
  '/reports/feature-usage': canAccessFeatureUsageReport,
};

/**
 * Check if user can access a specific report API
 * @param {string} userRole - The user's role
 * @param {string} reportEndpoint - The report API endpoint
 * @returns {boolean} - Whether user can access the report API
 */
export const canAccessReportAPI = (userRole, reportEndpoint) => {
  const permissionFunction = REPORT_API_PERMISSIONS[reportEndpoint];
  if (!permissionFunction) {
    console.warn(`No permission function found for report endpoint: ${reportEndpoint}`);
    return false;
  }
  return permissionFunction(userRole);
};

/**
 * Get all accessible report APIs for a user role
 * @param {string} userRole - The user's role
 * @returns {Array<string>} - Array of accessible report API endpoints
 */
export const getAccessibleReportAPIs = (userRole) => {
  return Object.keys(REPORT_API_PERMISSIONS).filter(endpoint => 
    canAccessReportAPI(userRole, endpoint)
  );
};

/**
 * Get report APIs by access level
 * @param {string} accessLevel - The access level ('dealer', 'sales_manager', 'admin')
 * @returns {Array<string>} - Array of report API endpoints for the access level
 */
export const getReportAPIsByAccessLevel = (accessLevel) => {
  const accessLevelMap = {
    'dealer': [
      '/reports/auction-activity',
      '/reports/bid-performance',
      '/reports/customer-engagement',
      '/reports/appointments',
      '/reports/dashboard-summary'
    ],
    'sales_manager': [
      '/reports/dealer-performance',
      '/reports/user-activity',
      '/reports/subscription-revenue'
    ],
    'admin': [
      '/reports/system-performance',
      '/reports/feature-usage'
    ]
  };
  
  return accessLevelMap[accessLevel] || [];
};

/**
 * Get all permissions for a user role
 * @param {string} userRole - The user's role
 * @param {Object} user - The user object (for additional checks)
 * @returns {Object} - Object containing all permission checks
 */
export const getUserPermissions = (userRole, user = null) => {
  return {
    // Existing permissions
    canUpdateDeleteDealerships: canUpdateDeleteDealerships(userRole),
    canCreateDealershipUsers: canCreateDealershipUsers(userRole),
    canDeleteUpdateDealershipUsers: canDeleteUpdateDealershipUsers(userRole),
    canAccessDealershipUsers: canAccessDealershipUsers(userRole),
    canAccessDealerships: canAccessDealerships(userRole),
    canAccessInvitedDealerships: canAccessInvitedDealerships(userRole),
    canAccessSalesManagers: canAccessSalesManagers(userRole),
    canAccessPartnerDealers: canAccessPartnerDealers(userRole, user),
    canAccessSubscriptionCancellationRequest: canAccessSubscriptionCancellationRequest(userRole),
    canBidPass: canBidPass(userRole),
    
    // Report access level permissions
    canAccessDealerReports: canAccessDealerReports(userRole),
    canAccessSalesManagerReports: canAccessSalesManagerReports(userRole),
    canAccessAdminReports: canAccessAdminReports(userRole),
    
    // Specific report API permissions
    canAccessAuctionActivityReport: canAccessAuctionActivityReport(userRole),
    canAccessBidPerformanceReport: canAccessBidPerformanceReport(userRole),
    canAccessCustomerEngagementReport: canAccessCustomerEngagementReport(userRole),
    canAccessAppointmentsReport: canAccessAppointmentsReport(userRole),
    canAccessDashboardSummaryReport: canAccessDashboardSummaryReport(userRole),
    canAccessDealerPerformanceReport: canAccessDealerPerformanceReport(userRole),
    canAccessUserActivityReport: canAccessUserActivityReport(userRole),
    canAccessSubscriptionRevenueReport: canAccessSubscriptionRevenueReport(userRole),
    canAccessSystemPerformanceReport: canAccessSystemPerformanceReport(userRole),
    canAccessFeatureUsageReport: canAccessFeatureUsageReport(userRole),
    
    // Admin reverse bidding permissions
    canAccessAdminReverseBidding: canAccessAdminReverseBidding(userRole),
    canAccessAdminSessions: canAccessAdminSessions(userRole),
    canAccessAdminDealerStats: canAccessAdminDealerStats(userRole),
    canAccessAdminAnalytics: canAccessAdminAnalytics(userRole),
    canAccessAdminSettings: canAccessAdminSettings(userRole),
  };
};

/**
 * Check if user has any of the specified roles
 * @param {string} userRole - The user's role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {boolean} - Whether user has any of the allowed roles
 */
export const hasAnyRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Check if user has all of the specified roles (for users with multiple roles)
 * @param {Array<string>} userRoles - The user's roles array
 * @param {Array<string>} requiredRoles - Array of required roles
 * @returns {boolean} - Whether user has all required roles
 */
export const hasAllRoles = (userRoles, requiredRoles) => {
  return requiredRoles.every((role) => userRoles.includes(role));
};

/**
 * URL to role mapping for route-based access control
 * Maps each protected route to the required roles
 */
export const ROUTE_PERMISSIONS = {
  // Dashboard routes - accessible by all authenticated users
  '/dashboard': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/live-auctions': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/live-sessions': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/reverse-bidding': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/reverse-bidding/session': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/won-sessions': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/my-reverse-bids': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/won-auctions': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/new-customers': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/appointments': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/my-bids': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/highest-bids': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/active-customers': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/inventory': [USER_ROLES.DEALER],
  '/reports': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/profile': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],
  '/vehicle-details': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER, USER_ROLES.DEALER_USER, USER_ROLES.DEALERSHIP_USER],

  // Dealership management routes - only for admins and sales managers
  '/dealerships': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
  '/invited-dealerships': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
  '/sales-managers': [USER_ROLES.ADMINISTRATOR],

  // Dealership user management routes - for admins, sales managers, and dealers
  '/dealership-users': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER, USER_ROLES.DEALER],

  // Subscription management routes - only for admins and sales managers
  '/subscription-cancellation-requests': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],

  // Partner dealers routes - only for dealers
  '/partner-dealers': [USER_ROLES.DEALER],

  // Admin reverse bidding routes - only for admins and sales managers
  '/admin/sessions': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
  '/admin/sessions/:id': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
  '/admin/dealer-stats': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
  '/admin/analytics': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
  '/admin/settings': [USER_ROLES.ADMINISTRATOR, USER_ROLES.SALES_MANAGER],
};

/**
 * Check if user can access a specific route
 * @param {string} userRole - The user's role
 * @param {string} routePath - The route path to check
 * @returns {boolean} - Whether user can access the route
 */
export const canAccessRoute = (userRole, routePath) => {
  // Handle dynamic routes (e.g., /vehicle-details/:id)
  const normalizedPath = routePath.replace(/\/\d+$/, ''); // Remove trailing numbers
  const basePath = routePath.split('/').slice(0, 2).join('/'); // Get base path like /vehicle-details
  
  // Check exact match first
  if (ROUTE_PERMISSIONS[routePath]) {
    return ROUTE_PERMISSIONS[routePath].includes(userRole);
  }
  
  // Check normalized path (for dynamic routes)
  if (ROUTE_PERMISSIONS[normalizedPath]) {
    return ROUTE_PERMISSIONS[normalizedPath].includes(userRole);
  }
  
  // Check base path (for nested dynamic routes)
  if (ROUTE_PERMISSIONS[basePath]) {
    return ROUTE_PERMISSIONS[basePath].includes(userRole);
  }
  
  // If route is not in permissions map, deny access by default
  return false;
};

/**
 * Get required roles for a specific route
 * @param {string} routePath - The route path to check
 * @returns {Array<string>} - Array of required roles for the route
 */
export const getRequiredRolesForRoute = (routePath) => {
  // Handle dynamic routes
  const normalizedPath = routePath.replace(/\/\d+$/, '');
  const basePath = routePath.split('/').slice(0, 2).join('/');
  
  return ROUTE_PERMISSIONS[routePath] || 
         ROUTE_PERMISSIONS[normalizedPath] || 
         ROUTE_PERMISSIONS[basePath] || 
         [];
};