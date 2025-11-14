import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
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

          if (!isCurrentDealer) {
            return (
              <span className="text-sm text-neutral-400">Not your bid</span>
            );
          }

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
      </div>

      {/* Action Bar - Show Bid Now if dealer hasn't placed a bid and session is active */}
      {!currentDealerBid && isSessionActive && !session.isExpired && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary-900 mb-1">
                Ready to place your bid?
              </h3>
              <p className="text-sm text-primary-700">
                Submit your best offer to compete in this reverse bidding
                session.
              </p>
            </div>
            <Button
              onClick={onBidNow}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Bid Now
            </Button>
          </div>
        </div>
      )}

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

