import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useReportData } from "@/hooks/useReportData";
import { useReportDataCache } from "@/hooks/useReportDataCache";
import { 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  Download,
  ArrowUpDown,
  BarChart3,
  LineChart,
  PieChart,
  Users,
  Gavel,
  DollarSign,
  CalendarCheck,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import useDebounce from "@/hooks/useDebounce";
import CustomerDistributionChart from "@/components/reports/CustomerDistributionChart";
import CustomerEngagementChart from "@/components/reports/CustomerEngagementChart";
import AppointmentTrendsChart from "@/components/reports/AppointmentTrendsChart";
import AuctionActivityChart from "@/components/reports/AuctionActivityChart";
import BidPerformanceChart from "@/components/reports/BidPerformanceChart";
import DealerPerformanceChart from "@/components/reports/DealerPerformanceChart";
import UserActivityChart from "@/components/reports/UserActivityChart";
import SubscriptionRevenueChart from "@/components/reports/SubscriptionRevenueChart";
import {
  canAccessDealerReports,
  canAccessSalesManagerReports,
  canAccessAdminReports,
  canAccessAuctionActivityReport,
  canAccessBidPerformanceReport,
  canAccessCustomerEngagementReport,
  canAccessAppointmentsReport,
  canAccessDealerPerformanceReport,
  canAccessUserActivityReport,
  canAccessSubscriptionRevenueReport,
} from "@/utils/rolePermissions";

const ReportsContent = () => {
  const { user } = useSelector((state) => state.user);
  const userRole = user?.role;

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: startOfDay(subDays(new Date(), 30)),
    endDate: endOfDay(new Date()),
  });
  
  // Grouping state
  const [groupBy, setGroupBy] = useState("day");
  
  // Active tab
  const [activeTab, setActiveTab] = useState("sales");
  
  // Active preset state (track which preset is selected)
  const [activePreset, setActivePreset] = useState(30); // Default to 30D
  
  // Loading states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasDateChanges, setHasDateChanges] = useState(false);

  // Debounced date range for API calls
  const debouncedStartDate = useDebounce(
    dateRange.startDate ? format(dateRange.startDate, "yyyy-MM-dd") : null,
    500
  );
  const debouncedEndDate = useDebounce(
    dateRange.endDate ? format(dateRange.endDate, "yyyy-MM-dd") : null,
    500
  );

  // Use centralized report data cache to prevent duplicate API calls
  const {
    data: cachedData,
    loading: cachedLoading,
    isLoading: isCachedLoading,
    refetch: refetchCachedData,
  } = useReportDataCache(debouncedStartDate, debouncedEndDate, groupBy);

  // Use report data hook with debounced dates (for stats only)
  const {
    stats,
    chartData,
    isLoading,
    isChartLoading,
    activeKPI,
    error,
    handleKPIClick,
    resetActiveKPI,
    fetchChartData,
  } = useReportData(debouncedStartDate, debouncedEndDate);
  
  // Combined loading state
  const isAnyLoading = isLoading || isCachedLoading;

  // Date preset handlers
  const handlePresetClick = (days) => {
    const newStartDate = startOfDay(subDays(new Date(), days));
    const newEndDate = endOfDay(new Date());
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
    setActivePreset(days); // Track which preset is active
    setHasDateChanges(false);
  };
  
  // Check if current date range matches a preset
  useEffect(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    const today = endOfDay(new Date());
    const daysDiff = Math.round((today - dateRange.startDate) / (1000 * 60 * 60 * 24));
    
    // Check if it matches any preset
    const presets = [7, 30, 90, 365];
    const matchingPreset = presets.find(preset => Math.abs(daysDiff - preset) <= 1);
    
    if (matchingPreset && dateRange.endDate.getTime() === today.getTime()) {
      setActivePreset(matchingPreset);
    } else {
      setActivePreset(null); // Custom date range
    }
  }, [dateRange]);

  // Manual date change handler
  const handleDateChange = (field, date) => {
    const newDateRange = {
      ...dateRange,
      [field]: date ? (field === "startDate" ? startOfDay(date) : endOfDay(date)) : null,
    };
    setDateRange(newDateRange);
    setHasDateChanges(true);
  };
  
  // Clear date changes indicator when debounced values update
  useEffect(() => {
    if (debouncedStartDate && debouncedEndDate) {
      setHasDateChanges(false);
    }
  }, [debouncedStartDate, debouncedEndDate]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Clear cache and refetch all data
      if (debouncedStartDate && debouncedEndDate) {
        await refetchCachedData();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [debouncedStartDate, debouncedEndDate, refetchCachedData]);

  // Format date for input
  const formatDateInput = (date) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    if (!date) return "Select date";
    return format(date, "MMM dd, yyyy");
  };

  // Validate date range
  const isValidDateRange = dateRange.startDate && dateRange.endDate && 
    dateRange.startDate <= dateRange.endDate;

  // Stat card skeleton
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );

  // Stat card component
  const StatCard = ({ title, value, change, trend, icon: Icon, color, isLoading: cardLoading }) => {
    if (cardLoading) return <StatCardSkeleton />;

    const isPositive = trend === "up";
    const changeValue = change || "0%";

    return (
      <motion.div
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {title}
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
        
        <div className="mb-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
            {changeValue}
          </span>
          <span className="text-sm text-gray-500">vs previous period</span>
        </div>
      </motion.div>
    );
  };

  // Chart card skeleton
  const ChartCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
      <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
    </div>
  );

  // Chart card wrapper
  const ChartCard = ({ title, subtitle, children, isLoading: chartLoading, icon: Icon }) => {
    if (chartLoading) return <ChartCardSkeleton />;

    return (
      <motion.div
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {Icon && <Icon className="h-5 w-5 text-gray-400" />}
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="min-h-[300px]">
          {children}
        </div>
      </motion.div>
    );
  };

  // Table component
  const DataTable = ({ data, columns, isLoading: tableLoading }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const handleSort = (key) => {
      setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    };

    const sortedData = useMemo(() => {
      if (!sortConfig.key || !data) return data || [];
      return [...data].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }, [data, sortConfig]);

    if (tableLoading) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available for this period</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && (
                        <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, index) => (
                <motion.tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Tab component
  const TabButton = ({ id, label, isActive, onClick, count }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative px-6 py-3 text-sm font-medium transition-all duration-200 ${
        isActive
          ? "text-blue-600"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
          isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
        }`}>
          {count}
        </span>
      )}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
          layoutId="activeTab"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );

  // Get primary stats (first 4)
  const primaryStats = stats?.slice(0, 4) || [];

  // Table data state
  const [tableData, setTableData] = useState({
    sales: [],
    bids: [],
    customers: [],
    vehicles: [],
  });

  // Load all table data from cached data on initial load and when data changes
  useEffect(() => {
    if (!cachedData) return;

    // Load all tab data at once, not just the active tab
    const newTableData = {
      sales: [],
      bids: [],
      customers: [],
      vehicles: [],
    };

    // Sales data
    if (canAccessAuctionActivityReport(userRole) && cachedData.auctionActivity?.data) {
      newTableData.sales = Array.isArray(cachedData.auctionActivity.data) 
        ? cachedData.auctionActivity.data 
        : [];
    }

    // Bids data
    if (canAccessBidPerformanceReport(userRole) && cachedData.bidPerformance?.data) {
      newTableData.bids = Array.isArray(cachedData.bidPerformance.data) 
        ? cachedData.bidPerformance.data 
        : [];
    }

    // Customers data
    if (canAccessCustomerEngagementReport(userRole) && cachedData.customerEngagement?.data) {
      newTableData.customers = Array.isArray(cachedData.customerEngagement.data) 
        ? cachedData.customerEngagement.data 
        : [];
    }

    // Vehicles data (using auction activity as placeholder)
    if (canAccessAuctionActivityReport(userRole) && cachedData.auctionActivity?.data) {
      newTableData.vehicles = Array.isArray(cachedData.auctionActivity.data) 
        ? cachedData.auctionActivity.data 
        : [];
    }

    setTableData(newTableData);
  }, [cachedData, userRole]);

  // Dynamic table columns based on data structure
  const getTableColumns = (tab, data) => {
    if (!data || data.length === 0) {
      // Default columns when no data
      const defaults = {
        sales: [
          { key: "date", label: "Date", sortable: true },
          { key: "auctions", label: "Auctions", sortable: true },
          { key: "revenue", label: "Revenue", sortable: true },
          { key: "conversion", label: "Conversion", sortable: true },
        ],
        bids: [
          { key: "date", label: "Date", sortable: true },
          { key: "total", label: "Total Bids", sortable: true },
          { key: "avgAmount", label: "Avg Amount", sortable: true },
          { key: "winRate", label: "Win Rate", sortable: true },
        ],
        customers: [
          { key: "name", label: "Customer", sortable: true },
          { key: "sessions", label: "Sessions", sortable: true },
          { key: "bids", label: "Bids", sortable: true },
          { key: "status", label: "Status", sortable: true },
        ],
        vehicles: [
          { key: "make", label: "Make", sortable: true },
          { key: "model", label: "Model", sortable: true },
          { key: "year", label: "Year", sortable: true },
          { key: "bids", label: "Bids", sortable: true },
        ],
      };
      return defaults[tab] || [];
    }

    // Generate columns from first data item
    const firstItem = data[0];
    const columns = Object.keys(firstItem).map((key) => {
      const label = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      return {
        key,
        label,
        sortable: true,
        render: (val) => {
          if (typeof val === "number") {
            if (key.includes("amount") || key.includes("revenue") || key.includes("price")) {
              return `$${val.toLocaleString()}`;
            }
            if (key.includes("rate") || key.includes("percent")) {
              return `${val}%`;
            }
            return val.toLocaleString();
          }
          if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}/)) {
            return format(new Date(val), "MMM dd, yyyy");
          }
          return val || "—";
        },
      };
    });

    return columns.slice(0, 6); // Limit to 6 columns for readability
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into your auction performance</p>
            </div>
          </div>

          {/* Control Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Date Range Inputs */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    From Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formatDateInput(dateRange.startDate)}
                      onChange={(e) => handleDateChange("startDate", e.target.value ? new Date(e.target.value) : null)}
                      max={formatDateInput(dateRange.endDate || new Date())}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    To Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={formatDateInput(dateRange.endDate)}
                      onChange={(e) => handleDateChange("endDate", e.target.value ? new Date(e.target.value) : null)}
                      min={formatDateInput(dateRange.startDate)}
                      max={formatDateInput(new Date())}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Grouping Dropdown */}
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Group By
                </label>
                <div className="relative">
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="w-full sm:w-40 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2 items-end">
                <label className="block text-xs font-medium text-gray-700 mb-1.5 w-full sm:w-auto sm:mb-0 sm:mr-2">
                  Quick Range:
                </label>
                {[
                  { label: "7D", days: 7 },
                  { label: "30D", days: 30 },
                  { label: "90D", days: 90 },
                  { label: "1Y", days: 365 },
                ].map((preset) => {
                  const isActive = activePreset === preset.days;
                  return (
                    <button
                      key={preset.days}
                      onClick={() => handlePresetClick(preset.days)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 border-2 border-blue-600"
                          : "text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || !isValidDateRange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Update
              </button>
            </div>

            {/* Date Change Indicator */}
            {hasDateChanges && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">Date range changed. Click Update to refresh data.</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error Loading Data</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Key Metrics Overview */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isAnyLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            primaryStats.map((stat, index) => {
              const iconMap = {
                Gavel: Gavel,
                Target: TrendingUp,
                Users: Users,
                Flame: TrendingUp,
                Calendar: CalendarCheck,
                DollarSign: DollarSign,
              };
              const Icon = iconMap[stat.icon] || BarChart3;
              const colors = [
                "text-blue-600",
                "text-green-600",
                "text-purple-600",
                "text-orange-600",
              ];

              return (
                <StatCard
                  key={stat.id || index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  trend={stat.change?.includes("-") ? "down" : "up"}
                  icon={Icon}
                  color={colors[index % colors.length]}
                  isLoading={isLoading}
                />
              );
            })
          )}
        </motion.div>

        {/* Visual Analytics Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Chart 1 */}
          {canAccessAuctionActivityReport(userRole) && (
            <ChartCard
              title="Auction Activity"
              subtitle="Bid activity over time"
              isLoading={cachedLoading.auctionActivity || isCachedLoading}
              icon={BarChart3}
            >
              <AuctionActivityChart
                startDate={debouncedStartDate}
                endDate={debouncedEndDate}
                cachedData={cachedData.auctionActivity}
                isLoading={cachedLoading.auctionActivity}
              />
            </ChartCard>
          )}

          {/* Chart 2 */}
          {canAccessBidPerformanceReport(userRole) && (
            <ChartCard
              title="Bid Performance"
              subtitle="Bid trends and success rates"
              isLoading={cachedLoading.bidPerformance || isCachedLoading}
              icon={LineChart}
            >
              <BidPerformanceChart
                startDate={debouncedStartDate}
                endDate={debouncedEndDate}
                cachedData={cachedData.bidPerformance}
                isLoading={cachedLoading.bidPerformance}
              />
            </ChartCard>
          )}

          {/* Chart 3 */}
          {canAccessCustomerEngagementReport(userRole) && (
            <ChartCard
              title="Customer Engagement"
              subtitle="Customer participation metrics"
              isLoading={cachedLoading.customerEngagement || isCachedLoading}
              icon={Users}
            >
              <CustomerEngagementChart
                startDate={debouncedStartDate}
                endDate={debouncedEndDate}
                cachedData={cachedData.customerEngagement}
                isLoading={cachedLoading.customerEngagement}
              />
            </ChartCard>
          )}

          {/* Chart 4 */}
          {canAccessAppointmentsReport(userRole) && (
            <ChartCard
              title="Appointment Trends"
              subtitle="Scheduled appointments over time"
              isLoading={cachedLoading.appointments || isCachedLoading}
              icon={CalendarCheck}
            >
              <AppointmentTrendsChart
                startDate={debouncedStartDate}
                endDate={debouncedEndDate}
                cachedData={cachedData.appointments}
                isLoading={cachedLoading.appointments}
              />
            </ChartCard>
          )}

          {/* Sales Manager Charts */}
          {canAccessSalesManagerReports(userRole) && (
            <>
              {canAccessDealerPerformanceReport(userRole) && (
                <ChartCard
                  title="Dealer Performance"
                  subtitle="Performance metrics by dealer"
                  isLoading={cachedLoading.dealerPerformance || isCachedLoading}
                  icon={BarChart3}
                >
                  <DealerPerformanceChart
                    startDate={debouncedStartDate}
                    endDate={debouncedEndDate}
                    cachedData={cachedData.dealerPerformance}
                    isLoading={cachedLoading.dealerPerformance}
                  />
                </ChartCard>
              )}

              {canAccessUserActivityReport(userRole) && (
                <ChartCard
                  title="User Activity"
                  subtitle="User engagement metrics"
                  isLoading={cachedLoading.userActivity || isCachedLoading}
                  icon={LineChart}
                >
                  <UserActivityChart
                    startDate={debouncedStartDate}
                    endDate={debouncedEndDate}
                    cachedData={cachedData.userActivity}
                    isLoading={cachedLoading.userActivity}
                  />
                </ChartCard>
              )}

              {canAccessSubscriptionRevenueReport(userRole) && (
                <ChartCard
                  title="Subscription Revenue"
                  subtitle="Revenue from subscriptions"
                  isLoading={cachedLoading.subscriptionRevenue || isCachedLoading}
                  icon={DollarSign}
                >
                  <SubscriptionRevenueChart
                    startDate={debouncedStartDate}
                    endDate={debouncedEndDate}
                    cachedData={cachedData.subscriptionRevenue}
                    isLoading={cachedLoading.subscriptionRevenue}
                  />
                </ChartCard>
              )}
            </>
          )}
        </motion.div>

        {/* Detailed Data Section - Tabs */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {/* Tab Bar */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto scrollbar-hide">
              <TabButton
                id="sales"
                label="Sales"
                isActive={activeTab === "sales"}
                onClick={setActiveTab}
                count={tableData.sales?.length || 0}
              />
              <TabButton
                id="bids"
                label="Bids"
                isActive={activeTab === "bids"}
                onClick={setActiveTab}
                count={tableData.bids?.length || 0}
              />
              <TabButton
                id="customers"
                label="Customers"
                isActive={activeTab === "customers"}
                onClick={setActiveTab}
                count={tableData.customers?.length || 0}
              />
              <TabButton
                id="vehicles"
                label="Vehicles"
                isActive={activeTab === "vehicles"}
                onClick={setActiveTab}
                count={tableData.vehicles?.length || 0}
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DataTable
                  data={tableData[activeTab]}
                  columns={getTableColumns(activeTab, tableData[activeTab])}
                  isLoading={isLoading}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsContent;
