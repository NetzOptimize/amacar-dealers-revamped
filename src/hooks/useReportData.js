import { useState, useEffect, useCallback } from 'react';
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

// API mapping configuration based on available endpoints
const API_MAPPING = {
  'Auction Activity': {
    api: 'getAuctionActivityReport',
    dataKey: 'data',
    chartTypes: ['bar', 'line', 'insights']
  },
  'Bid Performance': {
    api: 'getBidPerformanceReport',
    dataKey: 'data',
    chartTypes: ['line', 'bar', 'insights']
  },
  'Customer Engagement': {
    api: 'getCustomerEngagementReport',
    dataKey: 'data',
    chartTypes: ['bar', 'pie', 'insights']
  },
  'Appointments': {
    api: 'getAppointmentsReport',
    dataKey: 'data',
    chartTypes: ['bar', 'line', 'insights']
  },
  'Dashboard Summary': {
    api: 'getDashboardSummaryReport',
    dataKey: 'summary',
    chartTypes: ['kpi', 'insights']
  },
  'Dealer Performance': {
    api: 'getDealerPerformanceReport',
    dataKey: 'data',
    chartTypes: ['bar', 'insights']
  },
  'User Activity': {
    api: 'getUserActivityReport',
    dataKey: 'data',
    chartTypes: ['line', 'bar', 'insights']
  },
  'Subscription Revenue': {
    api: 'getSubscriptionRevenueReport',
    dataKey: 'data',
    chartTypes: ['bar', 'line', 'insights']
  }
};

// KPI Card ID to API mapping for chart data fetching
const KPI_TO_API_MAPPING = {
  'auctions-joined': 'Auction Activity',
  'win-rate': 'Auction Activity',
  'total-customers': 'Customer Engagement',
  'bids-placed': 'Bid Performance',
  'appointments': 'Appointments',
  'estimated-revenue': 'Dashboard Summary',
  // Additional mappings for comprehensive coverage
  'auction-activity': 'Auction Activity',
  'bid-performance': 'Bid Performance',
  'customer-engagement': 'Customer Engagement',
  'appointment-trends': 'Appointments',
  'dashboard-summary': 'Dashboard Summary',
  'dealer-performance': 'Dealer Performance',
  'user-activity': 'User Activity',
  'subscription-revenue': 'Subscription Revenue'
};

// API function mapping
const API_FUNCTIONS = {
  getAuctionActivityReport,
  getBidPerformanceReport,
  getCustomerEngagementReport,
  getAppointmentsReport,
  getDashboardSummaryReport,
  getDealerPerformanceReport,
  getUserActivityReport,
  getSubscriptionRevenueReport
};

