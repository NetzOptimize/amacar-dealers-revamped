import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessRoute, getRequiredRolesForRoute } from '@/utils/rolePermissions';

function PrivateRoute({ children }) {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const expiration = localStorage.getItem('authExpiration');
  const isExpired = expiration && Date.now() > parseInt(expiration);
  
  useEffect(() => {
    console.log("user", user);
  }, [user]);

  // Check if user is authenticated
  if (!user || isExpired) {
    return <Navigate to="/" replace />;
  }

  // Check if user has restricted access (pending, rejected, inactive account, or inactive subscription)
  if (user) {
    const userStatus = user.user_status_details?.status;
    const isAccountInactive = user.user_status_details?.account_status === "inactive";
    const isSubscriptionInactive = user.subscription_status === "inactive";
    
    // Check if user has any restriction
    const hasRestriction = userStatus === "pending" || 
                          userStatus === "rejected" || 
                          isAccountInactive || 
                          isSubscriptionInactive;
    
    if (hasRestriction) {
      // Allow restricted users to access the profile page to see their status
      if (location.pathname === "/profile") {
        return children;
      }
      // For other pages, redirect to profile (the modal will be shown by Sidebar)
      return <Navigate to="/profile" replace/>;
    }
  }
  
  const userRole = user?.role;
  const currentPath = location.pathname;


  // Check if user has permission to access the current route
  if (!canAccessRoute(userRole, currentPath)) {
    const requiredRoles = getRequiredRolesForRoute(currentPath);
    return (
      <Navigate 
        to="/unauthorized" 
        replace 
        state={{ 
          requiredRole: requiredRoles.length > 0 ? requiredRoles.join(' or ') : 'Unknown',
          userRole: userRole,
          attemptedPath: currentPath
        }} 
      />
    );
  }

  return children;
}

export default PrivateRoute;