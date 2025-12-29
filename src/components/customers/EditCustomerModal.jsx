import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Save, Loader2, User, Mail, Building2, CheckCircle2 } from 'lucide-react';
import { updateCustomer } from '@/lib/api';
import { carDealerApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const EditCustomerModal = ({
  isOpen,
  onClose,
  customer,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    zip: '',
    phone: '',
    address: '',
  });
  const [cityState, setCityState] = useState({
    city: '',
    state: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCityState, setIsFetchingCityState] = useState(false);

  // Initialize form data when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        zip: customer.zip || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
      setCityState({
        city: customer.city || '',
        state: customer.state || '',
      });
    }
  }, [customer]);

  // Fetch city and state from zip code
  const fetchCityState = async (zip) => {
    if (!zip || zip.length < 5) {
      setCityState({ city: '', state: '' });
      return;
    }

    try {
      setIsFetchingCityState(true);
      const response = await carDealerApi.get(`/location/city-state-by-zip?zipcode=${zip}`);

      // Handle the API response structure: response.data.location.city and response.data.location.state_name
      if (response.data.success && response.data.location) {
        setCityState({
          city: response.data.location.city || '',
          state: response.data.location.state_name || response.data.location.state || '',
        });
      } else if (response.data.success && response.data.data) {
        // Handle alternative response structure
        setCityState({
          city: response.data.data.city || '',
          state: response.data.data.state || response.data.data.state_name || '',
        });
      } else if (response.data.success && response.data.city) {
        // Handle another alternative response structure
        setCityState({
          city: response.data.city || '',
          state: response.data.state || response.data.state_name || '',
        });
      } else {
        setCityState({ city: '', state: '' });
        toast.error('Could not find location details for this ZIP code');
      }
    } catch (error) {
      console.error('Error fetching city/state:', error);
      setCityState({ city: '', state: '' });
      toast.error('Could not fetch city/state for this ZIP code');
    } finally {
      setIsFetchingCityState(false);
    }
  };

  // Handle zip code change with debounce
  useEffect(() => {
    if (formData.zip && formData.zip.length >= 5) {
      const timeoutId = setTimeout(() => {
        fetchCityState(formData.zip);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setCityState({ city: '', state: '' });
    }
  }, [formData.zip]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customer || !customer.id) {
      toast.error('Customer information is missing');
      return;
    }

    try {
      setIsLoading(true);

      const updateData = {};
      if (formData.zip !== (customer.zip || '')) {
        updateData.zip = formData.zip;
      }
      if (formData.phone !== (customer.phone || '')) {
        updateData.phone = formData.phone;
      }
      if (formData.address !== (customer.address || '')) {
        updateData.address = formData.address;
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save');
        setIsLoading(false);
        return;
      }

      const response = await updateCustomer(customer.id, updateData);

      if (response.success) {
        toast.success('Customer updated successfully');
        onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update customer';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        {/* Modern Header with Gradient */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 px-6 py-5 border-b border-orange-100/50">
          <DialogHeader className="space-y-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-neutral-900 tracking-tight">
                    Edit Customer
                  </DialogTitle>
                  <DialogDescription className="text-sm text-neutral-600 mt-1.5 font-medium">
                    {customer.name}
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
            {/* Read-only Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Account Information</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" />
                    Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      value={customer.name || ''}
                      disabled
                      className="bg-neutral-50/80 text-neutral-600 cursor-not-allowed border-neutral-200 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={customer.email || ''}
                      disabled
                      className="bg-neutral-50/80 text-neutral-600 cursor-not-allowed border-neutral-200 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Editable Information</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
              </div>

              {/* ZIP Code with City/State Display */}
              <div className="space-y-3">
                <Label htmlFor="zip" className="text-sm font-semibold text-neutral-700">
                  ZIP Code <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="zip"
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    placeholder="Enter ZIP code"
                    maxLength={10}
                    required
                    className={`pr-10 border-neutral-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all ${
                      isFetchingCityState ? 'border-orange-400 bg-orange-50/30' : ''
                    }`}
                    disabled={isFetchingCityState}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isFetchingCityState ? (
                      <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                    ) : (cityState.city || cityState.state) ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                </div>
                
                {/* Loading State */}
                {isFetchingCityState && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-700 font-medium">Fetching location details...</span>
                    </div>
                  </motion.div>
                )}
                
                {/* City/State Display Card - Always show when city or state exists */}
                <AnimatePresence>
                  {(cityState.city || cityState.state) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className={`bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border-2 border-orange-200/60 p-4 shadow-sm ${
                        isFetchingCityState ? 'opacity-75' : ''
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Location Details</span>
                          <div className="ml-auto">
                            {isFetchingCityState ? (
                              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-orange-600/80">City</Label>
                            <div className="text-sm font-semibold text-orange-900">
                              {cityState.city || 'N/A'}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-orange-600/80">State</Label>
                            <div className="text-sm font-semibold text-orange-900">
                              {cityState.state || 'N/A'}
                            </div>
                          </div>
                        </div>
                        {!isFetchingCityState && (
                          <div className="mt-3 pt-3 border-t border-orange-200/50">
                            <p className="text-xs text-orange-600/70">
                              ✓ City and state {formData.zip && formData.zip.length >= 5 ? 'automatically populated from ZIP code' : 'from customer record'}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  className="border-neutral-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold text-neutral-700">
                  Street Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                  rows={3}
                  className="border-neutral-300 focus:border-orange-500 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Modern Footer */}
          <DialogFooter className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-200 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-neutral-300 hover:bg-neutral-100 hover:border-neutral-400 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerModal;
