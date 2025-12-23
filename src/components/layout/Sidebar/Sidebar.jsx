import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Car,
  User,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  LogOut,
  Award,
  UserPlus,
  CalendarCheck,
  ShoppingCart,
  Users,
  Home,
  BarChart,
  ArrowUp,
  UserPlus2,
  TrendingDown,
  Gavel,
  Trophy,
  Settings,
  Activity,
  BarChart3,
  Warehouse
} from 'lucide-react';
import { logoutUser } from '@/redux/slices/userSlice';
import LogoutModal from '@/components/ui/LogoutUI/LogoutModal';
import DeactivationWarningModal from '@/components/ui/DeactivationWarningModal';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPermissions } from '@/utils/rolePermissions';
// import Modal from '@/components/ui/modal';
// import LogoutModal from '@/components/ui/LogoutModal';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutUser } from '@/redux/slices/userSlice';
// import { persistor } from '@/redux/store';
// import { AuthContext } from '@/contexts/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [deactivationWarningOpen, setDeactivationWarningOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  // const { logout } = useContext(AuthContext);

  // Placeholder user data for stateless version
  const userData = {
    firstName: user?.firstName || user?.first_name || '',
    lastName: user?.lastName || user?.last_name || '',
    email: user?.email || '',
  };

  // Get user permissions using the centralized utility
  const userRole = user?.role;
  const permissions = getUserPermissions(userRole, user);
  const {
    canAccessDealershipUsers,
    canAccessDealerships,
    canAccessInvitedDealerships,
    canAccessSalesManagers,
    canAccessPartnerDealers,
    canAccessSubscriptionCancellationRequest,
    canAccessAdminReverseBidding
  } = permissions;

  // Check if user should show warning modal and get warning type
  const getWarningInfo = () => {
    if (!user) return { show: false, type: null };

    // Check if user role is one of the specified roles
    const validRoles = ['dealer', 'sales_manager', 'dealer_user', 'dealership_user', 'administrator'];
    const hasValidRole = validRoles.includes(user.role) ||
      (user.roles && user.roles.some(role => validRoles.includes(role)));

    if (!hasValidRole) return { show: false, type: null };

    // Check account status
    const isAccountInactive = user.user_status_details?.account_status === "inactive";
    const isSubscriptionInactive = user.subscription_status === "inactive";

    if (isAccountInactive) {
      return { show: true, type: "account" };
    } else if (isSubscriptionInactive) {
      return { show: true, type: "subscription" };
    }

    return { show: false, type: null };
  };

  // Handle navigation with deactivation check
  const handleNavigation = (href, e) => {
    // If user should show warning and trying to navigate to non-profile page
    const warningInfo = getWarningInfo();
    if (warningInfo.show && href !== '/profile') {
      e.preventDefault();
      setDeactivationWarningOpen(true);
      return;
    }

    // Normal navigation
    navigate(href);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Auctions', href: '/live-auctions', icon: TrendingUp },
    { name: 'Live Sessions', href: '/reverse-bidding', icon: TrendingDown },
    { name: 'Won Sessions', href: '/won-sessions', icon: Trophy },
    { name: 'My Reverse Bids', href: '/my-reverse-bids', icon: Gavel },
    { name: 'Won Auctions', href: '/won-auctions', icon: Award },
    { name: 'New customers', href: '/active-customers', icon: Users },
    // { name: 'New Customers', href: '/new-customers', icon: UserPlus  },
    { name: 'Appointments', href: '/appointments', icon: CalendarCheck },
    { name: 'My bids', href: '/my-bids', icon: ShoppingCart },
    { name: 'Highest Bids', href: '/highest-bids', icon: ArrowUp },
    { name: 'Active Customers', href: '/new-customers', icon: UserPlus },
    // { name: 'Active customers', href: '/active-customers', icon: Users },
    ...(userRole === 'dealer' ? [{ name: 'My inventory', href: '/inventory', icon: Warehouse }] : []),
    ...((userRole === 'administrator' || userRole === 'sales_manager') ? [{ name: 'Inventory', href: '/inventory', icon: Warehouse }] : []),
    ...(canAccessDealershipUsers ? [{ name: 'Dealership users', href: '/dealership-users', icon: UserPlus2 }] : []),
    ...(canAccessDealerships ? [{ name: 'DealerShips', href: '/dealerships', icon: Home }] : []),
    ...(canAccessInvitedDealerships ? [{ name: 'Invited Dealerships', href: '/invited-dealerships', icon: UserPlus }] : []),
    ...(canAccessSalesManagers ? [{ name: 'Sales managers', href: '/sales-managers', icon: User }] : []),
    ...(canAccessPartnerDealers ? [{ name: 'Partners', href: '/partner-dealers', icon: User }] : []),
    ...(canAccessSubscriptionCancellationRequest ? [{ name: 'Subscription Cancellation Requests', href: '/subscription-cancellation-requests', icon: User }] : []),

    // Conditionally include DealerShips based on user role
    { name: 'Reports', href: '/reports', icon: BarChart },

    // Admin Reverse Bidding Pages
    ...(canAccessAdminReverseBidding ? [
      { name: 'Admin Sessions', href: '/admin/sessions', icon: Activity },
      { name: 'Dealer Statistics', href: '/admin/dealer-stats', icon: BarChart3 },
      { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
      { name: 'System Settings', href: '/admin/settings', icon: Settings }
    ] : []),

  ];

  const handleConfirmLogout = async () => {
    // await persistor.purge();
    await dispatch(logoutUser());
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const bottomNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    {
      name: 'Logout',
      icon: LogOut,
      action: () => setLogoutModalOpen(true),
    }
  ];

  // Check if screen is mobile/tablet (less than 1024px)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-close sidebar on mobile/tablet when navigating to dashboard pages
  useEffect(() => {
    // Only auto-close if:
    // 1. On mobile/tablet
    // 2. Sidebar is currently open
    // 3. Path actually changed (not just initial load)
    // 4. Not a manual toggle
    if (isMobile && !isCollapsed && prevPathRef.current !== location.pathname && !isManualToggle) {
      // Check if current path is a dashboard page
      const dashboardPages = ['/dashboard', '/live-sessions', '/live-auctions', '/reverse-bidding', '/won-sessions', '/my-reverse-bids', '/won-auctions', '/new-customers', '/active-customers', '/inventory', '/my-bids', '/appointments', '/highest-bids', '/dealership-users', '/partner-dealers', '/reports', '/profile', '/sales-managers', '/subscription-cancellation-requests', '/dealerships', '/invited-dealerships'];
      const isDashboardPage = dashboardPages.some(page => location.pathname.startsWith(page));

      if (isDashboardPage) {
        // Add a small delay to make the navigation feel more natural
        const timer = setTimeout(() => {
          onToggle();
        }, 150);

        return () => clearTimeout(timer);
      }
    }

    // Update previous path
    prevPathRef.current = location.pathname;

    // Reset manual toggle flag after a short delay
    if (isManualToggle) {
      const timer = setTimeout(() => {
        setIsManualToggle(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isMobile, isCollapsed, onToggle, isManualToggle]);

  const containerVariants = {
    open: { width: '16rem', transition: { type: 'spring', stiffness: 200, damping: 25 } },
    closed: { width: '4rem', transition: { type: 'spring', stiffness: 200, damping: 25 } }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    closed: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  return (
    <>
      <div>
        <motion.aside
          variants={containerVariants}
          animate={isCollapsed ? 'closed' : 'open'}
          className="fixed left-0 top-0 bottom-0 bg-white border-r border-neutral-200 z-[41] shadow-sm overflow-visible max-h-screen"
        >
          {/* Toggle Button - Fixed position */}
          <button
            onClick={() => {
              setIsManualToggle(true);
              onToggle();
            }}
            className={`cursor-pointer hidden lg:block absolute top-16 z-[51] p-1.5 bg-white border border-neutral-200 rounded-sm shadow-sm hover:bg-neutral-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-200 ${isCollapsed ? 'right-[-12px]' : 'right-[-12px]'
              }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-neutral-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-neutral-600" />
            )}
          </button>
          <div className="flex flex-col h-full relative overflow-auto  max-h-screen">
            {/* Top Section: Logo */}
            <div className="flex items-center px-4 py-6 border-b border-neutral-200">
              <Link to="/" className="flex items-center mr-8">
                {isCollapsed ? (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary-600" />
                  </div>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      variants={itemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                    >
                      <img
                        className="h-8 w-auto max-w-[120px]"
                        src="https://dealer.amacar.ai/wp-content/uploads/2024/10/logo-4-2048x680.png"
                        alt="Amacar Logo"
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 mt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <div key={item.name}>
                    {item.action ? (
                      <button
                        onClick={item.action}
                        className={`cursor-pointer group text-start flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 w-full ${isActive
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              variants={itemVariants}
                              initial="closed"
                              animate="open"
                              exit="closed"
                              className="flex-1"
                            >
                              <span className="text-sm font-medium">{item.name}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={(e) => handleNavigation(item.href, e)}
                        className={`group flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'text-neutral-600 hover:text-primary-600 hover:bg-primary-50'
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              variants={itemVariants}
                              initial="closed"
                              animate="open"
                              exit="closed"
                              className="flex-1"
                            >
                              <span className="text-sm font-medium">{item.name}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Bottom Navigation */}
            <div className="p-4 border-t border-neutral-200 space-y-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.href && location.pathname === item.href;

                if (item.action) {
                  return (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className="cursor-pointer group flex items-center space-x-2 py-2 rounded-lg text-neutral-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 w-full"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            variants={itemVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="text-sm font-medium"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`group flex items-center space-x-2 py-2 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-primary-100 text-primary-700 font-semibold"
                      : "text-neutral-600 hover:text-primary-600 hover:bg-primary-50"
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          variants={itemVariants}
                          initial="closed"
                          animate="open"
                          exit="closed"
                          className="text-sm font-medium"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>

            {/* User Info */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="p-4 border-t border-neutral-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {userData?.firstName && userData?.lastName
                          ? `${userData.firstName} ${userData.lastName}`
                          : userData?.first_name && userData?.last_name
                            ? `${userData.first_name} ${userData.last_name}`
                            : 'User Profile'
                        }
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {userData?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      </div>

      {/* Add Vehicle Modal - Commented out for stateless version */}
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Your Vehicle"
        description="Enter your vehicle details to start the auction process"
      /> */}

      {/* Logout Modal - Commented out for stateless version */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Deactivation Warning Modal */}
      <DeactivationWarningModal
        isOpen={deactivationWarningOpen}
        onClose={() => setDeactivationWarningOpen(false)}
        warningType={getWarningInfo().type}
      />
    </>
  );
};

export default Sidebar;