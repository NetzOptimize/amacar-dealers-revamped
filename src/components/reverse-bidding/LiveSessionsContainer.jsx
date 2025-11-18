import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
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

const LiveSessionsContainer = ({ sessions = [] }) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

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
              <span className="font-semibold text-neutral-900">
                {price ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(price) : 'N/A'}
              </span>
            </div>
          );
        },
      }),
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
      columnHelper.accessor("totalBids", {
        header: "Total Bids",
        cell: (info) => {
          const session = info.row.original;
          const totalBids = info.getValue() || 0;
          return (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-neutral-700">{totalBids}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("dealerBidCount", {
        header: "My Bids",
        cell: (info) => {
          const session = info.row.original;
          const dealerBidCount = info.getValue() || 0;
          return (
            <div className="flex items-center gap-1.5">
              <TrendingDown className={`w-4 h-4 ${dealerBidCount > 0 ? 'text-orange-500' : 'text-neutral-400'}`} />
              <span className={`font-medium ${dealerBidCount > 0 ? 'text-orange-600' : 'text-neutral-500'}`}>
                {dealerBidCount}
              </span>
            </div>
          );
        },
      }),
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
          // Disable if expired or not active
          const isActive = session.status === "active" && !session.isExpired;
          
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/reverse-bidding/session/${session.id}`)}
              disabled={!isActive}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Session
            </Button>
          );
        },
      }),
    ],
    [columnHelper, navigate]
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

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6"
    >
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search sessions..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
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
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-neutral-200 hover:bg-neutral-50 transition-colors"
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
              ))
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
    </motion.div>
  );
};

export default LiveSessionsContainer;

