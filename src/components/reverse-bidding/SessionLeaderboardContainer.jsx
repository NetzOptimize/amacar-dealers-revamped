import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  MapPin,
  Users,
  Calendar,
  Award,
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
import { useSelector } from "react-redux";

// Component to track live countdown for session using API's time_remaining
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

const SessionLeaderboardContainer = ({
  leaderboard = [],
  session = null,
  onBidNow,
  onWithdrawBid,
}) => {
  const { user } = useSelector((state) => state.user);
  const columnHelper = createColumnHelper();

  // Find current dealer's bid
  const currentDealerBid = leaderboard.find(
    (bid) => bid.isCurrentDealer === true
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "Rank",
        cell: (info) => {
          const rank = info.getValue();
          const isTopThree = rank <= 3;
          return (
            <div className="flex items-center gap-2">
              {isTopThree && rank === 1 && (
                <Trophy className="w-5 h-5 text-yellow-500" />
              )}
              {isTopThree && rank === 2 && (
                <Trophy className="w-5 h-5 text-neutral-400" />
              )}
              {isTopThree && rank === 3 && (
                <Trophy className="w-5 h-5 text-orange-600" />
              )}
              <span
                className={`font-bold ${
                  isTopThree ? "text-primary-600" : "text-neutral-600"
                }`}
              >
                #{rank}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("dealerNameAnonymized", {
        header: "Dealer",
        cell: (info) => {
          const bid = info.row.original;
          const isCurrentDealer = bid.isCurrentDealer;
          return (
            <span
              className={`font-medium ${
                isCurrentDealer
                  ? "text-primary-600 font-semibold"
                  : "text-neutral-700"
              }`}
            >
              {bid.dealerNameAnonymized}
            </span>
          );
        },
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => {
          const price = info.getValue();
          return (
            <span className="font-semibold text-green-600">
              ${price.toLocaleString()}
            </span>
          );
        },
      }),
      columnHelper.accessor("perks", {
        header: "Perks",
        cell: (info) => {
          const perks = info.getValue();
          // If perks is already formatted as a string, display it
          // Otherwise format it nicely
          const displayPerks = typeof perks === 'string' 
            ? perks 
            : (perks ? JSON.stringify(perks) : 'No perks');
          
          return (
            <div className="text-sm text-neutral-600 max-w-md">
              {displayPerks || "No perks"}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const bid = info.row.original;
          const isCurrentDealer = bid.isCurrentDealer;
          const isSessionActive = session?.status === "active";
          const alreadyBid = session?.alreadyBid === true;

          // If this is the logged-in user's bid, show "Withdraw Bid" button
          if (isCurrentDealer) {
            return (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onWithdrawBid(bid.id)}
                disabled={!isSessionActive}
                className="flex items-center gap-2"
              >
                <TrendingDown className="w-4 h-4" />
                Withdraw Bid
              </Button>
            );
          }

          // If already bid flag is true but this is not the logged-in user's bid,
          // it means another dealership user from the same parent dealer has bid
          if (alreadyBid) {
            return (
              <span className="text-sm text-orange-600 font-medium">Your dealership</span>
            );
          }

          // Otherwise, show "Not your bid"
          return (
            <span className="text-sm text-neutral-400">Not your bid</span>
          );
        },
      }),
    ],
    [columnHelper, session, onWithdrawBid]
  );

  const table = useReactTable({
    data: leaderboard,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [{ id: "rank", desc: false }],
    },
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

  if (!session) {
    return null;
  }

  const isSessionActive = session.status === "active";

  return (
    <motion.div
      variants={itemVariants}
      className="space-y-6"
    >
      {/* Session Metadata */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {session.vehicle}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                <span>
                  <strong>Session ID:</strong> {session.sessionId}
                </span>
                <span>
                  <strong>Year:</strong> {session.year}
                </span>
                <span>
                  <strong>Make:</strong> {session.make}
                </span>
                <span>
                  <strong>Model:</strong> {session.model}
                </span>
                <span>
                  <strong>Condition:</strong> {session.condition}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={isSessionActive ? "default" : "secondary"}
                className="text-sm"
              >
                {isSessionActive ? "Active" : "Ended"}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Info className="w-4 h-4" />
                <span className="font-medium font-mono">
                  Time Left: <LiveCountdown session={session} />
                </span>
              </div>
            </div>
          </div>

          {/* Additional Session Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
            {/* Location Information */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 mb-1">Location</span>
                <span className="text-sm font-medium text-neutral-700">
                  {session.city && session.state 
                    ? `${session.city}, ${session.state}`
                    : session.zipCode !== 'N/A'
                    ? `ZIP: ${session.zipCode}`
                    : 'Location not specified'}
                </span>
                {session.radius && (
                  <span className="text-xs text-neutral-500 mt-1">
                    Radius: {session.radius} miles
                  </span>
                )}
              </div>
            </div>

            {/* Dealer Preference */}
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 mb-1">Dealer Preference</span>
                <span className="text-sm font-medium text-neutral-700 capitalize">
                  {session.dealerPreference === 'local' ? 'Local Dealers Only' : 'All Dealers'}
                </span>
              </div>
            </div>

            {/* Session Dates */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 mb-1">Session Duration</span>
                {session.startAt && (
                  <span className="text-sm font-medium text-neutral-700">
                    Started: {new Date(session.startAt).toLocaleString()}
                  </span>
                )}
                {session.expiresAt && (
                  <span className="text-xs text-neutral-500 mt-1">
                    Ends: {new Date(session.expiresAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Base Price */}
            {session.criteria?.price && (
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 mb-1">Base Price</span>
                  <span className="text-sm font-medium text-neutral-700">
                    ${parseFloat(session.criteria.price).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Total Bids */}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500 mb-1">Total Bids</span>
                <span className="text-sm font-medium text-neutral-700">
                  {session.totalBids || 0} {session.totalBids === 1 ? 'bid' : 'bids'}
                </span>
                {session.alreadyBid === true && (
                  <span className="text-xs text-orange-600 font-medium mt-1">Your dealership</span>
                )}
              </div>
            </div>

            {/* Winning Bid */}
            {session.winningBidId && (
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 mb-1">Winning Bid</span>
                  <span className="text-sm font-medium text-green-600">
                    Bid ID: {session.winningBidId}
                  </span>
                </div>
              </div>
            )}

            {/* Alternative Makes/Models */}
            {session.alternativeMakesModels && session.alternativeMakesModels.length > 0 && (
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500 mb-1">Alternative Options</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {session.alternativeMakesModels.map((alt, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {alt.make} {alt.model}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-6">
          Leaderboard
        </h3>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-neutral-200 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-neutral-700 font-semibold"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const bid = row.original;
                  const isCurrentDealer = bid.isCurrentDealer;

                  return (
                    <TableRow
                      key={row.id}
                      className={`border-neutral-200 transition-colors ${
                        isCurrentDealer
                          ? "bg-primary-50 hover:bg-primary-100"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-neutral-500"
                  >
                    No bids yet. Be the first to place a bid!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionLeaderboardContainer;