export const useReportData = (startDate, endDate) => {
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState({
    pie: null,
    line: null,
    bar: null,
    kpi: null,
    insights: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [activeKPI, setActiveKPI] = useState(null);
  const [error, setError] = useState(null);

  // Fetch initial stats data
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const dateFrom = startDate || '2024-01-01';
      const dateTo = endDate || '2024-12-31';
      
      const response = await getDashboardSummaryReport(dateFrom, dateTo);
      
      if (response.success) {
        const auctions = response.auctions || {};
        const bidding = response.bidding || {};
        const customers = response.customers || {};
        const appointments = response.appointments || {};
        const revenue = response.revenue || {};
        
        // Calculate changes (placeholder - would need previous period data)
        const calculateChange = (current, previous = 0) => {
          if (previous === 0) return current > 0 ? '+100%' : '0%';
          const change = ((current - previous) / previous) * 100;
          return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
        };
        
        setStats([
          { 
            id: 'auctions-joined',
            title: 'Auctions Joined', 
            value: auctions.auctions_joined || 0, 
            change: calculateChange(auctions.auctions_joined || 0),
            trend: auctions.auctions_joined > 0 ? 'up' : 'neutral',
            icon: 'Gavel',
            isActive: false
          },
          { 
            id: 'win-rate',
            title: 'Win Rate', 
            value: `${auctions.win_rate || 0}%`, 
            change: calculateChange(auctions.win_rate || 0),
            trend: auctions.win_rate > 50 ? 'up' : 'down',
            icon: 'Target',
            isActive: false
          },
          { 
            id: 'total-customers',
            title: 'Total Customers', 
            value: customers.total_customers || 0, 
            change: calculateChange(customers.total_customers || 0),
            trend: customers.total_customers > 0 ? 'up' : 'neutral',
            icon: 'Users',
            isActive: false
          },
          { 
            id: 'bids-placed',
            title: 'Bids Placed', 
            value: bidding.bids_placed || 0, 
            change: calculateChange(bidding.bids_placed || 0),
            trend: bidding.bids_placed > 0 ? 'up' : 'neutral',
            icon: 'Flame',
            isActive: false
          },
          { 
            id: 'appointments',
            title: 'Appointments', 
            value: appointments.total_appointments || 0, 
            change: calculateChange(appointments.total_appointments || 0),
            trend: appointments.total_appointments > 0 ? 'up' : 'neutral',
            icon: 'Calendar',
            isActive: false
          },
          { 
            id: 'estimated-revenue',
            title: 'Estimated Revenue', 
            value: `$${(revenue.estimated_revenue || 0).toLocaleString()}`, 
            change: calculateChange(revenue.estimated_revenue || 0),
            trend: revenue.estimated_revenue > 0 ? 'up' : 'neutral',
            icon: 'DollarSign',
            isActive: false
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Fetch chart data for specific KPI
  const fetchChartData = useCallback(async (kpiId) => {
    try {
      setIsChartLoading(true);
      setError(null);
      
      // Map KPI ID to API type
      const apiType = KPI_TO_API_MAPPING[kpiId];
      if (!apiType) {
        throw new Error(`No API mapping found for KPI: ${kpiId}`);
      }
      
      const config = API_MAPPING[apiType];
      if (!config) {
        throw new Error(`No API configuration found for: ${apiType}`);
      }

      const dateFrom = startDate || '2024-01-01';
      const dateTo = endDate || '2024-12-31';
      
      const apiFunction = API_FUNCTIONS[config.api];
      const response = await apiFunction(dateFrom, dateTo);
      
      if (response.success) {
        const data = response[config.dataKey] || response.data || response;
        
        // Update chart data based on KPI
        setChartData(prev => ({
          ...prev,
          pie: config.chartTypes.includes('pie') ? data : prev.pie,
          line: config.chartTypes.includes('line') ? data : prev.line,
          bar: config.chartTypes.includes('bar') ? data : prev.bar,
          kpi: config.chartTypes.includes('kpi') ? data : prev.kpi,
          insights: config.chartTypes.includes('insights') ? data : prev.insights
        }));
      }
    } catch (error) {
      console.error(`Error fetching chart data for KPI ${kpiId}:`, error);
      setError(`Failed to load data for ${kpiId}`);
    } finally {
      setIsChartLoading(false);
    }
  }, [startDate, endDate]);

  // Handle KPI click
  const handleKPIClick = useCallback(async (kpiId, kpiTitle) => {
    try {
      // Update active KPI state
      setActiveKPI(kpiId);
      
      // Update stats to show which KPI is active
      setStats(prev => prev.map(stat => ({
        ...stat,
        isActive: stat.id === kpiId
      })));
      
      // Fetch chart data for this KPI using the ID
      await fetchChartData(kpiId);
    } catch (error) {
      console.error('Error handling KPI click:', error);
      setError('Failed to process KPI selection');
    }
  }, [fetchChartData]);

  // Reset active KPI
  const resetActiveKPI = useCallback(() => {
    setActiveKPI(null);
    setStats(prev => prev.map(stat => ({
      ...stat,
      isActive: false
    })));
  }, []);

  // Load initial data
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Get available report types
  const getAvailableReports = useCallback(() => {
    return Object.keys(API_MAPPING).map(key => ({
      id: key.toLowerCase().replace(/\s+/g, '-'),
      title: key,
      api: API_MAPPING[key].api,
      chartTypes: API_MAPPING[key].chartTypes
    }));
  }, []);

  return {
    stats,
    chartData,
    isLoading,
    isChartLoading,
    activeKPI,
    error,
    handleKPIClick,
    resetActiveKPI,
    fetchChartData,
    getAvailableReports
  };
};
