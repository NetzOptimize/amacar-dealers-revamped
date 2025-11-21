import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { DollarSign, Gift, Loader2, Package, Car, ChevronDown } from "lucide-react";
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
  
  // Track the last session ID we fetched products for to prevent duplicate calls
  const lastFetchedSessionIdRef = useRef(null);

  // Get selected product details
  const selectedProduct = useMemo(() => {
    return eligibleProducts.find(p => String(p.id) === String(productId));
  }, [productId, eligibleProducts]);

  useEffect(() => {
    // Only fetch when dialog opens and we haven't already fetched for this session
    if (isOpen && session?.id) {
      const sessionId = session.id;
      
      // Reset form when dialog opens
      setBidAmount("");
      setPerks("");
      setProductId("");
      setErrors({});
      setIsSubmitting(false);
      
      // Only fetch if we haven't already fetched for this session ID
      if (lastFetchedSessionIdRef.current !== sessionId && !productsLoading) {
        lastFetchedSessionIdRef.current = sessionId;
        dispatch(fetchEligibleProducts(sessionId));
      }
    } else if (!isOpen) {
      // Reset the ref when dialog closes
      lastFetchedSessionIdRef.current = null;
    }
  }, [isOpen, session?.id, dispatch, productsLoading]);

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl ring-1 ring-white/20">
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
              Select Vehicle <span className="text-error">*</span>
            </Label>
            {productsLoading ? (
              <div className="flex items-center gap-2 text-sm text-neutral-500 p-4 border border-neutral-200 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading vehicles...
              </div>
            ) : (
              <div className="relative">
                <select
                  id="productId"
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    if (errors.productId) {
                      setErrors({ ...errors, productId: "" });
                    }
                  }}
                  className={`w-full px-4 py-3 pr-10 border rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer ${
                    errors.productId 
                      ? "border-red-300 bg-red-50" 
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                  disabled={isSubmitting || productsLoading}
                >
                  <option value="">-- Select a vehicle --</option>
                  {eligibleProducts.map((product) => {
                    const displayName = product.title || `${product.year} ${product.make} ${product.model}`;
                    const condition = product.new_used === 'N' ? 'New' : 'Used';
                    const price = product.price ? parseFloat(product.price).toLocaleString() : 'N/A';
                    return (
                      <option key={product.id} value={product.id}>
                        {displayName} • {condition} • ${price}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            )}
            {errors.productId && (
              <p className="text-sm text-red-600">{errors.productId}</p>
            )}
            {eligibleProducts.length === 0 && !productsLoading && (
              <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <p className="text-sm text-neutral-500 text-center">
                  No eligible vehicles found for this session
                </p>
              </div>
            )}
            
            {/* Selected Product Preview */}
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 text-sm mb-1">
                      {selectedProduct.title || `${selectedProduct.year} ${selectedProduct.make} ${selectedProduct.model}`}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                      <span>{selectedProduct.year}</span>
                      <span>•</span>
                      <span>{selectedProduct.make} {selectedProduct.model}</span>
                      <span>•</span>
                      <span className="font-medium text-primary-700">
                        ${parseFloat(selectedProduct.price || 0).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>{selectedProduct.new_used === 'N' ? 'New' : 'Used'}</span>
                      {selectedProduct.city && selectedProduct.state && (
                        <>
                          <span>•</span>
                          <span>{selectedProduct.city}, {selectedProduct.state}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
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
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-neutral-700 mb-3">Session Details</p>
            <div className="grid grid-cols-3 gap-4 text-sm text-neutral-600">
              <div>
                <p className="font-medium text-neutral-500 mb-1">Vehicle</p>
                <p className="text-neutral-700">{session.vehicle} {session.year}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-500 mb-1">Model</p>
                <p className="text-neutral-700">{session.model}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-500 mb-1">Time Left</p>
                <p className="text-neutral-700">{session.timeLeft}</p>
              </div>
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

