import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, MapPin, Calendar, Shield, Building, AlertCircle } from 'lucide-react';
import { getCustomerDetails } from '../../../lib/api';

const CustomerDetailsModal = ({
  isOpen,
  onClose,
  customerId,
  customerName = "Customer",
  customerData = null // Optional: pass customer data directly
}) => {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getCustomerDetails(customerId);

      if (response.success && response.customer) {
        setCustomer(response.customer);
      } else {
        throw new Error('Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setError(error.message || 'Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  }, [customerId])

  // Use provided customer data or fetch from API
  useEffect(() => {
    if (isOpen) {
      if (customerData) {
        // Transform customer data from /admin/customers format to modal format
        setCustomer({
          basic_info: {
            display_name: customerData.name || customerName,
            first_name: customerData.name?.split(' ')[0] || '',
            last_name: customerData.name?.split(' ').slice(1).join(' ') || '',
            email: customerData.email || '',
            avatar: null
          },
          contact: {
            email: customerData.email || '',
            phone: customerData.phone || ''
          },
          address: {
            street: customerData.address || '',
            city: customerData.city || '',
            state: customerData.state || '',
            zip: customerData.zip || '',
            country: 'US'
          },
          account: {
            status: 'active',
            account_created: customerData.join_date || ''
          }
        });
        setIsLoading(false);
      } else if (customerId) {
        fetchCustomerDetails();
      }
    }
  }, [isOpen, customerId, customerData, customerName, fetchCustomerDetails]);



  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-emerald-600 bg-emerald-50';
      case 'inactive':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-[95vw] md:max-w-2xl max-h-[95vh] md:max-h-[90vh] bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-xl font-semibold text-neutral-900 truncate">
                    {isLoading ? 'Loading...' : customer?.basic_info?.display_name || customerName}
                  </h2>
                  <p className="text-xs md:text-sm text-neutral-500">Customer Details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200 flex-shrink-0"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(95vh-140px)] md:max-h-[calc(90vh-120px)] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 md:py-12">
                  <div className="text-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
                    <p className="text-sm md:text-base text-neutral-600">Loading customer details...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 md:py-12 px-4">
                  <div className="text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-red-500" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-neutral-900 mb-2">Error Loading Details</h3>
                    <p className="text-sm md:text-base text-neutral-600 mb-4 break-words">{error}</p>
                    <button
                      onClick={fetchCustomerDetails}
                      className="px-4 py-2 text-sm md:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : customer ? (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                  {/* Basic Info Card */}
                  <div className="bg-gradient-to-r from-neutral-50 to-white rounded-xl border border-neutral-200 p-4 md:p-6">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={customer.basic_info?.avatar || '/default-avatar.png'}
                          alt={customer.basic_info?.display_name || 'Customer'}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 md:border-4 border-white shadow-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80/6366f1/ffffff?text=' +
                              (customer.basic_info?.display_name?.charAt(0) || 'C');
                          }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white flex items-center justify-center ${getStatusColor(customer.account?.status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-1 truncate">
                          {customer.basic_info?.display_name || 'N/A'}
                        </h3>
                        <p className="text-base md:text-lg text-neutral-600 mb-2 truncate">
                          {customer.basic_info?.first_name} {customer.basic_info?.last_name}
                        </p>
                        <div className="flex items-center flex-wrap gap-2">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.account?.status)}`}>
                            {customer.account?.status || 'Unknown'}
                          </span>
                          <span className="text-xs md:text-sm text-neutral-500 truncate">
                            {customer.basic_info?.role || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 md:p-6">
                      <h4 className="text-base md:text-lg font-semibold text-neutral-900 mb-3 md:mb-4 flex items-center">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary-600 mr-2 flex-shrink-0" />
                        <span className="truncate">Contact Information</span>
                      </h4>
                      <div className="space-y-2 md:space-y-3">
                        <div>
                          <p className="text-xs md:text-sm text-neutral-500">Email</p>
                          <p className="text-sm md:text-base text-neutral-900 font-medium break-all">{customer.contact?.email || 'N/A'}</p>
                        </div>

                        <div>
                          <p className="text-xs md:text-sm text-neutral-500">Phone</p>
                          <p className="text-sm md:text-base text-neutral-900 font-medium break-all">{customer.contact?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-neutral-200 p-4 md:p-6">
                      <h4 className="text-base md:text-lg font-semibold text-neutral-900 mb-3 md:mb-4 flex items-center">
                        <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary-600 mr-2 flex-shrink-0" />
                        <span className="truncate">Address</span>
                      </h4>
                      <div className="space-y-2 md:space-y-3">
                        <div>
                          <p className="text-xs md:text-sm text-neutral-500">Street</p>
                          <p className="text-sm md:text-base text-neutral-900 font-medium break-words">{customer.address?.street || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-neutral-500">City, State, ZIP</p>
                          <p className="text-sm md:text-base text-neutral-900 font-medium break-words">
                            {customer.address?.city}, {customer.address?.state} {customer.address?.zip}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-neutral-500">Country</p>
                          <p className="text-sm md:text-base text-neutral-900 font-medium break-words">{customer.address?.country || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 md:p-6">
                    <h4 className="text-base md:text-lg font-semibold text-neutral-900 mb-3 md:mb-4 flex items-center">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary-600 mr-2 flex-shrink-0" />
                      <span className="truncate">Account Information</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2 md:space-y-3">
                        <div>
                          <p className="text-xs md:text-sm text-neutral-500">Account Created</p>
                          <p className="text-sm md:text-base text-neutral-900 font-medium break-words">{formatDate(customer.account?.account_created)}</p>
                        </div>


                      </div>
                      {/* <div className="space-y-3">
                        <div>
                          <p className="text-sm text-neutral-500">Email Verified</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            customer.account?.email_verified ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                          }`}>
                            {customer.account?.email_verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
         
                      </div> */}
                    </div>
                  </div>

                  {/* Additional Information */}
                  {(customer.additional?.company_name || customer.additional?.dealer_license || customer.additional?.notes) && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 md:p-6">
                      <h4 className="text-base md:text-lg font-semibold text-neutral-900 mb-3 md:mb-4 flex items-center">
                        <Building className="w-4 h-4 md:w-5 md:h-5 text-primary-600 mr-2 flex-shrink-0" />
                        <span className="truncate">Additional Information</span>
                      </h4>
                      <div className="space-y-2 md:space-y-3">
                        {customer.additional?.company_name && (
                          <div>
                            <p className="text-xs md:text-sm text-neutral-500">Company Name</p>
                            <p className="text-sm md:text-base text-neutral-900 font-medium break-words">{customer.additional.company_name}</p>
                          </div>
                        )}
                        {customer.additional?.dealer_license && (
                          <div>
                            <p className="text-xs md:text-sm text-neutral-500">Dealer License</p>
                            <p className="text-sm md:text-base text-neutral-900 font-medium break-words">{customer.additional.dealer_license}</p>
                          </div>
                        )}
                        {customer.additional?.notes && (
                          <div>
                            <p className="text-xs md:text-sm text-neutral-500">Notes</p>
                            <p className="text-sm md:text-base text-neutral-900 font-medium break-words">{customer.additional.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 md:p-6 border-t border-neutral-200 bg-neutral-50">
              <button
                onClick={onClose}
                className="cursor-pointer px-5 md:px-6 py-2 text-sm md:text-base text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors duration-200 w-full md:w-auto"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomerDetailsModal;
