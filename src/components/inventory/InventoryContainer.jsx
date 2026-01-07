import { motion } from "framer-motion";
import {
  Eye,
  Edit,
  Car,
  MoreHorizontal,
  Image as ImageIcon,
  MapPin,
  CheckCircle,
  XCircle,
  PackageSearch,
  DollarSign,
  Tag,
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
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const InventoryContainer = ({
  vehicles = [],
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  pagination = null,
  searchQuery = '',
  onPageChange = () => {},
  onViewVehicle = () => {},
}) => {
  const { user } = useSelector((state) => state.user);
  const userRole = user?.role;
  const isAdminOrSalesManager = userRole === 'administrator' || userRole === 'sales_manager';
  const navigate = useNavigate();
  const [isDesktop, setIsDesktop] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('=== Inventory Container Debug ===');
    console.log('User:', user);
    console.log('User Role:', userRole);
    console.log('Is Admin or Sales Manager:', isAdminOrSalesManager);
    console.log('Vehicles:', vehicles);
    if (vehicles.length > 0) {
      console.log('First vehicle:', vehicles[0]);
      console.log('First vehicle dealer_info:', vehicles[0]?.dealer_info);
    }
  }, [user, userRole, isAdminOrSalesManager, vehicles]);

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
    onViewVehicle(vehicleId);
  };

  // Get primary image from vehicle images array
  const getPrimaryImage = (vehicle) => {
    if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) {
      // Find primary image or use first image
      const primaryImage = vehicle.images.find(img => img.is_primary) || vehicle.images[0];
      return primaryImage.url || primaryImage;
    }
    return null;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return '$0';
    return `$${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  // Get vehicle title
  const getVehicleTitle = (vehicle) => {
    if (vehicle.title) return vehicle.title;
    const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Untitled Vehicle';
  };

  // Format new/used status
  const formatNewUsed = (newUsed) => {
    if (!newUsed) return 'N/A';
    return newUsed === 'N' ? 'New' : newUsed === 'U' ? 'Used' : newUsed;
  };

  // Format location
  const formatLocation = (vehicle) => {
    const parts = [];
    if (vehicle.city) parts.push(vehicle.city);
    if (vehicle.state) parts.push(vehicle.state);
    if (vehicle.zip_code) parts.push(vehicle.zip_code);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Get inventory status badge color
  const getInventoryStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'sold':
        return 'bg-gray-100 text-gray-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-4">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {isAdminOrSalesManager ? 'All Inventory' : 'My Inventory'}
            </h3>
            <p className="text-sm text-neutral-600">
              {isAdminOrSalesManager ? 'All vehicles in the system' : 'All vehicles in your inventory'}
            </p>
          </div>
        </div>
        <div className="text-sm text-neutral-500">
          {totalItems > 0 ? (
            `Showing ${startIndex}-${endIndex} of ${totalItems} vehicles`
          ) : (
            'No vehicles found'
          )}
        </div>
      </div>

      {/* Desktop Table Layout */}
      {isDesktop && (
        <motion.div 
          className="overflow-x-auto"
          key={`table-${vehicles.length}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
        <Table className={`w-full ${isAdminOrSalesManager ? 'min-w-[1400px]' : 'min-w-[1200px]'}`}>
          <TableHeader>
            <TableRow className="border-neutral-200 hover:bg-transparent">
              <TableHead className="text-neutral-600 font-medium w-[7%]">
                Photo
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[9%]">
                VIN
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[14%]">
                Vehicle
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[6%]">
                Mileage
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[7%]">
                Stock #
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[7%]">
                MSRP
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[8%]">
                Online Price
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[7%]">
                Status
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[6%]">
                Days
              </TableHead>
              <TableHead className="text-neutral-600 font-medium w-[7%]">
                In Bidding
              </TableHead>
              {isAdminOrSalesManager && (
                <TableHead className="text-neutral-600 font-medium w-[9%]">
                  Dealership
                </TableHead>
              )}
              <TableHead className="text-neutral-600 font-medium text-right w-[7%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdminOrSalesManager ? 13 : 12} className="py-12 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <PackageSearch className="w-16 h-16 text-neutral-300 mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                      {searchQuery ? 'No vehicles found' : 'No vehicles in inventory'}
                    </h3>
                    <p className="text-sm text-neutral-500 max-w-md">
                      {searchQuery ? (
                        <>
                          No vehicles match your search for "<span className="font-medium">{searchQuery}</span>". 
                          Try adjusting your search terms to see more results.
                        </>
                      ) : (
                        'You don\'t have any vehicles in your inventory yet. Add vehicles to get started.'
                      )}
                    </p>
                  </motion.div>
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle, index) => {
              const primaryImage = getPrimaryImage(vehicle);
              const vehicleTitle = getVehicleTitle(vehicle);
              
              // Debug logging for first vehicle
              if (index === 0) {
                console.log('=== Vehicle Debug ===');
                console.log('Vehicle ID:', vehicle.id);
                console.log('Vehicle object:', vehicle);
                console.log('dealer_info:', vehicle.dealer_info);
                console.log('Has dealer_info:', !!vehicle.dealer_info);
                console.log('isAdminOrSalesManager:', isAdminOrSalesManager);
              }
              
              return (
                <TableRow
                  key={vehicle.id}
                  className="border-neutral-100 hover:bg-neutral-50 transition-colors duration-200"
                >
                  <TableCell className="py-4.5">
                    <div className="flex items-center justify-center">
                      {(vehicle.photo || primaryImage) ? (
                        <img
                          src={vehicle.photo || primaryImage}
                          alt={vehicleTitle}
                          className="w-20 h-16 object-cover rounded-lg border border-neutral-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-20 h-16 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center ${(vehicle.photo || primaryImage) ? 'hidden' : ''}`}
                      >
                        <ImageIcon className="w-6 h-6 text-neutral-400" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-xs text-neutral-700 font-mono">
                        {vehicle.vin || 'N/A'}
                      </div>
                      {vehicle.new_used && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${
                          vehicle.new_used === 'N' || vehicle.new_used === 'New'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {vehicle.new_used === 'N' || vehicle.new_used === 'New' ? 'New' : 'Used'}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="space-y-1.5">
                      <div className="text-sm font-semibold text-neutral-900 leading-tight">
                        {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'N/A'}
                      </div>
                      {vehicle.trim && (
                        <div className="text-xs text-neutral-500">
                          {vehicle.trim}
                        </div>
                      )}
                      {/* Incentives and Perks Indicators */}
                      <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        {vehicle.has_incentives && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 border border-green-200">
                            <DollarSign className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Incentives</span>
                          </div>
                        )}
                        {vehicle.has_perks && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200">
                            <Tag className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-medium text-orange-700">Perks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs text-neutral-600">
                      {vehicle.mileage ? vehicle.mileage.toLocaleString() : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs text-neutral-600 font-mono">
                      {vehicle.stock_number || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-sm text-neutral-700">
                      {vehicle.msrp ? formatPrice(vehicle.msrp) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="font-semibold text-green-600 text-sm">
                      {formatPrice(vehicle.price)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInventoryStatusColor(vehicle.status || vehicle.inventory_status)}`}>
                      {(vehicle.status || vehicle.inventory_status || 'active').replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="text-xs text-neutral-600">
                      {vehicle.days_in_inventory || 0} days
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {vehicle.in_reverse_bidding ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-xs text-orange-600 font-medium">
                          {vehicle.active_bids_count || 0} bid{vehicle.active_bids_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-neutral-400" />
                        <span className="text-xs text-neutral-400">No</span>
                      </div>
                    )}
                  </TableCell>
                  {isAdminOrSalesManager && (
                    <TableCell className="py-3">
                      {vehicle.dealer_info ? (
                        <div className="text-xs text-neutral-700 space-y-1">
                          {vehicle.dealer_info.dealership_name ? (
                            <div className="font-semibold text-neutral-900 text-sm">
                              {vehicle.dealer_info.dealership_name}
                            </div>
                          ) : (
                            <div className="text-neutral-400 text-xs">No Dealership</div>
                          )}
                          {vehicle.dealer_info.dealer_name && (
                            <div className="text-neutral-700 text-xs">
                              {vehicle.dealer_info.dealer_name}
                            </div>
                          )}
                          {vehicle.dealer_info.dealer_email && (
                            <a
                              href={`mailto:${vehicle.dealer_info.dealer_email}`}
                              className="text-primary-600 hover:text-primary-700 hover:underline text-xs block truncate"
                              title={vehicle.dealer_info.dealer_email}
                            >
                              {vehicle.dealer_info.dealer_email}
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-400">N/A</div>
                      )}
                    </TableCell>
                  )}
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
                          <DropdownMenuItem
                            onClick={() => handleViewVehicle(vehicle.id)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                          >
                            <Eye className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewVehicle(vehicle.id)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                          >
                            <Edit className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                            <span>Edit Vehicle</span>
                          </DropdownMenuItem>
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
          key={`mobile-${vehicles.length}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
        {vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-50 rounded-xl p-8 text-center border border-neutral-200"
          >
            <PackageSearch className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              {searchQuery ? 'No vehicles found' : 'No vehicles in inventory'}
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              {searchQuery ? (
                <>
                  No vehicles match your search for "<span className="font-medium">{searchQuery}</span>". 
                  Try adjusting your search terms to see more results.
                </>
              ) : (
                'You don\'t have any vehicles in your inventory yet. Add vehicles to get started.'
              )}
            </p>
          </motion.div>
        ) : (
          vehicles.map((vehicle, index) => {
          const primaryImage = getPrimaryImage(vehicle);
          const vehicleTitle = getVehicleTitle(vehicle);
          
          return (
            <motion.div
              key={vehicle.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex gap-4">
                {/* Vehicle Image on Left */}
                <div className="flex-shrink-0">
                  {primaryImage ? (
                    <img
                      src={primaryImage}
                      alt={vehicleTitle}
                      className="w-28 h-20 object-cover rounded-lg border border-neutral-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-28 h-20 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center ${primaryImage ? 'hidden' : ''}`}
                  >
                    <ImageIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 space-y-3">
                  {/* Vehicle Title */}
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-base">
                      {vehicleTitle}
                    </h4>
                    {vehicle.vin && (
                      <div className="text-xs text-neutral-500 mt-0.5">
                        VIN: {vehicle.vin}
                      </div>
                    )}
                    {/* Incentives and Perks Indicators */}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {vehicle.has_incentives && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 border border-green-200">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-700">Incentives</span>
                        </div>
                      )}
                      {vehicle.has_perks && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200">
                          <Tag className="w-3 h-3 text-orange-600" />
                          <span className="text-xs font-medium text-orange-700">Perks</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Price</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatPrice(vehicle.price)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Condition</span>
                      <span className="text-xs text-neutral-700">
                        {formatNewUsed(vehicle.new_used)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-neutral-600">Location</span>
                      <div className="flex items-center gap-1 text-xs text-neutral-700 text-right max-w-[200px]">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate" title={formatLocation(vehicle)}>
                          {formatLocation(vehicle)}
                        </span>
                      </div>
                    </div>
                    {isAdminOrSalesManager && vehicle.dealer_info && (
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-neutral-600">Dealership</span>
                        <div className="text-xs text-neutral-700 text-right max-w-[200px] space-y-0.5">
                          {vehicle.dealer_info.dealership_name ? (
                            <div className="font-medium text-neutral-900">
                              {vehicle.dealer_info.dealership_name}
                            </div>
                          ) : (
                            <div className="text-neutral-400">N/A</div>
                          )}
                          {vehicle.dealer_info.dealer_name && (
                            <div className="text-neutral-600">
                              {vehicle.dealer_info.dealer_name}
                            </div>
                          )}
                          {vehicle.dealer_info.dealer_email && (
                            <a
                              href={`mailto:${vehicle.dealer_info.dealer_email}`}
                              className="text-primary-600 hover:underline truncate block"
                              title={vehicle.dealer_info.dealer_email}
                            >
                              {vehicle.dealer_info.dealer_email}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Status</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getInventoryStatusColor(vehicle.inventory_status)}`}>
                        {vehicle.inventory_status || 'active'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-neutral-600">Reverse Biddable</span>
                      <div className="flex items-center gap-1">
                        {vehicle.is_reverse_biddable === 'true' || vehicle.is_reverse_biddable === true ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-neutral-400" />
                            <span className="text-xs text-neutral-400">No</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-neutral-600">Date Added</span>
                      <div className="text-xs text-neutral-700 text-right space-y-0.5">
                        <div>{formatDateOnly(vehicle.post_date)}</div>
                        <div className="text-neutral-500">{formatTimeOnly(vehicle.post_date)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-10 text-sm hover:bg-neutral-100"
                      onClick={() => handleViewVehicle(vehicle.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
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

export default InventoryContainer;

