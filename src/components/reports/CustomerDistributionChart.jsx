import { useState, useEffect } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users, UserPlus, Repeat } from "lucide-react";
import { format } from "date-fns";
import { getCustomerEngagementReport } from "@/lib/api";

const COLORS = {
  new: "#10B981",
  repeat: "#4F46E5",
};

export default function CustomerDistributionChart({ startDate, endDate, cachedData, isLoading: externalLoading }) {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cachedData) {
      setSummary(cachedData.summary || {});
      
      const summaryData = cachedData.summary || {};
      const newCustomers = summaryData.new_customers || 0;
      const repeatCustomers = summaryData.repeat_customers || 0;
      
      if (newCustomers > 0 || repeatCustomers > 0) {
        setChartData([
          { name: "New Customers", value: newCustomers, color: COLORS.new },
          { name: "Repeat Customers", value: repeatCustomers, color: COLORS.repeat },
        ]);
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
            
            const summaryData = response.summary || {};
            const newCustomers = summaryData.new_customers || 0;
            const repeatCustomers = summaryData.repeat_customers || 0;
            
            if (newCustomers > 0 || repeatCustomers > 0) {
              setChartData([
                { name: "New Customers", value: newCustomers, color: COLORS.new },
                { name: "Repeat Customers", value: repeatCustomers, color: COLORS.repeat },
              ]);
            } else {
              setChartData([]);
            }
          }
        } catch (error) {
          console.error('Error fetching customer distribution data:', error);
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

  const hasData = chartData.length > 0 && chartData.some(item => item.value > 0);
  const summaryData = summary || {};

  return (
    <div className="space-y-4">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">New</p>
            <UserPlus className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{summaryData.new_customers || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Repeat</p>
            <Repeat className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">{summaryData.repeat_customers || 0}</p>
        </div>
      </div>

      {/* Pie Chart */}
      {hasData ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">Customer Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent, value }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">No customer distribution data</p>
          <p className="text-xs text-gray-500">Try adjusting your date range</p>
        </div>
      )}
    </div>
  );
}
