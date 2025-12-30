import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  Calendar,
  Clock,
  TrendingDown,
  Info,
  DollarSign,
} from "lucide-react";

const SessionDetailsModal = ({ isOpen, onClose, session, bidHistory = [] }) => {
  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary-600" />
            Session Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this reverse bidding session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Vehicle Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicle Information
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Vehicle:</span>
                <span className="text-sm font-medium text-neutral-900">
                  {session.vehicle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Year:</span>
                <span className="text-sm font-medium text-neutral-900">
                  {session.year}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Model:</span>
                <span className="text-sm font-medium text-neutral-900">
                  {session.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Condition:</span>
                <Badge variant="outline" className="text-xs">
                  {session.condition}
                </Badge>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Session Information
            </h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Session ID:</span>
                <span className="text-sm font-medium text-neutral-900 font-mono">
                  {session.sessionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Status:</span>
                <Badge
                  variant={session.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {session.status === "active" ? "Active" : "Ended"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Time Left:</span>
                <span className="text-sm font-medium text-orange-600">
                  {session.timeLeft}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Duration:</span>
                <span className="text-sm font-medium text-neutral-900">
                  {session.sessionDuration}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Started:</span>
                <span className="text-sm font-medium text-neutral-900">
                  {new Date(session.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bid History */}
          {bidHistory && bidHistory.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Recent Bids
              </h3>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-2 max-h-40 overflow-y-auto">
                {bidHistory.slice(0, 5).map((bid, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-neutral-600">
                      Rank #{bid.rank} - {bid.dealerNameAnonymized}
                    </span>
                    <span className="font-medium text-green-600">
                      ${bid.price.toLocaleString()}
                    </span>
                  </div>
                ))}
                {bidHistory.length > 5 && (
                  <p className="text-xs text-neutral-500 text-center pt-2">
                    And {bidHistory.length - 5} more bids...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailsModal;

