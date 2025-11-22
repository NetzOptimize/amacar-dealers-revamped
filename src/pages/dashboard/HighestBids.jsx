import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import DashboardStats from "@/components/dashboard/DashboardStats/DashboardStats";
import HighestBidsContainer from "@/components/highest-bids/HighestBidsContainer";
import Pagination from "@/components/common/Pagination/Pagination";
import FilterTabs from "@/components/filters/LiveAuctionFilterTabs";
import HighestBidsSkeleton from "@/components/skeletons/HighestBids/HighestBidsSkeleton";
import HighestBidsCompactSkeleton from "@/components/skeletons/HighestBids/HighestBidsCompactSkeleton";
import api from "@/lib/api";
import { useSearch } from "@/context/SearchContext";

const HighestBids = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("allTime");
  const [highestBids, setHighestBids] = useState([]);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);
  const itemsPerPage = 10; // Show 4 vehicles per page

  // Search context
  const { searchQuery, isSearching, debouncedSearchQuery, clearSearch } = useSearch();

  // Transform API data to match component expectations
  const transformApiData = useCallback((apiData) => {
    return apiData.map((item) => {
      const vehicle = item.vehicle;
      const highestBid = item.highest_bid;

      return {
        id: vehicle.id,
        name: vehicle.title,
        images: vehicle.images?.map((img) => img.url) || [],
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        offer: `$${vehicle.cash_offer?.toLocaleString() || "0"}`,
        offerStatus: "Accepted",
        highestBid: highestBid?.amount
          ? `$${highestBid.amount.toLocaleString()}`
          : "No bids",
        highestBidder: highestBid?.bidder?.name || "No bidder",
        dealershipName: highestBid?.dealership_name || "No dealership",
        finalPrice: highestBid?.amount
          ? `$${highestBid.amount.toLocaleString()}`
          : "No bids",
        VIN: vehicle.vin || "N/A",
        auctionEnds: vehicle.ends_at
          ? new Date(vehicle.ends_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        auctionStatus: item.auction_status === "ended" ? "Ended" : "Active",
        bidPercentage: "85%", // This might need to be calculated from API data
        timeLeft: "0",
        totalBids: item.total_bids || 0,
        bidDate: highestBid?.bid_date || null,
        bidderId: highestBid?.bidder?.id || null,
      };
    });
  }, []);

  // Highest Bids API
  const getHighestBids = useCallback(async (page = 1, perPage = 4, search = '') => {
    try {
      const params = {
        page,
        per_page: perPage
      };
      
      // Add search parameter if provided
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await api.get('/highest-bids', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching highest bids:', error);
      throw error;
    }
  }, []);

  // Fetch highest bids data from API
  const fetchHighestBids = useCallback(async (page = 1, perPage = 4, search = '') => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getHighestBids(page, perPage, search);

      if (response.success) {
        const transformedData = transformApiData(response.data);
        setHighestBids(transformedData);
        setPagination(response.pagination);
      } else {
        throw new Error("Failed to fetch highest bids");
      }
    } catch (error) {
      console.error("Error fetching highest bids:", error);
      setError(error.message || "Failed to fetch highest bids");
      toast.error("Failed to load highest bids. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [getHighestBids, transformApiData]);

  // Filter auctions based on active filter
  const getFilteredAuctions = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(
      today.getTime() - today.getDay() * 24 * 60 * 60 * 1000
    );
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return highestBids.filter((auction) => {
      const auctionDate = new Date(auction.auctionEnds);

      switch (activeFilter) {
        case "today":
          return (
            auctionDate >= today &&
            auctionDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
        case "thisWeek":
          return (
            auctionDate >= thisWeek &&
            auctionDate < new Date(thisWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
          );
        case "thisMonth":
          return (
            auctionDate >= thisMonth &&
            auctionDate <
              new Date(thisMonth.getTime() + 30 * 24 * 60 * 60 * 1000)
          );
        case "passed":
          return auctionDate < now;
        case "allTime":
        default:
          return true;
      }
    });
  }, [highestBids, activeFilter]);

  const filteredAuctions = getFilteredAuctions();

  // Use API pagination instead of client-side pagination
  const totalPages = pagination.total_pages || 1;
  const currentAuctions = highestBids;

  // Handle filter change with loading simulation
  const handleFilterChange = useCallback(async (filterId) => {
    if (isFilterLoading) return;

    setIsFilterLoading(true);
    setCurrentPage(1);

    // Simulate API call for filter change
    await new Promise((resolve) => setTimeout(resolve, 500));

    setActiveFilter(filterId);
    setIsFilterLoading(false);
  }, [isFilterLoading]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchHighestBids(page, itemsPerPage, debouncedSearchQuery);
  }, [fetchHighestBids, itemsPerPage, debouncedSearchQuery]);

  // Handle data fetching for search and filter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsSearchLoading(false);
      setIsLoading(true);
      
      // Reset to page 1 when search or filter changes
      setCurrentPage(1);
      await fetchHighestBids(1, itemsPerPage, debouncedSearchQuery);
      setIsLoading(false);
    };

    fetchData();
  }, [debouncedSearchQuery, activeFilter, fetchHighestBids, itemsPerPage]);

  // Handle search loading state separately
  useEffect(() => {
    if (isSearching) {
      setIsSearchLoading(true);
    } else {
      setIsSearchLoading(false);
    }
  }, [isSearching]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {!isLoading ? (
        <div className="px-4 md:px-6">
          {/* Header Section */}
          <motion.div className="mb-8" variants={headerVariants}>
            <motion.h1
              className="text-3xl font-bold text-neutral-900 mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Highest Bids
            </motion.h1>
            <motion.p
              className="text-neutral-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              View your highest bids and track their status.
            </motion.p>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div variants={statsVariants}>
            <DashboardStats />
          </motion.div>

          {/* Filter Tabs */}
          <motion.div className="mt-8" variants={statsVariants}>
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              isLoading={isFilterLoading}
              className="mb-6"
            />

            {/* Results Count */}
            <motion.div
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-sm text-neutral-600">
                {searchQuery ? (
                  <>
                    Showing {pagination.total || 0} result{(pagination.total || 0) !== 1 ? "s" : ""} for "{searchQuery}"
                    {activeFilter !== "allTime" && (
                      <span className="ml-1 text-neutral-500">
                        (
                        {activeFilter === "today"
                          ? "today"
                          : activeFilter === "thisWeek"
                          ? "this week"
                          : activeFilter === "thisMonth"
                          ? "this month"
                          : "passed"}
                        )
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing {pagination.total || 0} highest bid{(pagination.total || 0) !== 1 ? "s" : ""}
                    {activeFilter !== "allTime" && (
                      <span className="ml-1 text-neutral-500">
                        (
                        {activeFilter === "today"
                          ? "today"
                          : activeFilter === "thisWeek"
                          ? "this week"
                          : activeFilter === "thisMonth"
                          ? "this month"
                          : "passed"}
                        )
                      </span>
                    )}
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>

          {/* Highest Bids Grid */}
          <motion.div className="mt-8" variants={statsVariants}>
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">
                  Error loading highest bids
                </div>
                <div className="text-red-400 text-sm">{error}</div>
                <button
                  onClick={() => fetchHighestBids(currentPage, itemsPerPage, debouncedSearchQuery)}
                  className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : isSearchLoading ? (
              <HighestBidsCompactSkeleton />
            ) : currentAuctions.length > 0 ? (
              <HighestBidsContainer auctions={currentAuctions} />
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mb-6">
                  <svg 
                    className="w-12 h-12 text-neutral-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {searchQuery ? `No results found for "${searchQuery}"` : "No highest bids available"}
                </h3>
                <p className="text-neutral-500 text-center max-w-md">
                  {searchQuery 
                    ? "Try adjusting your search terms or browse all highest bids."
                    : "No highest bids found. Check back later for new auction results!"
                  }
                </p>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Pagination */}
          <motion.div
            className="flex justify-center mt-8"
            variants={statsVariants}
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="w-full max-w-md mb-4"
            />
          </motion.div>
        </div>
      ) : (
        <HighestBidsSkeleton />
      )}
    </motion.div>
  );
};

export default HighestBids;
