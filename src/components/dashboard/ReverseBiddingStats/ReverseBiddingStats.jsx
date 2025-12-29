import { motion } from 'framer-motion';
import { 
  Gavel, 
  DollarSign, 
  Clock, 
  TrendingDown, 
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import StatsCard from '../../common/StatsCard/StatsCard';
import { getDealerSessions, getMyReverseBids } from '@/lib/api';

const ReverseBiddingStats = () => {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch reverse bidding stats
  const fetchReverseBiddingStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both sessions and my-bids in parallel
      const [sessionsResponse, bidsResponse] = await Promise.all([
        getDealerSessions(),
        getMyReverseBids({ page: 1, per_page: 5 })
      ]);

      // Process sessions data - API returns response.data directly
      console.log('ReverseBiddingStats - Raw sessionsResponse:', sessionsResponse);
      console.log('ReverseBiddingStats - Raw bidsResponse:', bidsResponse);
      
      // Extract sessions array from response
      let sessions = [];
      if (Array.isArray(sessionsResponse)) {
        sessions = sessionsResponse;
      } else if (sessionsResponse?.success && Array.isArray(sessionsResponse.data)) {
        sessions = sessionsResponse.data;
      } else if (sessionsResponse?.data?.data && Array.isArray(sessionsResponse.data.data)) {
        sessions = sessionsResponse.data.data;
      } else if (sessionsResponse?.data && Array.isArray(sessionsResponse.data)) {
        sessions = sessionsResponse.data;
      } else if (sessionsResponse?.data && typeof sessionsResponse.data === 'object' && sessionsResponse.data.id) {
        // Single session object - wrap in array
        sessions = [sessionsResponse.data];
      } else if (sessionsResponse && typeof sessionsResponse === 'object' && sessionsResponse.id) {
        // Single session object at root level
        sessions = [sessionsResponse];
      }
      
      // Extract bids array from response
      let bids = [];
      if (Array.isArray(bidsResponse)) {
        bids = bidsResponse;
      } else if (bidsResponse?.success && Array.isArray(bidsResponse.data)) {
        bids = bidsResponse.data;
      } else if (bidsResponse?.data?.data && Array.isArray(bidsResponse.data.data)) {
        bids = bidsResponse.data.data;
      } else if (bidsResponse?.data && Array.isArray(bidsResponse.data)) {
        bids = bidsResponse.data;
      } else if (bidsResponse?.data && typeof bidsResponse.data === 'object' && bidsResponse.data.id) {
        // Single bid object - wrap in array
        bids = [bidsResponse.data];
      } else if (bidsResponse && typeof bidsResponse === 'object' && bidsResponse.id) {
        // Single bid object at root level
        bids = [bidsResponse];
      }
      
      console.log('ReverseBiddingStats - Processed Sessions:', sessions, 'Count:', sessions.length);
      console.log('ReverseBiddingStats - Processed Bids:', bids, 'Count:', bids.length);
      
      // Calculate stats from sessions
      const liveSessions = sessions.filter(s => s.status === 'live' || s.status === 'active').length;
      const totalSessions = sessions.length;
      const closedSessions = sessions.filter(s => s.status === 'closed' || s.status === 'completed').length;
      
      // Calculate stats from bids
      const totalBids = bids.length;
      const activeBids = bids.filter(b => b.status === 'active' || b.status === 'pending').length;
      const wonBids = bids.filter(b => b.status === 'won' || b.is_winner).length;
      const lostBids = bids.filter(b => b.status === 'lost' || b.status === 'rejected').length;
      
      // Build stats array
      const calculatedStats = [
        {
          title: 'Live Sessions',
          value: liveSessions,
          change: '0%',
          icon: Gavel
        },
        {
          title: 'Total Sessions',
          value: totalSessions,
          change: '0%',
          icon: TrendingDown
        },
        {
          title: 'Active Bids',
          value: activeBids,
          change: '0%',
          icon: DollarSign
        },
        {
          title: 'Total Bids',
          value: totalBids,
          change: '0%',
          icon: Clock
        },
        {
          title: 'Won Bids',
          value: wonBids,
          change: '0%',
          icon: CheckCircle2
        }
      ];
      
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching reverse bidding stats:', err);
      setError(err.message || 'Failed to fetch reverse bidding stats');
      setStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReverseBiddingStats();
  }, [fetchReverseBiddingStats]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-3 sm:h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-6 sm:h-8 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-4 sm:h-6 bg-neutral-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
        <div className="text-red-600 mb-2">
          <XCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold">Failed to load reverse bidding stats</h3>
          <p className="text-xs sm:text-sm text-red-500 mt-1">{error}</p>
        </div>
        <button 
          onClick={fetchReverseBiddingStats}
          disabled={isLoading}
          className="mt-3 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto text-sm sm:text-base"
        >
          <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Retrying...' : 'Retry'}
        </button>
      </div>
    );
  }

  // Empty state
  if (stats.length === 0) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 sm:p-6 text-center">
        <div className="text-neutral-600">
          <Gavel className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
          <h3 className="text-sm sm:text-base font-semibold">No reverse bidding data available</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Stats will appear here once data is available.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={`${stat.title}-${index}`}
          variants={cardVariants}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <StatsCard
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ReverseBiddingStats;

