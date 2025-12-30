import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";

const WithdrawBidDialog = ({
  isOpen,
  onClose,
  session,
  bid,
  onConfirm,
  isLoading = false,
}) => {
  if (!session || !bid) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm({
        sessionId: session.id || session.sessionId,
        bidId: bid.id,
      });
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Withdraw Bid
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to withdraw your bid for{" "}
            <strong>{session.vehicle}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bid Details */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-neutral-700">
              Your Bid Details
            </p>
            <div className="text-sm text-neutral-600 space-y-1">
              <p>
                <strong>Bid Amount:</strong> ${bid.price.toLocaleString()}
              </p>
              {bid.perks && (
                <p>
                  <strong>Perks:</strong> {bid.perks}
                </p>
              )}
              <p>
                <strong>Current Rank:</strong> #{bid.rank}
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  Once you withdraw your bid, you cannot participate in this
                  session anymore. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Withdrawing...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Confirm Withdraw
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawBidDialog;

