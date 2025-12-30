import { motion } from "framer-motion";
import { Eye, Calendar, Gavel } from "lucide-react";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  // CarouselNext,
  // CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { formatBidAmount, getStatusColor } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserPermissions } from "@/utils/rolePermissions";
import BidDialog from "@/components/common/BidDialog/BidDialog";
const VehicleCard = ({ vehicle, onBidRefresh }) => {
  const { user } = useSelector((state) => state.user);
  const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);

  const userRole = user?.role;
  const permissions = getUserPermissions(userRole, user);
  const { canBidPass } = permissions;

  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/vehicle-details/${vehicle.id}`, {
      state: {
        productId: vehicle.id,
        source: 'reverse-bid', // Dashboard vehicles are typically from inventory (dealer vehicles)
      },
    });
  };

  const handleBidNow = () => {
    setIsBidDialogOpen(true);
  };

  const handleCloseBidDialog = () => {
    setIsBidDialogOpen(false);
  };

  const handleBidSuccess = (bidAmount) => {
    console.log("Bid successful:", bidAmount);
    setIsBidDialogOpen(false);
    // Call refresh function if provided
    if (onBidRefresh) {
      onBidRefresh();
    }
  };

  const parseCurrency = (currencyString) => {
    if (!currencyString) return 0;
    // Remove dollar sign, commas, and convert to number
    const cleaned = currencyString.toString().replace(/[$,]/g, "");
    return parseFloat(cleaned) || 0;
  };

  // Calculate percentage increase
  const calculatePercentageIncrease = (cashOffer, highestBid) => {
    const cash = parseCurrency(cashOffer);
    const bid = parseCurrency(highestBid?.amount);

    if (!bid || bid === 0) return null;

    const increase = bid - cash;
    const percentage = (increase / bid) * 100;
    return percentage.toFixed(1);
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 group h-full" // ⬅ increased height
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Carousel */}
      <div className="relative h-fit bg-neutral-100 group/carousel">
        {" "}
        {/* ⬅ slightly taller image */}
        <Carousel
          className="w-full h-full"
          opts={{
            loop: true,
            align: "start",
            skipSnaps: false,
            dragFree: false,
          }}
        >
          <CarouselContent>
            {vehicle.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="w-full h-56 relative overflow-hidden">
                  <img
                    src={image}
                    alt={`${vehicle.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Navigation Dots */}
          {vehicle.images.length > 1 && (
            <CarouselDots className="absolute bottom-2 left-1/2 -translate-x-1/2" />
          )}
          {/* {vehicle.images.length > 1 && (
            <>
              <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white border-0 shadow-lg opacity-100 transition-opacity
 duration-200 hover:scale-110" />
              <CarouselNext className="right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white border-0 shadow-lg opacity-100 transition-opacity
 duration-200 hover:scale-110" />
            </>
          )} */}
        </Carousel>
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              vehicle.status
            )}`}
          >
            {vehicle.status}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col h-[calc(100%-13rem)]">
        {" "}
        {/* ⬅ flex column for content */}
        {/* Vehicle Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-1">
            {vehicle.name}
          </h3>

          <div className="space-y-2 mb-4">
            {/* Compact Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  {/* <DollarSign className="w-3.5 h-3.5 mr-1.5 text-neutral-500" /> */}
                  <span className="text-xs text-neutral-600">
                    Cash Offer
                  </span>
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  ${vehicle.cashOffer}
                </p>

              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {/* <DollarSign className="w-3.5 h-3.5 mr-1.5 text-green-600" /> */}
                    <span className="text-xs text-neutral-600">
                      Highest Bid
                    </span>
                  </div>
                  {calculatePercentageIncrease(vehicle.cashOffer, vehicle.highestBid) && (
                    <p className="text-sm text-emerald-600 font-medium">
                      +{calculatePercentageIncrease(vehicle.cashOffer, vehicle.highestBid)}%
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-green-700">
                  ${vehicle.highestBid?.amount ? vehicle.highestBid?.amount : "No highest bid"}
                </p>
              </div>
            </div>

            {vehicle.timeLeft && (
              <div className="flex items-center text-sm text-neutral-500">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{vehicle.timeLeft}</span>
              </div>
            )}
          </div>
        </div>
        {console.log("vehicle in dashboard page", vehicle)}
        {/* Action Buttons pinned bottom */}
        <div className="flex gap-2 mt-auto mb-4 justify-end">
          <Button
            variant="outline"
            size="sm"
            className=" h-10 cursor-pointer bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-neutral-900 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            onClick={handleViewClick}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          {canBidPass && vehicle.isPassed === false && (
            <Button
              onClick={handleBidNow}
              disabled={vehicle.isPassed}
              className={`cursor-pointer flex-1 h-10 text-xs font-medium rounded-lg transition-all duration-200 ${vehicle.isPassed
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                : "bg-orange-500 hover:bg-orange-600 text-white"
                }`}
              title={
                vehicle.isPassed
                  ? "Cannot bid on passed vehicle"
                  : "Place a bid"
              }
            >
              <Gavel className="w-3.5 h-3.5 mr-1" />
              Bid Now
            </Button>
          )}
        </div>
      </div>

      {/* Bid Dialog */}
      <BidDialog
        isOpen={isBidDialogOpen}
        onClose={handleCloseBidDialog}
        vehicle={vehicle}
        onBidSuccess={handleBidSuccess}
        onRefresh={onBidRefresh}
      />
    </motion.div>
  );
};

export default VehicleCard;
