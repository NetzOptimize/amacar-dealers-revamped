import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Users, UserPlus, Repeat, Calendar } from "lucide-react";
import { format } from "date-fns";
import { getCustomerEngagementReport } from "@/lib/api";

const chartConfig = {
  total_customers: {
    label: "Total Customers",
    color: "#4F46E5",
  },
  new_customers: {
    label: "New Customers",
    color: "#10B981",
  },
};

export default function CustomerEngagementChart({ startDate, endDate, cachedData, isLoading: externalLoading }) {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedData) {
      setSummary(cachedData.summary || {});
      
      if (cachedData.data && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        const transformedData = cachedData.data.map(item => ({
          period: item.period || item.date,
          total_customers: item.total_customers || 0,
          new_customers: item.new_customers || 0,
          total_appointments: item.total_appointments || 0,
          completed_appointments: item.completed_appointments || 0,
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    } else if (!externalLoading) {
      const fetchCustomersData = async () => {
        try {
          setIsLoading(true);
          const dateFrom = startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          const dateTo = endDate || format(new Date(), "yyyy-MM-dd");
          
          const response = await getCustomerEngagementReport(dateFrom, dateTo);
          
          if (response.success) {
            setSummary(response.summary || {});
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              const transformedData = response.data.map(item => ({
                period: item.period || item.date,
                total_customers: item.total_customers || 0,
                new_customers: item.new_customers || 0,
                total_appointments: item.total_appointments || 0,
                completed_appointments: item.completed_appointments || 0,
              }));
              setChartData(transformedData);
            } else {
              setChartData([]);
            }
          }
        } catch (error) {
          console.error('Error fetching customer engagement data:', error);
          setChartData([]);
          setSummary(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCustomersData();
    }
  }, [cachedData, startDate, endDate, externalLoading]);
  
  const finalLoading = isLoading || externalLoading;

  if (finalLoading) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading customer data...</p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const summaryData = summary || {};

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Customers</p>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryData.total_customers || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">New Customers</p>
            <UserPlus className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{summaryData.new_customers || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Repeat</p>
            <Repeat className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{summaryData.repeat_customers || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Queries</p>
            <Calendar className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{summaryData.total_vehicle_queries || 0}</p>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="total_customers"
                stroke="#4F46E5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="new_customers"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNew)"
                name="New"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No customer data available</p>
          <p className="text-xs text-gray-500">Try adjusting your date range</p>
        </div>
      )}
    </div>
  );
}
