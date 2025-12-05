import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Clock,
  DollarSign,
  User,
  Trophy,
  Calendar,
  X,
  Gavel,
  Percent,
  Check,
  Building2,
} from "lucide-react";
import PhotoSwipeGallery from "@/components/ui/PhotoSwipeGallery";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HighestBidsContainer = ({ auctions = [] }) => {
    const navigate = useNavigate();

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const handleViewVehicle = (vehicleId) => {
    navigate(`/vehicle-details/${vehicleId}`, {
      state: {
        productId: vehicleId,
        source: 'car-dealer', // Highest bids are from auctions (customer vehicles)
      },
    });
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Full Width Rows Layout */}
      <div className="space-y-6 relative">
        {/* Mobile Layout: Card Format */}
        <div className="block md:hidden space-y-4">
          {auctions.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              variants={cardVariants}
              className="bg-white rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl hover:border-neutral-200 transition-all duration-500 group relative"
            >
              {/* Mobile Layout: Stacked */}
              <div className="flex flex-col h-full overflow-hidden">
                {/* Image Gallery */}
                <div className="relative h-48 sm:h-52 bg-gradient-to-br from-neutral-50 to-neutral-100">
                  <PhotoSwipeGallery
                    images={vehicle.images}
                    vehicleName={vehicle.name}
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover"
                    showOverlay={true}
                  />
                </div>

                {/* Vehicle Information */}
                <div className="p-3 sm:p-4 flex flex-col flex-grow min-w-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 sm:p-3 border border-neutral-200 rounded-lg hover:border-orange-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <DollarSign className="w-3.5 h-3.5 mr-2 text-neutral-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-600">
                            Offer
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-neutral-900 ml-2">
                          {vehicle.offer}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 border border-neutral-200 rounded-lg hover:border-green-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <DollarSign className="w-3.5 h-3.5 mr-2 text-green-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-600">
                            Highest Bid
                          </span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-green-600 ml-2">
                          {vehicle.highestBid}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <User className="w-3.5 h-3.5 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-600">
                            Highest Bidder
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-blue-800 ml-2">
                          {vehicle.highestBidder}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 border border-neutral-200 rounded-lg hover:border-purple-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <Building2 className="w-3.5 h-3.5 mr-2 text-purple-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-600">
                            Dealership
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-purple-800 ml-2">
                          {vehicle.dealershipName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 sm:p-3 border border-neutral-200 rounded-lg hover:border-orange-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-orange-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-neutral-600">
                            Auction Ends
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-orange-800 ml-2">
                          {vehicle.auctionEnds}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons - Pinned to Bottom */}
                  <div className="space-y-2 pt-3 mt-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewVehicle(vehicle.id)}
                        className="flex-1 h-10 border-2 border-neutral-200 hover:border-green-300 hover:bg-green-50 text-neutral-700 hover:text-green-600 font-semibold px-3 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        <span>View Vehicle</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tablet Layout: Card Format (768px - 1279px) */}
        <div className="hidden md:grid 2xl:hidden grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
          {auctions.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              variants={cardVariants}
              className="bg-white rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl hover:border-neutral-200 transition-all duration-500 group relative"
            >
              {/* Tablet Card Layout - Similar to Mobile */}
              <div className="flex flex-col h-full overflow-hidden">
                {/* Image Gallery */}
                <div className="relative h-60 bg-gradient-to-br from-neutral-50 to-neutral-100">
                  <PhotoSwipeGallery
                    images={vehicle.images}
                    vehicleName={vehicle.name}
                    className="w-full h-full"
                    imageClassName="w-full h-full object-cover"
                    showOverlay={true}
                  />
                </div>

                {/* Vehicle Information */}
                <div className="p-3 flex flex-col flex-grow min-w-0">
                  <div className="space-y-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 mb-1 group-hover:text-orange-600 transition-colors duration-300">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 border border-neutral-200 rounded-lg hover:border-orange-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <DollarSign className="w-3 h-3 mr-1.5 text-neutral-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-neutral-600">
                            Offer
                          </span>
                        </div>
                        <p className="text-xs font-bold text-neutral-900 ml-2">
                          {vehicle.offer}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 border border-neutral-200 rounded-lg hover:border-green-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <DollarSign className="w-3 h-3 mr-1.5 text-green-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-neutral-600">
                            Highest Bid
                          </span>
                        </div>
                        <p className="text-xs font-bold text-green-600 ml-2">
                          {vehicle.highestBid}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <User className="w-3 h-3 mr-1.5 text-blue-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-neutral-600">
                            Highest Bidder
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-blue-800 ml-2">
                          {vehicle.highestBidder}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 border border-neutral-200 rounded-lg hover:border-purple-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <Building2 className="w-3 h-3 mr-1.5 text-purple-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-neutral-600">
                            Dealership
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-purple-800 ml-2">
                          {vehicle.dealershipName}
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-2 border border-neutral-200 rounded-lg hover:border-orange-300 transition-colors duration-300 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <Calendar className="w-3 h-3 mr-1.5 text-orange-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-neutral-600">
                            Auction Ends
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-orange-800 ml-2">
                          {vehicle.auctionEnds}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons - Pinned to Bottom */}
                  <div className="space-y-2 pt-3 mt-auto">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewVehicle(vehicle.id)}
                        className="flex-1 h-8 border-2 border-neutral-200 hover:border-green-300 hover:bg-green-50 text-neutral-700 hover:text-green-600 font-semibold px-2 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        <span>Vehicle</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Large Desktop Layout: Full Width Rows (1280px+) */}
        <div className="hidden 2xl:block space-y-4">
          {auctions.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              variants={cardVariants}
              className="bg-white rounded-3xl shadow-sm border border-neutral-100 hover:shadow-xl hover:border-neutral-200 transition-all duration-500 group relative"
            >
              {/* Large Desktop Layout: Full Width Row */}
              <div className="flex bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-36">
                {/* Left Section - Image Gallery */}
                <div className="w-48 xl:w-56 relative rounded-xl relative bg-gradient-to-br from-neutral-50 to-neutral-100 group/image rounded-l-xl overflow-hidden flex-shrink-0">
                  <PhotoSwipeGallery
                    images={vehicle.images}
                    vehicleName={vehicle.name}
                    className="w-full h-full rounded-l-xl"
                    imageClassName="w-full h-full object-cover rounded-xl"
                    showOverlay={true}
                  />
                </div>

                {/* Right Section - Vehicle Information */}
                <div className="flex-1 px-4 lg:px-6 xl:px-6 2xl:px-8 py-3 flex flex-col justify-between min-w-0">
                  {/* Header with Vehicle Title and CTA Buttons */}
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-orange-500 transition-colors duration-200">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-normal">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end items-center flex-shrink-0">
                      <div className="flex items-center justify-center h-8 px-4 text-green-600 font-medium rounded-md text-sm transition-colors duration-200">
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Offer accepted
                      </div>
                      <Button
                        onClick={() => handleViewVehicle(vehicle.id)}
                        className="h-8 px-4 bg-[var(--brand-orange)] hover:bg-[var(--color-primary-600)] text-white font-medium rounded-md text-sm transition-colors duration-200 cursor-pointer"
                      >
                        View Vehicle
                      </Button>
                    </div>
                  </div>

                  {/* Auction Details Grid - Bottom */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-1 xl:gap-2">
                    <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                      <div className="flex items-center mb-1">
                        <DollarSign className="w-3 h-3 mr-1 text-neutral-400 flex-shrink-0" />
                        <span className="text-xs font-normal text-neutral-500">
                          Offer
                        </span>
                      </div>
                      <p className="text-xs font-semibold">
                        {vehicle.offer}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                      <div className="flex items-center mb-1">
                        <User className="w-3 h-3 mr-1 text-blue-400 flex-shrink-0" />
                        <span className="text-xs font-normal text-neutral-500">
                          Highest Bidder
                        </span>
                      </div>
                      <p className="text-xs font-semibold">
                        {vehicle.highestBidder}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                      <div className="flex items-center mb-1">
                        <Building2 className="w-3 h-3 mr-1 text-purple-400 flex-shrink-0" />
                        <span className="text-xs font-normal text-neutral-500">
                          Dealership
                        </span>
                      </div>
                      <p className="text-xs font-semibold">
                        {vehicle.dealershipName}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-normal text-neutral-500">
                          VIN
                        </span>
                      </div>
                      <p className="text-xs font-semibold">{vehicle.VIN}</p>
                    </div>
                    <div className="flex flex-col justify-center items-end p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                      <div className="flex items-center mb-1">
                        <DollarSign className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
                        <span className="text-xs font-normal text-neutral-500">
                          Highest Bid
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-right">
                        {vehicle.highestBid}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center items-end p-1.5 lg:p-2 xl:p-1.5 2xl:p-2 rounded-lg transition-all duration-200 min-w-0">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1 text-orange-500 flex-shrink-0" />
                        <span className="text-xs font-normal text-neutral-500">
                          Auction Ends
                        </span>
                      </div>
                      <p className="text-xs font-medium text-center">
                        {vehicle.auctionEnds}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>    
  );
};

export default HighestBidsContainer;
