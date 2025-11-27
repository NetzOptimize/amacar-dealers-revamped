import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Award, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { getDealerPerformanceReport } from "@/lib/api";

const chartConfig = {
  win_rate: {
    label: "Win Rate",
    color: "#4F46E5",
  },
  revenue_estimate: {
    label: "Revenue",
    color: "#10B981",
  },
};

export default function DealerPerformanceChart({ startDate, endDate, cachedData, isLoading: externalLoading }) {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedData) {
      setSummary(cachedData.summary || {});
      
      if (cachedData.dealers && Array.isArray(cachedData.dealers) && cachedData.dealers.length > 0) {
        const transformedData = cachedData.dealers.map(item => ({
          dealer: item.dealership_name || item.dealer_name || 'Dealer',
          dealer_name: item.dealer_name,
          win_rate: item.win_rate || 0,
          auctions_won: item.auctions_won || 0,
          auctions_joined: item.auctions_joined || 0,
          bids_placed: item.bids_placed || 0,
          revenue_estimate: item.revenue_estimate || 0,
          customers_acquired: item.customers_acquired || 0,
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    } else if (!externalLoading) {
      const fetchDealerData = async () => {
        try {
          setIsLoading(true);
          const dateFrom = startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          const dateTo = endDate || format(new Date(), "yyyy-MM-dd");
          
          const response = await getDealerPerformanceReport(dateFrom, dateTo);
          
          if (response.success) {
            setSummary(response.summary || {});
            
            if (response.dealers && Array.isArray(response.dealers) && response.dealers.length > 0) {
              const transformedData = response.dealers.map(item => ({
                dealer: item.dealership_name || item.dealer_name || 'Dealer',
                dealer_name: item.dealer_name,
                win_rate: item.win_rate || 0,
                auctions_won: item.auctions_won || 0,
                auctions_joined: item.auctions_joined || 0,
                bids_placed: item.bids_placed || 0,
                revenue_estimate: item.revenue_estimate || 0,
                customers_acquired: item.customers_acquired || 0,
              }));
              setChartData(transformedData);
            } else {
              setChartData([]);
            }
          }
        } catch (error) {
          console.error('Error fetching dealer performance data:', error);
          setChartData([]);
          setSummary(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDealerData();
    }
  }, [cachedData, startDate, endDate, externalLoading]);
  
  const finalLoading = isLoading || externalLoading;

  if (finalLoading) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading dealer data...</p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const summaryData = summary || {};

  // Sort by win rate descending for better visualization
  const sortedData = [...chartData].sort((a, b) => b.win_rate - a.win_rate);

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Dealers</p>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryData.total_dealers || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Avg Win Rate</p>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{summaryData.average_win_rate?.toFixed(1) || 0}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Total Revenue</p>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">${(summaryData.total_revenue_estimate || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Win Rate by Dealer</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={sortedData} 
              layout="vertical"
              margin={{ top: 10, right: 10, left: 80, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
              <XAxis 
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: '12px', fill: '#6B7280' }}
              />
              <YAxis
                dataKey="dealer"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={70}
                style={{ fontSize: '12px', fill: '#6B7280' }}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <Bar 
                dataKey="win_rate" 
                fill="#4F46E5" 
                radius={[0, 8, 8, 0]}
                name="Win Rate (%)"
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.win_rate > 50 ? '#10B981' : entry.win_rate > 25 ? '#F59E0B' : '#EF4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          {/* Dealer Details Table */}
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Details</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sortedData.map((dealer, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{dealer.dealer}</p>
                    <p className="text-xs text-gray-500">{dealer.dealer_name}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Win Rate</p>
                      <p className="font-semibold text-gray-900">{dealer.win_rate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Revenue</p>
                      <p className="font-semibold text-gray-900">${dealer.revenue_estimate.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Customers</p>
                      <p className="font-semibold text-gray-900">{dealer.customers_acquired}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No dealer performance data available</p>
          <p className="text-xs text-gray-500">Try adjusting your date range</p>
        </div>
      )}
    </div>
  );
}
