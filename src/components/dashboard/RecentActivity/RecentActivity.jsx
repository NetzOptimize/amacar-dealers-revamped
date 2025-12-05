import { motion } from "framer-motion";
import {
  Bell,
  Clock,
  DollarSign,
  Gavel,
  Calendar,
  User,
  Plus,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getDashboardActivity } from "../../../lib/api";
import { Link, useNavigate } from "react-router-dom";
import CustomerDetailsModal from "@/components/common/CustomerDetailsModal/CustomerDetailsModal";

const RecentActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Customer modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  // Map activity types to icons and colors
  const getActivityConfig = (type) => {
    switch (type) {
      case "new_customer":
        return {
          icon: User,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
      case "bid":
        return {
          icon: DollarSign,
          color: "text-emerald-600",
          bgColor: "bg-emerald-50",
        };
      case "auction":
        return {
          icon: Gavel,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        };
      case "appointment":
        return {
          icon: Calendar,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
      default:
        return {
          icon: Bell,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
        };
    }
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  // Fetch activities from API
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getDashboardActivity(5);

      if (response.success && response.activities) {
        const formattedActivities = response.activities.map(
          (activity, index) => {
            const config = getActivityConfig(activity.type);
            return {
              id: activity.data?.customer_id || index,
              type: activity.type,
              message: activity.message,
              time: getTimeAgo(activity.timestamp),
              formattedDate: activity.formatted_date,
              icon: config.icon,
              color: config.color,
              bgColor: config.bgColor,
              data: activity.data,
            };
          }
        );

        setActivities(formattedActivities);
      } else {
        throw new Error("Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError(error.message || "Failed to fetch activities");
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Handle activity click based on available data
  const handleActivityClick = (activity) => {
    // If both vehicle_id and customer_id are present, prioritize vehicle_id (go to vehicle details)
    if (activity.data?.vehicle_id) {
      navigate(`/vehicle-details/${activity.data.vehicle_id}`, {
        state: {
          productId: activity.data.vehicle_id,
          source: 'reverse-bid', // Recent activity vehicles are typically from inventory (dealer vehicles)
        },
      });
    } 
    // If only customer_id is present, open customer modal
    else if (activity.data?.customer_id) {
      setSelectedCustomerId(activity.data.customer_id);
      setSelectedCustomerName(activity.data.customer_name || "");
      setIsCustomerModalOpen(true);
    }
  };

  // Handle closing customer modal
  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setSelectedCustomerId(null);
    setSelectedCustomerName("");
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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 h-fit"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900">
          Recent Activity
        </h3>
        <div className="flex items-center text-sm text-neutral-500">
          <Clock className="w-4 h-4 mr-1" />
          <span>Live updates</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3">
                <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-neutral-100 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-500 text-sm">Failed to load activities</p>
            <p className="text-red-400 text-xs mt-1">{error}</p>
            <button
              onClick={fetchActivities}
              className="mt-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <motion.div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                  (activity.data?.vehicle_id || activity.data?.customer_id) 
                    ? "cursor-pointer hover:bg-neutral-50" 
                    : "cursor-default"
                }`}
                variants={itemVariants}
                whileHover={(activity.data?.vehicle_id || activity.data?.customer_id) ? { x: 4 } : {}}
                onClick={() => handleActivityClick(activity)}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bgColor}`}
                >
                  <IconComponent className={`w-4 h-4 ${activity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800 leading-relaxed">
                    {activity.message}
                  </p>
                  {activity.data?.vehicle_title && (
                    <p className="text-xs text-neutral-600 mt-1 font-medium">
                      Vehicle:{" "}
                      {activity.data.vehicle_title.replace(/&#8211;/g, "–")}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-neutral-500 text-sm">No recent activity</p>
            <p className="text-neutral-400 text-xs mt-1">
              Activity will appear here
            </p>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
      />
    </motion.div>
  );
};

export default RecentActivity;
