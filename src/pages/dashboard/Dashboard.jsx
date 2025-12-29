import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardStats from "@/components/dashboard/DashboardStats/DashboardStats";
import RecentVehiclesSection from "../../components/dashboard/RecentVehiclesSection/RecentVehiclesSection";
import RecentCustomers from "@/components/dashboard/RecentCustomers/RecentCustomers";
import QuickActions from "@/components/dashboard/QuickActions/QuickActions";
import DashboardSkeleton from "@/components/skeletons/dashboard/DashboardSkeleton";
import ReverseBiddingContent from "@/components/dashboard/ReverseBiddingContent/ReverseBiddingContent";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active-bidding");
  const [activeBiddingRefreshKey, setActiveBiddingRefreshKey] = useState(0);
  const [reverseBiddingRefreshKey, setReverseBiddingRefreshKey] = useState(0);

  // Dashboard sections now handle their own loading states
  useEffect(() => {
    // Set loading to false immediately since components handle their own loading
    setIsLoading(false);
  }, []);

  // Handle tab change and trigger refresh for the tab being switched to
  const handleTabChange = (newTab) => {
    if (newTab === "active-bidding" && activeTab !== "active-bidding") {
      setActiveBiddingRefreshKey(prev => prev + 1); // Increment to force remount and refetch
    } else if (newTab === "reverse-bidding" && activeTab !== "reverse-bidding") {
      setReverseBiddingRefreshKey(prev => prev + 1); // Increment to force remount and refetch
    }
    setActiveTab(newTab);
  };

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-neutral-50 pt-10 md:pt-24 pb-12 px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full mx-auto px-4 md:px-6">
        {/* Header Section */}
        <motion.div 
          className="mb-8"
          variants={headerVariants}
        >
          <motion.h1 
            className="text-3xl font-bold text-neutral-900 mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-neutral-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Welcome to your dealer portal. Here's a summary of your auction activity.
          </motion.p>
        </motion.div>

        {/* Modern Segmented Tab Control */}
        <motion.div 
          className="mb-8"
          variants={headerVariants}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-neutral-200">
              <TabsList className="bg-transparent p-0 h-auto w-auto inline-flex gap-0">
                <TabsTrigger 
                  value="active-bidding" 
                  className="relative px-5 py-2 text-sm font-medium text-neutral-600 rounded-md transition-all duration-200 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-neutral-900 hover:bg-neutral-50/50 data-[state=active]:hover:bg-primary-600 data-[state=active]:hover:text-white"
                >
                  Active Bidding
                </TabsTrigger>
                <TabsTrigger 
                  value="reverse-bidding"
                  className="relative px-5 py-2 text-sm font-medium text-neutral-600 rounded-md transition-all duration-200 data-[state=active]:bg-primary-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-neutral-900 hover:bg-neutral-50/50 data-[state=active]:hover:bg-primary-600 data-[state=active]:hover:text-white"
                >
                  Reverse Bidding
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Active Bidding Tab Content */}
            <TabsContent value="active-bidding" className="mt-8 w-full">
              <motion.div
                key={`active-bidding-${activeBiddingRefreshKey}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12 w-full"
              >
                {/* Statistics Cards */}
                <motion.div variants={statsVariants}>
                  <DashboardStats key={`stats-${activeBiddingRefreshKey}`} />
                </motion.div>

                {/* Recent Vehicles Section */}
                <motion.div variants={statsVariants}>
                  <RecentVehiclesSection key={`vehicles-${activeBiddingRefreshKey}`} />
                </motion.div>

                {/* Recent Customers Section */}
                <motion.div variants={statsVariants}>
                  <RecentCustomers key={`customers-${activeBiddingRefreshKey}`} />
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Reverse Bidding Tab Content */}
            <TabsContent value="reverse-bidding" className="mt-8 w-full">
              <motion.div
                key={`reverse-bidding-${reverseBiddingRefreshKey}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <ReverseBiddingContent key={`reverse-content-${reverseBiddingRefreshKey}`} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
       </div>
     </motion.div>
   );
 };

export default Dashboard;
