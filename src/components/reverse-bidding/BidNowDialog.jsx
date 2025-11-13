import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Gift, Loader2, Package } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  fetchEligibleProducts,
  selectEligibleProducts,
  selectEligibleProductsLoading,
} from "@/redux/slices/reverseBiddingSlice";

const BidNowDialog = ({ isOpen, onClose, session, onSubmit }) => {
  const dispatch = useDispatch();
  const eligibleProducts = useSelector(selectEligibleProducts);
  const productsLoading = useSelector(selectEligibleProductsLoading);
  
  const [productId, setProductId] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [perks, setPerks] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && session?.id) {
      setBidAmount("");
      setPerks("");
      setProductId("");
      setErrors({});
      setIsSubmitting(false);
      // Fetch eligible products when dialog opens
      dispatch(fetchEligibleProducts(session.id));
    }
  }, [isOpen, session, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!productId || productId === "") {
      newErrors.productId = "Please select a product";
    }

    if (!bidAmount || bidAmount.trim() === "") {
      newErrors.bidAmount = "Bid amount is required";
    } else {
      const amount = parseFloat(bidAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.bidAmount = "Please enter a valid bid amount";
      }
      if (amount > 1000000) {
        newErrors.bidAmount = "Bid amount seems too high";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        sessionId: session?.id || session?.sessionId,
        productId: parseInt(productId),
        bidAmount: parseFloat(bidAmount),
        perks: perks.trim() || undefined,
      });

      toast.success("Bid submitted successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setBidAmount(value);
      if (errors.bidAmount) {
        setErrors({ ...errors, bidAmount: "" });
      }
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            Place Your Bid
          </DialogTitle>
          <DialogDescription>
            Enter your bid amount and any perks you'd like to offer for{" "}
            <strong>{session.vehicle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-2">
            <Label htmlFor="productId" className="text-sm font-semibold">
              Select Product <span className="text-error">*</span>
            </Label>
            {productsLoading ? (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading products...
              </div>
            ) : (
              <select
                id="productId"
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  if (errors.productId) {
                    setErrors({ ...errors, productId: "" });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.productId ? "border-error" : "border-neutral-200"
                }`}
                disabled={isSubmitting || productsLoading}
              >
                <option value="">-- Select a product --</option>
                {eligibleProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name || `Product #${product.id}`}
                    {product.price && ` - $${product.price.toLocaleString()}`}
                  </option>
                ))}
              </select>
            )}
            {errors.productId && (
              <p className="text-sm text-error">{errors.productId}</p>
            )}
            {eligibleProducts.length === 0 && !productsLoading && (
              <p className="text-xs text-neutral-500">
                No eligible products found for this session
              </p>
            )}
          </div>

          {/* Bid Amount */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="text-sm font-semibold">
              Bid Amount <span className="text-error">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                id="bidAmount"
                type="text"
                value={bidAmount}
                onChange={handleAmountChange}
                placeholder="25000"
                className={`pl-10 ${
                  errors.bidAmount ? "border-error" : "border-neutral-200"
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.bidAmount && (
              <p className="text-sm text-error">{errors.bidAmount}</p>
            )}
            <p className="text-xs text-neutral-500">
              Lower prices are more competitive in reverse bidding
            </p>
          </div>

          {/* Perks */}
          <div className="space-y-2">
            <Label htmlFor="perks" className="text-sm font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Perks (Optional)
            </Label>
            <Textarea
              id="perks"
              value={perks}
              onChange={(e) => setPerks(e.target.value)}
              placeholder="e.g., Free oil change, Extended warranty, 1-year free maintenance"
              rows={3}
              className="border-neutral-200"
              disabled={isSubmitting}
            />
            <p className="text-xs text-neutral-500">
              Describe any additional perks or services you're offering
            </p>
          </div>

          {/* Session Info */}
          <div className="bg-neutral-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-neutral-700">Session Details</p>
            <div className="text-sm text-neutral-600 space-y-1">
              <p>
                <strong>Vehicle:</strong> {session.vehicle} {session.year}
              </p>
              <p>
                <strong>Model:</strong> {session.model}
              </p>
              <p>
                <strong>Time Left:</strong> {session.timeLeft}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Submit Bid
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidNowDialog;

