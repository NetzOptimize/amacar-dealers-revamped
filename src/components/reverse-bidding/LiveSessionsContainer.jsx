import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { submitBid, fetchLiveSessions } from "@/redux/slices/reverseBiddingSlice";
import { toast } from "react-hot-toast";
import {
  Eye,
  Clock,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Users,
  MapPin,
  Image as ImageIcon,
  MoreHorizontal,
  User,
  Car,
  AlertCircle,
  Ban,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomerDetailsModal from "@/components/common/CustomerDetailsModal/CustomerDetailsModal";
import BidNowDialog from "@/components/reverse-bidding/BidNowDialog";

// Component to track live countdown for each session using API's time_remaining
const LiveCountdown = ({ session }) => {
  const [displayTime, setDisplayTime] = useState(() => {
    if (session.isExpired) return "Expired";
    if (session.timeRemainingFormatted) return session.timeRemainingFormatted;
    return "00:00:00";
  });
  
  useEffect(() => {
    if (session.isExpired) {
      setDisplayTime("Expired");
      return;
    }
    
    // Get initial values from API
    const timeData = session.timeRemainingData;
    if (!timeData || !timeData.seconds) {
      return;
    }
    
    // Store when we start counting
    const startTime = Date.now();
    const initialSeconds = timeData.seconds;
    
    // Update every second
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, initialSeconds - elapsed);
      
      if (remaining <= 0) {
        setDisplayTime("Expired");
        clearInterval(interval);
        return;
      }
      
      const h = Math.floor(remaining / 3600);
      const m = Math.floor((remaining % 3600) / 60);
      const s = remaining % 60;
      
      setDisplayTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [session.timeRemainingData, session.isExpired]);
  
  return <span>{displayTime}</span>;
};

const LiveSessionsContainer = ({ sessions = [], hideMyBids = false, hideTimeLeft = false, isWonSessions = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Get current dealer ID from Redux
  const currentDealerId = useSelector((state) => state.user?.user?.ID || state.user?.user?.id);
  
  // Customer modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  
  // Bid dialog state
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Handle view customer
  const handleViewCustomer = useCallback((customerId, customerName = "") => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    setIsCustomerModalOpen(true);
  }, []);

  // Handle close customer modal
  const handleCloseCustomerModal = useCallback(() => {
    setIsCustomerModalOpen(false);
    setSelectedCustomerId(null);
    setSelectedCustomerName("");
  }, []);
  
  // Handle open bid dialog
  const handleOpenBidDialog = useCallback((session) => {
    setSelectedSession(session);
    setBidDialogOpen(true);
  }, []);
  
  // Handle close bid dialog
  const handleCloseBidDialog = useCallback(() => {
    setBidDialogOpen(false);
    setSelectedSession(null);
  }, []);
  
  // Handle bid submission
  const handleBidSubmit = useCallback(async (bidData) => {
    try {
      await dispatch(submitBid(bidData)).unwrap();
      toast.success("Bid submitted successfully");
      handleCloseBidDialog();
      // Refresh sessions list to show updated bid counts
      dispatch(fetchLiveSessions());
    } catch (error) {
      toast.error(error || "Failed to submit bid");
      throw error;
    }
  }, [dispatch, handleCloseBidDialog]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "image",
        header: "Image",
        cell: (info) => {
          const session = info.row.original;
          
          return (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-200 flex items-center justify-center">
              {session.primaryVehicleImage ? (
                <img
                  src={session.primaryVehicleImage}
                  alt={session.vehicle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ display: session.primaryVehicleImage ? 'none' : 'flex' }}
              >
                <ImageIcon className="w-6 h-6 text-neutral-400" />
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("vehicle", {
        header: "Vehicle",
        cell: (info) => {
          const session = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-900">
                {session.vehicle}
              </span>
              <span className="text-sm text-neutral-500">
                {session.year} • {session.model}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => {
          const session = info.row.original;
          const price = info.getValue();
          return (
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                {price ? new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(price) : 'N/A'}
              </span>
            </div>
          );
        },
      }),
      // Only show "Time Left" column if not hidden
      ...(hideTimeLeft ? [] : [
        columnHelper.accessor("timeLeft", {
          header: "Time Left",
          cell: (info) => {
            const session = info.row.original;
            const isExpired = session.isExpired;
            const totalSeconds = session.timeLeftSeconds || 0;
            const isLowTime = totalSeconds < 3600 && totalSeconds > 0; // Less than 1 hour
            const isCriticalTime = totalSeconds < 900 && totalSeconds > 0; // Less than 15 minutes
            
            return (
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${
                  isExpired ? 'text-red-500' : isCriticalTime ? 'text-red-500' : isLowTime ? 'text-orange-500' : 'text-blue-500'
                }`} />
                <span className={`font-medium font-mono ${
                  isExpired ? 'text-red-600' : isCriticalTime ? 'text-red-600' : isLowTime ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  <LiveCountdown session={session} />
                </span>
              </div>
            );
          },
        }),
      ]),
      columnHelper.accessor("totalBids", {
        header: "Total Bids",
        cell: (info) => {
          const session = info.row.original;
          const totalBids = info.getValue() || 0;
          
          // Determine if user is winning or losing
          let bidStatus = null; // null, 'winning', or 'losing'
          if (currentDealerId && session.leaderboard && session.leaderboard.length > 0) {
            // Normalize dealer ID for comparison (handle both string and number)
            const normalizedDealerId = String(currentDealerId);
            
            // Get user's bids from leaderboard
            // Check both transformed format (isCurrentDealer, dealerId) and raw format (dealer_id, dealer_user_id)
            const userBids = session.leaderboard.filter((bid) => {
              if (bid.isCurrentDealer) return true;
              const bidDealerId = bid.dealerId || bid.dealer_id || bid.dealer_user_id;
              return bidDealerId && String(bidDealerId) === normalizedDealerId;
            });
            
            // If user has bids, check their status
            if (userBids.length > 0) {
              // Get user's lowest bid
              const userLowestBid = Math.min(...userBids.map(bid => {
                const price = bid.price || bid.amount;
                return parseFloat(price) || 0;
              }));
              
              // Get overall lowest bid (first in sorted leaderboard, or find minimum)
              const allBids = session.leaderboard.map(bid => {
                const price = bid.price || bid.amount;
                return parseFloat(price) || 0;
              });
              const overallLowestBid = Math.min(...allBids);
              
              // User is winning if their lowest bid equals the overall lowest bid
              // User is losing if overall lowest bid is lower than user's lowest bid
              if (overallLowestBid !== undefined && !isNaN(overallLowestBid)) {
                bidStatus = userLowestBid === overallLowestBid ? 'winning' : 'losing';
              }
            }
          }
          
          const alreadyBid = session.alreadyBid === true;
          
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-neutral-700">{totalBids}</span>
              </div>
              {alreadyBid && (
                <span className="text-xs text-orange-600 font-medium">Your dealership</span>
              )}
              {bidStatus && (
                <Badge 
                  variant={bidStatus === 'winning' ? 'default' : 'destructive'}
                  className={`text-xs px-2 py-0.5 w-fit flex items-center gap-1 ${
                    bidStatus === 'winning' 
                      ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' 
                      : ''
                  }`}
                >
                  {bidStatus === 'winning' ? (
                    <>
                      <TrendingDown className="w-3 h-3" />
                      Winning
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Losing
                    </>
                  )}
                </Badge>
              )}
            </div>
          );
        },
      }),
      // Only show "My Bids" column if not hidden
      ...(hideMyBids ? [] : [
        columnHelper.accessor("dealerBidCount", {
          header: "My Bids",
          cell: (info) => {
            const session = info.row.original;
            const dealerBidCount = info.getValue() || 0;
            const alreadyBid = session.alreadyBid === true;
            return (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <TrendingDown className={`w-4 h-4 ${alreadyBid ? 'text-orange-500' : 'text-neutral-400'}`} />
                  <span className={`font-medium ${alreadyBid ? 'text-orange-600' : 'text-neutral-500'}`}>
                    {dealerBidCount}
                  </span>
                </div>
                {alreadyBid && (
                  <Badge 
                    variant="default" 
                    className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100"
                  >
                    Bid Placed
                  </Badge>
                )}
              </div>
            );
          },
        }),
      ]),
      columnHelper.display({
        id: "location",
        header: "Location",
        cell: (info) => {
          const session = info.row.original;
          const locationParts = [];
          if (session.city) locationParts.push(session.city);
          if (session.state) locationParts.push(session.state);
          if (locationParts.length === 0 && session.zipCode && session.zipCode !== 'N/A') {
            locationParts.push(session.zipCode);
          }
          return (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-700">
                {locationParts.length > 0 ? locationParts.join(', ') : session.zipCode || 'N/A'}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const session = info.row.original;
          const status = info.getValue();
          // If expired, show expired badge regardless of status
          const isExpired = session.isExpired;
          const variant = isExpired ? "destructive" : (status === "active" ? "default" : "secondary");
          const statusText = isExpired ? "Expired" : (status === "active" ? "Active" : "Ended");
          return (
            <Badge variant={variant} className="capitalize">
              {statusText}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const session = info.row.original;
          // Disable if expired or not active (only for live sessions)
          const isActive = session.status === "active" && !session.isExpired;
          
          // For won sessions, show dropdown menu
          if (isWonSessions) {
            const customerUserId = session.customerUserId || session.customer_user_id;
            const productId = session.winningBidProductId || session.winning_bid?.product_id || session.primaryVehicleId;
            // Get customer name from winning bid or session data
            const customerName = session.winning_bid?.customer_name || 
                                session.customer_name || 
                                session.customerContact?.name || 
                                "";
            
            return (
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
                  className="w-56 bg-white border border-neutral-200 rounded-xl shadow-lg p-1 overflow-hidden backdrop-blur-sm bg-opacity-90 z-50"
                >
                  {customerUserId && (
                    <DropdownMenuItem
                      onClick={() => handleViewCustomer(customerUserId, customerName)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                    >
                      <User className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                      <span>View Customer</span>
                    </DropdownMenuItem>
                  )}
                  {productId && (
                    <DropdownMenuItem
                      onClick={() => navigate(`/vehicle-details/${productId}`, {
                        state: {
                          source: 'reverse-bid', // Reverse bid sessions are dealer vehicles
                        },
                      })}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                    >
                      <Car className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                      <span>View Vehicle</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => navigate(`/reverse-bidding/session/${session.id}`)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                  >
                    <Eye className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                    <span>View Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          
          // For live sessions, show dropdown menu with three dots
          // Use already_bid flag from API to determine if user has already bid
          // This flag is true if the parent dealer or any dealership user with the same parent has bid
          const hasUserBids = session.alreadyBid === true;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-neutral-100 cursor-pointer"
                  disabled={!isActive}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={4}
                className="w-56 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl p-1 overflow-hidden z-50"
              >
                {hasUserBids ? (
                  <DropdownMenuItem
                    disabled={true}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-700 rounded-lg cursor-not-allowed opacity-70 transition-all duration-200 group"
                  >
                    <Ban className="w-4 h-4 text-red-500" />
                    <span>Already bid</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleOpenBidDialog(session)}
                    disabled={!isActive}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                  >
                    <DollarSign className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                    <span>Bid Now</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => navigate(`/reverse-bidding/session/${session.id}`)}
                  disabled={!isActive}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 focus:bg-orange-50 focus:text-orange-700 focus:outline-none transition-all duration-200 group"
                >
                  <Eye className="w-4 h-4 text-neutral-500 group-hover:text-orange-600 group-focus:text-orange-600 transition-colors duration-200" />
                  <span>View Session</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    [columnHelper, navigate, hideMyBids, hideTimeLeft, isWonSessions, handleViewCustomer, currentDealerId, handleOpenBidDialog]
  );

  const table = useReactTable({
    data: sessions,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Row animation variants
  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  };

  // Header animation variants
  const headerRowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // Create motion versions of table components
  const MotionTableRow = motion(TableRow);
  const MotionTableCell = motion(TableCell);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6"
    >
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          placeholder="Search sessions..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <MotionTableRow
                key={headerGroup.id}
                variants={headerRowVariants}
                initial="hidden"
                animate="visible"
                className="border-neutral-200 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.id !== "actions";
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className="text-neutral-700 font-semibold"
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isSortable ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={
                          isSortable
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && (
                          <span className="flex flex-col">
                            {isSorted === "asc" ? (
                              <ArrowUp className="w-3 h-3 text-primary-600" />
                            ) : isSorted === "desc" ? (
                              <ArrowDown className="w-3 h-3 text-primary-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </MotionTableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const session = row.original;
                const isActive = session.status === "active" && !session.isExpired;
                
                return (
                  <MotionTableRow
                    key={row.id}
                    custom={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className="border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking on interactive elements (buttons, links, dropdowns)
                      const target = e.target;
                      if (!target || typeof target.closest !== 'function') return;
                      
                      const isInteractiveElement = 
                        target.closest('button') || 
                        target.closest('a') || 
                        target.closest('[role="button"]') ||
                        target.closest('[data-radix-popper-content-wrapper]') ||
                        target.closest('[data-radix-dropdown-menu-content]');
                      
                      if (!isInteractiveElement && isActive) {
                        navigate(`/reverse-bidding/session/${session.id}`);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <MotionTableCell
                        key={cell.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="py-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </MotionTableCell>
                    ))}
                  </MotionTableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-8 text-neutral-500"
                >
                  No sessions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
      />
      
      {/* Bid Now Dialog */}
      {selectedSession && (
        <BidNowDialog
          isOpen={bidDialogOpen}
          onClose={handleCloseBidDialog}
          session={selectedSession}
          onSubmit={handleBidSubmit}
        />
      )}
    </motion.div>
  );
};

export default LiveSessionsContainer;

