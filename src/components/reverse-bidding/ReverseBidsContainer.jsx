import { motion } from "framer-motion";
import {
  Eye,
  Gavel,
  MoreHorizontal,
  Image as ImageIcon,
  MapPin,
  CheckCircle2,
  DollarSign,
  Clock,
  Building2,
  User,
  Mail,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ReverseBidsContainer = ({
  bids = [],
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pagination = null,
  onPageChange = () => {},
  onViewBid = () => {},
}) => {
  const { user } = useSelector((state) => state.user);
  const userRole = user?.role;
  const isAdminOrSalesManager = userRole === 'administrator' || userRole === 'sales_manager';
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);

  // Handle custom breakpoint at 1404px
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1404);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Calculate pagination display using API pagination data
  const perPage = pagination?.per_page || 20;
  const totalItems = pagination?.total_items || totalCount || 0;
  const currentPageNum = pagination?.current_page || currentPage;
  const startIndex = pagination ? (currentPageNum - 1) * perPage + 1 : (currentPage - 1) * perPage + 1;
  const endIndex = pagination 
    ? Math.min(currentPageNum * perPage, totalItems)
    : Math.min(currentPage * perPage, totalItems);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Format date (date only)
  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time (time only)
  const formatTimeOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'revised':
        return 'bg-blue-100 text-blue-700';
      case 'withdrawn':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  // Get vehicle image
  const getVehicleImage = (bid) => {
    if (bid.session?.primary_vehicle_image) {
      return bid.session.primary_vehicle_image;
    }
    if (bid.product?.images && Array.isArray(bid.product.images) && bid.product.images.length > 0) {
      const primaryImage = bid.product.images.find(img => img.is_primary) || bid.product.images[0];
      return typeof primaryImage === 'string' ? primaryImage : primaryImage.url;
    }
    return null;
  };

  // Get vehicle title
  const getVehicleTitle = (bid) => {
    if (bid.product) {
      const parts = [bid.product.year, bid.product.make, bid.product.model].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : 'Vehicle';
    }
    return 'Vehicle';
  };

  // Format location
  const formatLocation = (bid) => {
    if (!bid.session) return 'N/A';
    const parts = [];
    if (bid.session.city) parts.push(bid.session.city);
    if (bid.session.state) parts.push(bid.session.state);
    if (bid.session.zip_code && !bid.session.city && !bid.session.state) parts.push(bid.session.zip_code);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-4">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Gavel className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {isAdminOrSalesManager ? 'All Reverse Bids' : 'My Reverse Bids'}
            </h3>
            <p className="text-sm text-neutral-600">
              {isAdminOrSalesManager ? 'All reverse bids in the system' : 'All reverse bids you have submitted'}
            </p>
          </div>
        </div>
        <div className="text-sm text-neutral-500">
          {totalItems > 0 ? (
            `Showing ${startIndex}-${endIndex} of ${totalItems} bids`
          ) : (
            'No bids found'
          )}
        </div>
      </div>

      {/* Desktop Table Layout */}
      {isDesktop && (
        <motion.div 
          className="overflow-x-auto"
          key={`table-${bids.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
        <Table className={`w-full ${isAdminOrSalesManager ? 'min-w-[1500px]' : 'min-w-[1300px]'}`}>
          <TableHeader>
            <TableRow className="border-neutral-200 hover:bg-transparent">
              <TableHead className="text-neutral-600 font-medium w-[10%]">
                Image
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[15%]">
                Vehicle
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[10%]">
                Bid Amount
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[8%]">
                Position
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[12%]">
                Location
              </TableHead>
              {isAdminOrSalesManager && (
                <TableHead className="text-neutral-600 font-medium w-[14%]">
                  Dealer
                </TableHead>
              )}
              <TableHead className="text-neutral-600 font-medium w-[12%]">
                Date Submitted
              </TableHead>
              <TableHead className="text-neutral-600 font-medium text-right w-[9%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdminOrSalesManager ? 8 : 7} className="py-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <Gavel className="w-16 h-16 text-neutral-300 mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                      No reverse bids found
                    </h3>
                    <p className="text-sm text-neutral-500 max-w-md">
                      {isAdminOrSalesManager 
                        ? 'No reverse bids have been submitted yet.'
                        : "You haven't submitted any reverse bids yet. Start participating in live sessions to place your bids!"}
                    </p>
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : (
              bids.map((bid) => {
              const vehicleImage = getVehicleImage(bid);
              const vehicleTitle = getVehicleTitle(bid);
              
              return (
                <TableRow
                  key={bid.bid_id}
                  className="border-neutral-100 hover:bg-neutral-50 transition-colors duration-200"
                >
                  <TableCell className="py-4.5">
                    <div className="flex items-center justify-center">
                      {vehicleImage ? (
                        <img
                          src={vehicleImage}
                          alt={vehicleTitle}
                          className="w-20 h-16 object-cover rounded-lg border border-neutral-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-20 h-16 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center ${vehicleImage ? 'hidden' : ''}`}
                      >
                        <ImageIcon className="w-6 h-6 text-neutral-400" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4.5">
                    <div>
                      <div className="font-semibold text-neutral-900 text-sm">
                        {vehicleTitle}
                      </div>
                      {bid.product?.vin && (
                        <div className="text-xs text-neutral-500 mt-0.5">
                          VIN: {bid.product.vin}
                        </div>
                      )}
                      {bid.is_winning_bid && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Won</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-green-600 text-sm">
                      {formatCurrency(bid.amount)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs text-neutral-600">
                      {bid.position ? `#${bid.position}` : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-1 text-xs text-neutral-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[120px]" title={formatLocation(bid)}>
                        {formatLocation(bid)}
                      </span>
                    </div>
                  </TableCell>
                  {isAdminOrSalesManager && (
                    <TableCell className="py-3">
                      {bid.dealer_info ? (
                        <div className="text-xs text-neutral-700 space-y-1">
                          {bid.dealer_info.dealership_name ? (
                            <div className="font-semibold text-neutral-900 text-sm">
                              {bid.dealer_info.dealership_name}
                            </div>
                          ) : (
                            <div className="text-neutral-400 text-xs">No Dealership</div>
                          )}
                          {bid.dealer_info.dealer_name && (
                            <div className="text-neutral-700 text-xs">
                              {bid.dealer_info.dealer_name}
                            </div>
                          )}
                          {bid.dealer_info.dealer_email && (
                            <a
                              href={`mailto:${bid.dealer_info.dealer_email}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline text-xs block truncate"
                              title={bid.dealer_info.dealer_email}
                            >
                              {bid.dealer_info.dealer_email}
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-400">N/A</div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="py-3">
                    <div className="text-xs text-neutral-600 space-y-0.5">
                      <div>{formatDateOnly(bid.created_at)}</div>
                      <div className="text-neutral-500">{formatTimeOnly(bid.created_at)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-neutral-100 cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          side="bottom"
                          sideOffset={4}
                          className="w-56 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 overflow-hidden backdrop-blur-sm bg-opacity-90 z-50 absolute top-full right-0 mt-2"
                        >
                          {bid.session_id && (
                            <DropdownMenuItem
                              onClick={() => navigate(`/reverse-bidding/session/${bid.session_id}`)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                            >
                              <Eye className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                              <span>View Session</span>
                            </DropdownMenuItem>
                          )}
                          {bid.product_id && (
                            <DropdownMenuItem
                              onClick={() => navigate(`/vehicle-details/${bid.product_id}`)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                            >
                              <Eye className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                              <span>View Vehicle</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
        </motion.div>
      )}

      {/* Mobile Card Layout */}
      {!isDesktop && (
        <motion.div 
          className="space-y-4"
          key={`mobile-${bids.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
        {bids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-50 rounded-xl p-8 text-center border border-neutral-200"
          >
            <Gavel className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No reverse bids found
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              {isAdminOrSalesManager 
                ? 'No reverse bids have been submitted yet.'
                : "You haven't submitted any reverse bids yet. Start participating in live sessions to place your bids!"}
            </p>
          </motion.div>
        ) : (
          bids.map((bid) => {
          const vehicleImage = getVehicleImage(bid);
          const vehicleTitle = getVehicleTitle(bid);
          
          return (
            <motion.div
              key={bid.bid_id}
              className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex gap-4">
                {/* Vehicle Image on Left */}
                <div className="flex-shrink-0">
                  {vehicleImage ? (
                    <img
                      src={vehicleImage}
                      alt={vehicleTitle}
                      className="w-28 h-20 object-cover rounded-lg border border-neutral-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-28 h-20 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center ${vehicleImage ? 'hidden' : ''}`}
                  >
                    <ImageIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                </div>

                {/* Bid Info */}
                <div className="flex-1 space-y-3">
                  {/* Vehicle Title */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-base">
                      {vehicleTitle}
                    </h4>
                    {bid.is_winning_bid && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Won</span>
                      </div>
                    )}
                  </div>

                  {/* Bid Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Bid Amount</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(bid.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Position</span>
                      <span className="text-xs text-neutral-700">
                        {bid.position ? `#${bid.position}` : 'N/A'}
                      </span>
                    </div>
                    {bid.session && (bid.session.city || bid.session.state || bid.session.zip_code) && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-neutral-600">Location</span>
                        <div className="flex items-center gap-1 text-xs text-neutral-700 text-right max-w-[200px]">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate" title={formatLocation(bid)}>
                            {formatLocation(bid)}
                          </span>
                        </div>
                      </div>
                    )}
                    {isAdminOrSalesManager && bid.dealer_info && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-neutral-600">Dealer</span>
                        <div className="text-xs text-neutral-700 text-right max-w-[200px] space-y-0.5">
                          {bid.dealer_info.dealership_name ? (
                            <div className="font-medium text-neutral-900">
                              {bid.dealer_info.dealership_name}
                            </div>
                          ) : (
                            <div className="text-neutral-400">No Dealership</div>
                          )}
                          {bid.dealer_info.dealer_name && (
                            <div className="text-neutral-600">
                              {bid.dealer_info.dealer_name}
                            </div>
                          )}
                          {bid.dealer_info.dealer_email && (
                            <a
                              href={`mailto:${bid.dealer_info.dealer_email}`}
                              className="text-primary-600 hover:underline truncate block"
                              title={bid.dealer_info.dealer_email}
                            >
                              {bid.dealer_info.dealer_email}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-neutral-600">Date Submitted</span>
                      <div className="text-xs text-neutral-700 text-right space-y-0.5">
                        <div>{formatDateOnly(bid.created_at)}</div>
                        <div className="text-neutral-500">{formatTimeOnly(bid.created_at)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {bid.session_id && (
                      <button
                        onClick={() => navigate(`/reverse-bidding/session/${bid.session_id}`)}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        View Session
                      </button>
                    )}
                    {bid.product_id && (
                      <button
                        onClick={() => navigate(`/vehicle-details/${bid.product_id}`)}
                        className="flex-1 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
                      >
                        View Vehicle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
        )}
        </motion.div>
      )}
    </div>
  );
};

export default ReverseBidsContainer;

