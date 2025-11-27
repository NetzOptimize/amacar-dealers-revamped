import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, Target } from "lucide-react";
import { format } from "date-fns";
import { getAuctionActivityReport } from "@/lib/api";

const chartConfig = {
  auctions_joined: {
    label: "Auctions Joined",
    color: "#4F46E5",
  },
  auctions_won: {
    label: "Auctions Won",
    color: "#10B981",
  },
};

export default function AuctionActivityChart({ startDate, endDate, cachedData, isLoading: externalLoading }) {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedData) {
      // Use cached data if provided
      setSummary(cachedData.summary || {});
      
      if (cachedData.data && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        const transformedData = cachedData.data.map(item => ({
          period: item.period || item.date,
          auctions_joined: item.auctions_joined || 0,
          auctions_won: item.auctions_won || 0,
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    } else if (!externalLoading) {
      // Fallback to fetching if no cached data and not loading
      const fetchAuctionData = async () => {
        try {
          setIsLoading(true);
          const dateFrom = startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          const dateTo = endDate || format(new Date(), "yyyy-MM-dd");
          
          const response = await getAuctionActivityReport(dateFrom, dateTo);
          
          if (response.success) {
            setSummary(response.summary || {});
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              const transformedData = response.data.map(item => ({
                period: item.period || item.date,
                auctions_joined: item.auctions_joined || 0,
                auctions_won: item.auctions_won || 0,
              }));
              setChartData(transformedData);
            } else {
              setChartData([]);
            }
          }
        } catch (error) {
          console.error('Error fetching auction activity data:', error);
          setChartData([]);
          setSummary(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAuctionData();
    }
  }, [cachedData, startDate, endDate, externalLoading]);
  
  const finalLoading = isLoading || externalLoading;

  if (finalLoading) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading auction data...</p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const summaryData = summary || {};

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Auctions</p>
            <Award className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryData.total_auctions || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Won</p>
            <Target className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{summaryData.auctions_won || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Win Rate</p>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{summaryData.win_rate?.toFixed(1) || 0}%</p>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Bar 
                dataKey="auctions_joined" 
                fill="#4F46E5" 
                radius={[8, 8, 0, 0]}
                name="Joined"
              />
              <Bar 
                dataKey="auctions_won" 
                fill="#10B981" 
                radius={[8, 8, 0, 0]}
                name="Won"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No auction data available</p>
          <p className="text-xs text-gray-500">Try adjusting your date range</p>
        </div>
      )}
    </div>
  );
}
