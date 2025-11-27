import { useState, useEffect } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { TrendingUp, Zap, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { getBidPerformanceReport } from "@/lib/api";

const chartConfig = {
  total_bids: {
    label: "Total Bids",
    color: "#4F46E5",
  },
  winning_bids: {
    label: "Winning Bids",
    color: "#10B981",
  },
};

const COLORS = {
  hot: "#EF4444",
  warm: "#F59E0B",
  cold: "#3B82F6",
};

export default function BidPerformanceChart({ startDate, endDate, cachedData, isLoading: externalLoading }) {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [biddingZones, setBiddingZones] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedData) {
      setSummary(cachedData.summary || {});
      setBiddingZones(cachedData.bidding_zones || {});
      
      if (cachedData.data && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        const transformedData = cachedData.data.map(item => ({
          period: item.period || item.date,
          total_bids: item.total_bids || 0,
          winning_bids: item.winning_bids || 0,
          outbid_bids: item.outbid_bids || 0,
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    } else if (!externalLoading) {
      const fetchBidsData = async () => {
        try {
          setIsLoading(true);
          const dateFrom = startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          const dateTo = endDate || format(new Date(), "yyyy-MM-dd");
          
          const response = await getBidPerformanceReport(dateFrom, dateTo);
          
          if (response.success) {
            setSummary(response.summary || {});
            setBiddingZones(response.bidding_zones || {});
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              const transformedData = response.data.map(item => ({
                period: item.period || item.date,
                total_bids: item.total_bids || 0,
                winning_bids: item.winning_bids || 0,
                outbid_bids: item.outbid_bids || 0,
              }));
              setChartData(transformedData);
            } else {
              setChartData([]);
            }
          }
        } catch (error) {
          console.error('Error fetching bid performance data:', error);
          setChartData([]);
          setSummary(null);
          setBiddingZones(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBidsData();
    }
  }, [cachedData, startDate, endDate, externalLoading]);
  
  const finalLoading = isLoading || externalLoading;

  if (finalLoading) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading bid data...</p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const summaryData = summary || {};
  const zones = biddingZones || { hot: 0, warm: 0, cold: 0 };

  // Prepare pie chart data for bidding zones
  const zoneData = [
    { name: "Hot Zone", value: zones.hot || 0, color: COLORS.hot },
    { name: "Warm Zone", value: zones.warm || 0, color: COLORS.warm },
    { name: "Cold Zone", value: zones.cold || 0, color: COLORS.cold },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Bids</p>
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryData.total_bids || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Win Rate</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{summaryData.win_rate?.toFixed(1) || 0}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Winning</p>
            <CheckCircle2 className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{summaryData.winning_bids || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Outbid</p>
            <Clock className="h-4 w-4 text-gray-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{summaryData.outbid_bids || 0}</p>
        </div>
      </div>

      {/* Bidding Zones Pie Chart */}
      {zoneData.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Bidding Zones</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={zoneData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {zoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Time Series Chart */}
      {hasData ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  try {
                    const date = new Date(value);
                    return format(date, "MMM dd");
                  } catch {
                    return value;
                  }
                }}
                style={{ fontSize: '12px', fill: '#6B7280' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: '12px', fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="total_bids"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={false}
                name="Total Bids"
              />
              <Line
                type="monotone"
                dataKey="winning_bids"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="Winning"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No bid data available</p>
          <p className="text-xs text-gray-500">Try adjusting your date range</p>
        </div>
      )}
    </div>
  );
}
