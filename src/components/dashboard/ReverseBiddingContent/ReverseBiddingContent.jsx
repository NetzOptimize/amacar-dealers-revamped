import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { getDealerSessions, getMyReverseBids } from '@/lib/api';
import { 
  Gavel, 
  Clock, 
  DollarSign, 
  TrendingDown,
  RefreshCw,
  Eye,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import ReverseBiddingStats from '../ReverseBiddingStats/ReverseBiddingStats';

const ReverseBiddingContent = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reverse bidding data
  const fetchReverseBiddingData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both sessions and my-bids in parallel
      const [sessionsResponse, bidsResponse] = await Promise.all([
        getDealerSessions(),
        getMyReverseBids({ page: 1, per_page: 5 })
      ]);

      // Process sessions data - API returns response.data directly
      console.log('ReverseBiddingContent - Raw sessionsResponse:', sessionsResponse);
      console.log('ReverseBiddingContent - Raw bidsResponse:', bidsResponse);
      
      // Extract sessions array from response
      let sessionsArray = [];
      if (Array.isArray(sessionsResponse)) {
        sessionsArray = sessionsResponse;
      } else if (sessionsResponse?.success && Array.isArray(sessionsResponse.data)) {
        sessionsArray = sessionsResponse.data;
      } else if (sessionsResponse?.data?.data && Array.isArray(sessionsResponse.data.data)) {
        sessionsArray = sessionsResponse.data.data;
      } else if (sessionsResponse?.data && Array.isArray(sessionsResponse.data)) {
        sessionsArray = sessionsResponse.data;
      } else if (sessionsResponse?.data && typeof sessionsResponse.data === 'object' && sessionsResponse.data.id) {
        // Single session object - wrap in array
        sessionsArray = [sessionsResponse.data];
      } else if (sessionsResponse && typeof sessionsResponse === 'object' && sessionsResponse.id) {
        // Single session object at root level
        sessionsArray = [sessionsResponse];
      }
      
      // Extract bids array from response
      let bidsArray = [];
      if (Array.isArray(bidsResponse)) {
        bidsArray = bidsResponse;
      } else if (bidsResponse?.success && Array.isArray(bidsResponse.data)) {
        bidsArray = bidsResponse.data;
      } else if (bidsResponse?.data?.data && Array.isArray(bidsResponse.data.data)) {
        bidsArray = bidsResponse.data.data;
      } else if (bidsResponse?.data && Array.isArray(bidsResponse.data)) {
        bidsArray = bidsResponse.data;
      } else if (bidsResponse?.data && typeof bidsResponse.data === 'object' && bidsResponse.data.id) {
        // Single bid object - wrap in array
        bidsArray = [bidsResponse.data];
      } else if (bidsResponse && typeof bidsResponse === 'object' && bidsResponse.id) {
        // Single bid object at root level
        bidsArray = [bidsResponse];
      }
      
      console.log('ReverseBiddingContent - Processed Sessions:', sessionsArray, 'Count:', sessionsArray.length);
      console.log('ReverseBiddingContent - Processed Bids:', bidsArray, 'Count:', bidsArray.length);
      
      // Sort sessions by created_at or updated_at (most recent first)
      const sortedSessions = sessionsArray
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB - dateA;
        })
        .slice(0, 6); // Show top 6
      
      // Sort bids by created_at (most recent first)
      const sortedBids = bidsArray
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.submitted_at || 0);
          const dateB = new Date(b.created_at || b.submitted_at || 0);
          return dateB - dateA;
        });
      
      setSessions(sortedSessions);
      setBids(sortedBids);
    } catch (err) {
      console.error('Error fetching reverse bidding data:', err);
      setError(err.message || 'Failed to fetch reverse bidding data');
      setSessions([]);
      setBids([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReverseBiddingData();
  }, [fetchReverseBiddingData]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'live' || statusLower === 'active') {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Live</Badge>;
    }
    if (statusLower === 'closed' || statusLower === 'completed') {
      return <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">Closed</Badge>;
    }
    if (statusLower === 'won' || statusLower === 'winner') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Won</Badge>;
    }
    if (statusLower === 'lost' || statusLower === 'rejected') {
      return <Badge className="bg-red-100 text-red-700 border-red-200">Lost</Badge>;
    }
    return <Badge className="bg-neutral-100 text-neutral-700 border-neutral-200">{status || 'Pending'}</Badge>;
  };

  // Format time remaining
  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return 'N/A';
    
    // If it's already a string, return it
    if (typeof timeRemaining === 'string') return timeRemaining;
    
    // If it's an object (from API)
    if (typeof timeRemaining === 'object') {
      // Check if expired
      if (timeRemaining.expired === true) {
        return 'Expired';
      }
      
      // Use formatted time if available
      if (timeRemaining.formatted) {
        return timeRemaining.formatted;
      }
      
      // Calculate from seconds if available
      if (timeRemaining.seconds !== undefined) {
        const hours = Math.floor(timeRemaining.seconds / 3600);
        const minutes = Math.floor((timeRemaining.seconds % 3600) / 60);
        const seconds = timeRemaining.seconds % 60;
        
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
          return `${minutes}m ${seconds}s`;
        } else {
          return `${seconds}s`;
        }
      }
      
      return 'N/A';
    }
    
    // Fallback
    return 'N/A';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Stats Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 animate-pulse">
              <div className="space-y-3">
                <div className="h-3 sm:h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-6 sm:h-8 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sessions Loading */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-neutral-50 rounded-xl p-4 animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-red-900 mb-1">Failed to load reverse bidding data</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button
          onClick={fetchReverseBiddingData}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2 mx-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Section */}
      <motion.div variants={sectionVariants}>
        <ReverseBiddingStats />
      </motion.div>

      {/* Recent Sessions Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6"
        variants={sectionVariants}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">Recent Sessions</h2>
            <p className="text-sm sm:text-base text-neutral-600">Latest reverse bidding sessions</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-medium hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 w-full sm:w-auto"
            onClick={() => navigate('/reverse-bidding/sessions')}
          >
            View All Sessions
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
            <Gavel className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-700 mb-1">No sessions available</h3>
            <p className="text-xs text-neutral-500">Recent sessions will appear here once data is available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sessions.map((session, index) => {
              const vehicleImage = session.primary_vehicle_image;
              const make = session.criteria?.make || '';
              const model = session.criteria?.model || '';
              const year = session.criteria?.year || '';
              const price = session.criteria?.price || '';
              const customerName = session.customer_contact?.name || session.customer_name || '';
              const customerPhone = session.customer_contact?.phone || '';
              
              return (
                <motion.div
                  key={session.id || index}
                  className="bg-white rounded-xl border border-neutral-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => session.id && navigate(`/reverse-bidding/session/${session.id}`)}
                >
                  {/* Vehicle Image */}
                  {vehicleImage && (
                    <div className="relative h-40 bg-neutral-100 overflow-hidden">
                      <img 
                        src={vehicleImage} 
                        alt={`${year} ${make} ${model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(session.status)}
                      </div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-4">
                    {/* Vehicle Info */}
                    {(make || model || year) && (
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-neutral-900 mb-1">
                          {year} {make} {model}
                        </h3>
                        {price && (
                          <p className="text-sm font-medium text-primary-600">
                            {formatCurrency(parseFloat(price))}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Customer Info */}
                    {(customerName || customerPhone) && (
                      <div className="mb-3 pb-3 border-b border-neutral-100">
                        {customerName && (
                          <p className="text-sm font-medium text-neutral-700 mb-1">
                            {customerName}
                          </p>
                        )}
                        {customerPhone && (
                          <p className="text-xs text-neutral-500">
                            {customerPhone}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* Session Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Session #{session.id || 'N/A'}</span>
                        {session.time_remaining && (
                          <div className="flex items-center gap-1.5 text-neutral-600">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeRemaining(session.time_remaining)}</span>
                          </div>
                        )}
                      </div>
                      {(session.total_bids !== undefined || session.total_bids === 0) && (
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Gavel className="w-3 h-3" />
                          <span>{session.total_bids || 0} bids</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Bids Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6"
        variants={sectionVariants}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">Recent Bids</h2>
            <p className="text-sm sm:text-base text-neutral-600">Your latest reverse bidding activity</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer px-4 sm:px-8 py-2 sm:py-3 text-xs sm:text-sm font-medium hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 w-full sm:w-auto"
            onClick={() => navigate('/reverse-bidding/my-bids')}
          >
            View All Bids
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
          </Button>
        </div>

        {bids.length === 0 ? (
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center">
            <DollarSign className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-700 mb-1">No bids available</h3>
            <p className="text-xs text-neutral-500">Recent bids will appear here once data is available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map((bid, index) => {
              const bidId = bid.bid_id || bid.id;
              const dealershipName = bid.dealer_info?.dealership_name || '';
              const dealerName = bid.dealer_info?.dealer_name || '';
              const amount = bid.amount || bid.price || 0;
              const createdAt = bid.created_at;
              const sessionId = bid.session_id;
              
              return (
                <motion.div
                  key={bidId || index}
                  className="bg-white rounded-xl p-4 border border-neutral-200 hover:shadow-lg hover:border-primary-300 transition-all duration-300 cursor-pointer group"
                  whileHover={{ x: 4, scale: 1.01 }}
                  onClick={() => sessionId && navigate(`/reverse-bidding/session/${sessionId}`)}
                >
                  <div className="flex items-start justify-between">
                    {/* Left Section */}
                    <div className="flex-1 min-w-0">
                      {/* Bid ID and Status */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          Bid #{bidId}
                        </h3>
                        {getStatusBadge(bid.status)}
                      </div>
                      
                      {/* Dealership and Dealer Info */}
                      {(dealershipName || dealerName) && (
                        <div className="mb-2">
                          {dealershipName && (
                            <p className="text-sm font-medium text-neutral-700 mb-0.5">
                              {dealershipName}
                            </p>
                          )}
                          {dealerName && (
                            <p className="text-xs text-neutral-500">
                              {dealerName}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Session ID */}
                      {sessionId && (
                        <p className="text-xs text-neutral-500">
                          Session #{sessionId}
                        </p>
                      )}
                    </div>
                    
                    {/* Right Section - Amount and Date */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-base font-bold text-green-600 mb-1">
                        {formatCurrency(amount)}
                      </p>
                      {createdAt && (
                        <p className="text-xs text-neutral-500">
                          {new Date(createdAt).toLocaleDateString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                      {bid.position && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                            Rank #{bid.position}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ReverseBiddingContent;

