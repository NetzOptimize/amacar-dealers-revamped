import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, User, Search, LogOut, Settings, ChevronDown, X as XIcon, Calendar, DollarSign, Gavel } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
// import { fetchDashboardSummary, selectDashboardSummary } from '../../../redux/slices/offersSlice';
import Sidebar from '../Sidebar/Sidebar';
import { useSearch } from '../../../context/SearchContext';
import BackToTop from '../../ui/BackToTop';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LogoutModal from '@/components/ui/LogoutUI/LogoutModal';
import { logoutUser } from '@/redux/slices/userSlice';
import { getDashboardActivity } from '../../../lib/api';

const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Search context
  const { searchQuery, setSearchQuery, isSearching, clearSearch, getSearchStats } = useSearch();

  // Placeholder user data for stateless version
  const userData = {
    firstName: user?.firstName || user?.first_name || '',
    lastName: user?.lastName || user?.last_name || '',
    email: user?.email || '',
  };

  // Placeholder dashboard summary data
  const dashboardSummary = {
    recent_activity: []
  };

  // Check if search bar should be hidden
  const shouldHideSearchBar = () => {
    return location.pathname === '/dashboard' || location.pathname === '/appointments' || location.pathname === '/profile' || location.pathname === '/car-details' || location.pathname === '/dealerships' || location.pathname === '/reports' || location.pathname === '/new-customers' || location.pathname === '/active-customers';
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false); // Close notifications if profile is opened
  };

  const toggleNotificationsDropdown = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false); // Close profile if notifications is opened
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    await dispatch(logoutUser());
    setTimeout(() => {
        navigate('/');
    }, 1000);
  };

  // Fetch notifications on component mount
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await getDashboardActivity(3);
      
      if (response.success && response.activities) {
        const formattedNotifications = response.activities.map((activity, index) => ({
          id: activity.data?.customer_id || index + 1,
          message: activity.message,
          time: getTimeAgo(activity.timestamp),
          type: activity.type,
          icon: getActivityIcon(activity.type)
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Keep empty array on error
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        notificationsRef.current && !notificationsRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get appropriate icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_customer':
        return User;
      case 'bid':
        return DollarSign;
      case 'auction':
        return Gavel;
      case 'appointment':
        return Calendar;
      default:
        return Bell;
    }
  };

  // Get real user profile data
  const profileData = {
    name: userData ? `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}`.trim() || 'User' : 'User',
    email: userData?.email || '',
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Mobile Header */}
      <div className="lg:hidden h-20 fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-neutral-600" /> : <Menu className="w-5 h-5 text-neutral-600" />}
          </button>

          <Link to="/" className="flex items-center">
            <img 
              src="https://dealer.amacar.ai/wp-content/uploads/2024/10/logo-4-2048x680.png" 
              alt="Amacar Logo" 
              className="h-8 w-auto object-contain hover:opacity-80 transition-opacity duration-200"
            />
          </Link>

          <div className="relative" ref={notificationsRef}>
            <button
              onClick={toggleNotificationsDropdown}
              className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <Bell className="w-5 h-5 text-neutral-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              )}
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-neutral-50 to-white px-4 py-3 border-b border-neutral-200">
                    <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="px-4 py-8 text-center">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-neutral-500">Loading notifications...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => {
                        const IconComponent = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className="px-4 py-3 hover:bg-primary-50 transition-colors duration-200 border-b border-neutral-100 last:border-b-0"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'new_customer' ? 'bg-blue-100' :
                                notification.type === 'bid' ? 'bg-emerald-100' :
                                  notification.type === 'auction' ? 'bg-orange-100' :
                                    notification.type === 'appointment' ? 'bg-purple-100' :
                                      'bg-gray-100'
                                }`}>
                                <IconComponent className={`w-4 h-4 ${notification.type === 'new_customer' ? 'text-blue-600' :
                                  notification.type === 'bid' ? 'text-emerald-600' :
                                    notification.type === 'auction' ? 'text-orange-600' :
                                      notification.type === 'appointment' ? 'text-purple-600' :
                                        'text-gray-600'
                                  }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-neutral-800">{notification.message}</p>
                                <p className="text-xs text-neutral-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-sm text-neutral-500">No recent activity</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={toggleMobileMenu}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white">
            <Sidebar
              isCollapsed={false}
              onToggle={toggleMobileMenu}
            />
          </div>
        </div>
      )}

      {/* Main Content with Header */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          } pt-16 lg:pt-0`}
      >
        {/* Desktop Header */}
        <div className={`fixed top-0 right-0 z-40 hidden h-20 lg:block bg-white border-b border-neutral-200 shadow-md transition-all duration-300 vehicle-details-header ${isSidebarCollapsed ? 'left-16' : 'left-64'}`}>
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white to-neutral-50">
            {/* Left Side: Search Bar - Hidden on dashboard and appointments pages */}
            {!shouldHideSearchBar() && (
              <div className="flex items-center flex-1 max-w-lg">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search car names..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{ background: 'linear-gradient(145deg, #ffffff, #f8fafc)' }}
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-500" />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full transition-colors duration-200"
                    >
                      <XIcon className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Side: Icons */}
            <div className={`flex items-center space-x-3 ${shouldHideSearchBar() ? 'ml-auto' : ''}`}>
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={toggleNotificationsDropdown}
                  className="cursor-pointer relative p-2.5 bg-neutral-50 rounded-full hover:bg-primary-50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Bell className="w-5 h-5 text-neutral-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border border-white"></span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-neutral-50 to-white px-4 py-3 border-b border-neutral-200">
                        <h3 className="text-sm font-semibold text-neutral-800">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="px-4 py-8 text-center">
                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-neutral-500">Loading notifications...</p>
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => {
                            const IconComponent = notification.icon;
                            return (
                              <div
                                key={notification.id}
                                className="px-4 py-3 hover:bg-primary-50 transition-colors duration-200 border-b border-neutral-100 last:border-b-0"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'new_customer' ? 'bg-blue-100' :
                                    notification.type === 'bid' ? 'bg-emerald-100' :
                                      notification.type === 'auction' ? 'bg-orange-100' :
                                        notification.type === 'appointment' ? 'bg-purple-100' :
                                          'bg-gray-100'
                                    }`}>
                                    <IconComponent className={`w-4 h-4 ${notification.type === 'new_customer' ? 'text-blue-600' :
                                      notification.type === 'bid' ? 'text-emerald-600' :
                                        notification.type === 'auction' ? 'text-orange-600' :
                                          notification.type === 'appointment' ? 'text-purple-600' :
                                            'text-gray-600'
                                      }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-800">{notification.message}</p>
                                    <p className="text-xs text-neutral-500 mt-1">{notification.time}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                            <p className="text-sm text-neutral-500">No recent activity</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="cursor-pointer p-2.5 bg-neutral-50 rounded-full hover:bg-primary-50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                >
                  <User className="w-5 h-5 text-neutral-600" />
                  <ChevronDown className="w-4 h-4 text-neutral-600 ml-1" />
                </button>
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 z-50 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-neutral-50 to-white px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-semibold text-neutral-800">{userData.firstName} {userData.lastName}</p>
                        <p className="text-xs text-neutral-500 truncate">{profileData.email}</p>
                      </div>
                      <div className="py-1">
                        <Link onClick={() => setIsProfileOpen(false)} to={'/profile'} className="w-full px-4 py-2 text-sm text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={handleLogoutClick}
                          className="cursor-pointer w-full px-4 py-2 text-sm text-neutral-600 hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-screen">
          {children}
        </div>

        {/* Back to Top Button */}
        <BackToTop />
      </motion.main>

      {/* Logout Modal - Commented out for stateless version */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default DashboardLayout;