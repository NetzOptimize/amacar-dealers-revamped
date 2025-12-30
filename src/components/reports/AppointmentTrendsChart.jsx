import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { getAppointmentsReport } from "@/lib/api";

const chartConfig = {
  total_appointments: {
    label: "Total Appointments",
    color: "#4F46E5",
  },
  completed_appointments: {
    label: "Completed",
    color: "#10B981",
  },
};

export default function AppointmentTrendsChart({ startDate, endDate, cachedData, isLoading: externalLoading }) {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [conversion, setConversion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedData) {
      setSummary(cachedData.summary || {});
      setConversion(cachedData.conversion || {});
      
      if (cachedData.data && Array.isArray(cachedData.data) && cachedData.data.length > 0) {
        const transformedData = cachedData.data.map(item => ({
          period: item.period || item.date,
          total_appointments: item.total_appointments || 0,
          completed_appointments: item.completed_appointments || 0,
          cancelled_appointments: item.cancelled_appointments || 0,
        }));
        setChartData(transformedData);
      } else {
        setChartData([]);
      }
      setIsLoading(false);
    } else if (!externalLoading) {
      const fetchAppointmentsData = async () => {
        try {
          setIsLoading(true);
          const dateFrom = startDate || format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
          const dateTo = endDate || format(new Date(), "yyyy-MM-dd");
          
          const response = await getAppointmentsReport(dateFrom, dateTo);
          
          if (response.success) {
            setSummary(response.summary || {});
            setConversion(response.conversion || {});
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              const transformedData = response.data.map(item => ({
                period: item.period || item.date,
                total_appointments: item.total_appointments || 0,
                completed_appointments: item.completed_appointments || 0,
                cancelled_appointments: item.cancelled_appointments || 0,
              }));
              setChartData(transformedData);
            } else {
              setChartData([]);
            }
          }
        } catch (error) {
          console.error('Error fetching appointments data:', error);
          setChartData([]);
          setSummary(null);
          setConversion(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAppointmentsData();
    }
  }, [cachedData, startDate, endDate, externalLoading]);
  
  const finalLoading = isLoading || externalLoading;

  if (finalLoading) {
    return (
      <div className="h-[300px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading appointment data...</p>
        </div>
      </div>
    );
  }

  const hasData = chartData.length > 0;
  const summaryData = summary || {};
  const conversionData = conversion || {};

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total</p>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryData.total_appointments || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Completed</p>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{summaryData.completed_appointments || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Completion Rate</p>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{summaryData.completion_rate?.toFixed(1) || 0}%</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-red-700 uppercase tracking-wide">Cancelled</p>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">{summaryData.cancelled_appointments || 0}</p>
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
                dataKey="total_appointments" 
                fill="#4F46E5" 
                radius={[8, 8, 0, 0]}
                name="Total"
              />
              <Bar 
                dataKey="completed_appointments" 
                fill="#10B981" 
                radius={[8, 8, 0, 0]}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No appointment data available</p>
          <p className="text-xs text-gray-500">Try adjusting your date range</p>
        </div>
      )}
    </div>
  );
}
