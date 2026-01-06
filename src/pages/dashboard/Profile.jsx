import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Key,
  CreditCard,
  Calendar,
  DollarSign,
  Settings,
  Camera,
  X,
  XCircle,
  AlertTriangle,
  Download,
  FileText,
  Receipt,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  loadUser,
  fetchProfileInfo,
  fetchSubscriptionStatus,
  fetchBillingInfo,
  uploadProfilePicture,
  removeProfilePicture,
  restartSubscription,
  cancelSubscriptionRequest,
} from "@/redux/slices/userSlice";

import EditProfileModal from "@/components/ui/ProfileUI/EditProfileModal";
import ProfileSkeleton from "@/components/skeletons/Profile/ProfileSkeleton";
import toast from "react-hot-toast";
import ChangePasswordModal from "@/components/ui/ProfileUI/ChangePasswrdModa";
import TwoFactorAuthModal from "@/components/ui/ProfileUI/TwoFactorAuthModal";
import CancelSubscriptionModal from "@/components/ui/CancelSubscriptionModal";
import api from "@/lib/api";
// import ChangePasswordModal from "@/components/ui/ChangePasswordModal";
// import TwoFactorAuthModal from "@/components/ui/TwoFactorAuthModal";

const Profile = () => {
  const dispatch = useDispatch();
  const {
    user,
    loading,
    status,
    error,
    subscription,
    subscriptionLoading,
    subscriptionError,
    billing,
    billingLoading,
    billingError,
    uploadProfilePictureLoading,
    uploadProfilePictureError,
    removeProfilePictureLoading,
    removeProfilePictureError,
    restartSubscriptionLoading,
    restartSubscriptionError,
    cancelSubscriptionRequestLoading,
    cancelSubscriptionRequestError,
  } = useSelector((state) => state.user);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] =
    useState(false);
  const [cancelModalMode, setCancelModalMode] = useState("request"); // "request" or "status"
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState(null);
  const [cancellationStatusLoading, setCancellationStatusLoading] =
    useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  const [invoicesFetched, setInvoicesFetched] = useState(false);

  // Default profile data structure
  const defaultProfile = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    zipcode: "",
    state: "",
    city: "",
    bio: "Car enthusiast and frequent seller on Amacar platform.",
    joinDate: "",
    totalAuctions: 0,
    totalEarnings: 0,
    rating: 0,
    company: "",
    profile_picture: null,
    user_status: "",
    account_status: "",
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [editData, setEditData] = useState({ ...profile });

  // Get 2FA status from user data
  const isTwoFactorEnabled =
    user?.two_fa === "enabled" ||
    user?.two_fa === true ||
    user?.two_fa === 1 ||
    user?.requires_2fa === "enabled" ||
    user?.requires_2fa === true ||
    user?.requires_2fa === 1;

  // Check if user should show warning banner and get warning type
  const getWarningInfo = () => {
    if (!user) return { show: false, type: null };

    // Check if user role is one of the specified roles
    const validRoles = ["dealer", "sales_manager", "dealer_user", "dealership_user", "administrator"];
    const hasValidRole =
      validRoles.includes(user.role) ||
      (user.roles && user.roles.some((role) => validRoles.includes(role)));

    if (!hasValidRole) return { show: false, type: null };

    // Check user status (pending or rejected) - highest priority
    const userStatus = user.user_status_details?.status;
    if (userStatus === "pending") {
      return { show: true, type: "pending" };
    } else if (userStatus === "rejected") {
      return { show: true, type: "rejected" };
    }

    // Check account status
    const isAccountInactive = user.user_status_details?.account_status === "inactive";
    const isSubscriptionInactive = user.subscription_status === "inactive";

    if (isAccountInactive) {
      return { show: true, type: "account" };
    } else if (isSubscriptionInactive) {
      return { show: true, type: "subscription" };
    }

    return { show: false, type: null };
  };

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (invoicesLoading || invoicesFetched) {
      return; // Prevent duplicate calls
    }

    setInvoicesLoading(true);
    setInvoicesError(null);
    try {
      const response = await api.get("/profile/invoices");
      if (response.data.success) {
        setInvoices(response.data.invoices || []);
        setInvoicesFetched(true);
      } else {
        setInvoicesError("Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoicesError("Failed to fetch invoices");
    } finally {
      setInvoicesLoading(false);
    }
  }, [invoicesLoading, invoicesFetched]);

  // Download invoice PDF
  const downloadInvoice = (invoicePdfUrl, invoiceNumber) => {
    try {
      const link = document.createElement("a");
      link.href = invoicePdfUrl;
      link.download = `invoice-${invoiceNumber}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  // Load user data from Redux state and fetch profile info
  useEffect(() => {
    console.log("uploadProfilePictureLoading", uploadProfilePictureLoading);
    console.log("removeProfilePictureLoading", removeProfilePictureLoading);
    console.log("user", user);
  }, [uploadProfilePictureLoading, removeProfilePictureLoading, user]);
  useEffect(() => {
    console.log("profile page user data: ", user);

    if (user) {
      const userProfile = {
        firstName: user.first_name || user.display_name?.split(" ")[0] || "",
        lastName: user.last_name || user.display_name?.split(" ")[1] || "",
        email: user.email || "",
        phone: user.meta?.phone || "",
        zipcode: user.meta?.zip || "",
        state: user.meta?.state || "",
        city: user.meta?.city || "",
        bio:
          user.bio || "Car enthusiast and frequent seller on Amacar platform.",
        joinDate: user.user_registered
          ? new Date(user.user_registered).toLocaleDateString()
          : "",
        totalAuctions: user.totalAuctions || user.total_auctions || 0,
        totalEarnings: user.totalEarnings || user.total_earnings || 0,
        rating: user.rating || 0,
        dealershipName: user.dealership_name || "",
        profile_picture: user.profile_picture || null,
        user_status: user.user_status || "",
        account_status: user.account_status || "",
      };
      setProfile(userProfile);
      setEditData(userProfile);
    }
  }, [user]);

  // Load user data and fetch profile info on component mount
  useEffect(() => {
    dispatch(loadUser());
    dispatch(fetchProfileInfo());
    dispatch(fetchSubscriptionStatus());
    dispatch(fetchBillingInfo());
  }, [dispatch]);

  // Fetch invoices when user is loaded and is a dealer
  useEffect(() => {
    if (
      user &&
      (user.role === "dealer" ||
        (user.roles && user.roles.includes("dealer"))) &&
      !invoicesFetched
    ) {
      fetchInvoices();
    }
  }, [user, invoicesFetched, fetchInvoices]);

  useEffect(() => {
    console.log("subscription", subscription);
  }, [subscription]);

  // Fetch cancellation status when subscription data is available
  useEffect(() => {
    if (subscription && subscription.has_subscription) {
      fetchCancellationStatus();
    }
  }, [subscription]);

  const handleEdit = () => {
    setEditData({ ...profile });
    setShowEditModal(true);
  };

  const handleSave = async (updatedData) => {
    try {
      // The updateProfile action is already called in the EditProfileModal
      // This function is called after successful API update
      setProfile({ ...updatedData });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setShowEditModal(false);
  };

  const handleTwoFactorToggle = () => {
    setShowTwoFactorModal(true);
  };

  const handleTwoFactorSuccess = () => {
    // Force refresh user data after successful 2FA toggle
    dispatch(loadUser());
  };

  const handleCancelSubscriptionSuccess = () => {
    // Refresh subscription data after successful cancellation
    dispatch(fetchSubscriptionStatus());
  };

  const handleOpenCancelModal = (mode) => {
    setCancelModalMode(mode);
    setShowCancelSubscriptionModal(true);
  };

  // Fetch cancellation status from API
  const fetchCancellationStatus = async () => {
    try {
      setCancellationStatusLoading(true);
      const response = await api.get("/subscription/cancellation-status");

      if (response.data.success) {
        setCancellationStatus(response.data.cancellation_status);
      } else {
        setCancellationStatus(null);
      }
    } catch (error) {
      console.error("Error fetching cancellation status:", error);
      setCancellationStatus(null);
    } finally {
      setCancellationStatusLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select JPG, PNG, or GIF images only");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      // Create preview URL for immediate UI update
      const reader = new FileReader();
      reader.onload = (e) => {
        // Update profile with new image preview
        const newProfile = {
          ...profile,
          profile_picture: {
            url: e.target.result,
            file: file,
          },
        };
        setProfile(newProfile);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        const result = await dispatch(uploadProfilePicture(file)).unwrap();
        console.log("Profile picture uploaded successfully:", result);
        toast.success("Image uploaded successfully");

        // Update profile with server response
        const newProfile = {
          ...profile,
          profile_picture: {
            id: result.attachment_id,
            url: result.url,
          },
        };
        setProfile(newProfile);
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        // Revert to original profile picture on error
        if (user?.profile_picture?.url) {
          const revertedProfile = {
            ...profile,
            profile_picture: {
              id: user.profile_picture.id,
              url: user.profile_picture.url,
            },
          };
          setProfile(revertedProfile);
        }
      }
    }
  };

  // Handle profile picture removal
  const handleProfilePictureRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const result = await dispatch(removeProfilePicture()).unwrap();
      console.log("Profile picture removed successfully:", result);
      toast.success("Profile picture removed successfully");

      // Update profile to remove picture
      const newProfile = {
        ...profile,
        profile_picture: null,
      };
      setProfile(newProfile);
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
      toast.error(error || "Failed to remove profile picture");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="mt-8 md:mt-6 lg:mt-20 min-h-screen bg-gradient-hero p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="card p-4 sm:p-6 lg:p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                dispatch(loadUser());
                dispatch(fetchProfileInfo());
              }}
              className="btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 md:mt-6 lg:mt-20 min-h-screen bg-gradient-hero p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Warning Banner */}
          {(() => {
            const warningInfo = getWarningInfo();
            if (!warningInfo.show) return null;

            if (warningInfo.type === "pending") {
              return (
                <motion.div
                  variants={itemVariants}
                  className="card p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-amber-500 bg-amber-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">
                        Account Under Review
                      </h3>
                      <p className="text-amber-700 mb-3">
                        Your profile is currently under review by our team. You will receive full platform access once the review process is complete. We appreciate your patience during this time.
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            } else if (warningInfo.type === "rejected") {
              return (
                <motion.div
                  variants={itemVariants}
                  className="card p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-red-500 bg-red-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Account Review Unsuccessful
                      </h3>
                      <p className="text-red-700 mb-3">
                        Our team has reviewed your account application, and unfortunately, it did not meet our current platform requirements. If you believe this is an error or have additional information to provide, please contact our support team for further assistance.
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            } else if (warningInfo.type === "account") {
              return (
                <motion.div
                  variants={itemVariants}
                  className="card p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-red-500 bg-red-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Account Deactivated
                      </h3>
                      <p className="text-red-700 mb-3">
                        Your account has been deactivated and you have limited
                        access to the platform. 
                      </p>
                     
                    </div>
                  </div>
                </motion.div>
              );
            } else if (warningInfo.type === "subscription") {
              return (
                <motion.div
                  variants={itemVariants}
                  className="card p-4 sm:p-6 mb-6 sm:mb-8 border-l-4 border-orange-500 bg-orange-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-800 mb-2">
                        No Active Subscription
                      </h3>
                      <p className="text-orange-700 mb-3">
                        You don't have an active subscription. Subscribe to a plan
                        to access all platform features and continue using the service.
                      </p>
                    
                    </div>
                  </div>
                </motion.div>
              );
            }
            return null;
          })()}

          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-800">
                Profile Settings
              </h1>
              <button
                onClick={handleEdit}
                className="cursor-pointer btn-secondary flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex justify-center sm:justify-start">
                <div
                  className="relative cursor-pointer group"
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                  onClick={
                    profile.profile_picture?.url
                      ? handleProfilePictureRemove
                      : () =>
                          document
                            .getElementById("profile-picture-input")
                            .click()
                  }
                >
                  <input
                    id="profile-picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                  />

                  {profile.profile_picture?.url ? (
                    <div className="relative">
                      <img
                        src={profile.profile_picture.url}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary-200 transition-all duration-300 group-hover:border-primary-400"
                      />
                      {/* Hover Overlay */}
                      <div
                        className={`absolute inset-0 rounded-full bg-[var(--brand-orange)] bg-opacity-50 flex items-center justify-center transition-all duration-300 ${
                          isHoveringAvatar ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <X className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-primary-200">
                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
                      </div>
                      {/* Hover Overlay */}
                      <div
                        className={`absolute inset-0 rounded-full bg-[var(--brand-orange)] bg-opacity-50 flex items-center justify-center transition-all duration-300 ${
                          isHoveringAvatar ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Upload/Remove indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      uploadProfilePictureLoading || removeProfilePictureLoading
                        ? "bg-orange-500 animate-pulse"
                        : "bg-primary-600"
                    } ${isHoveringAvatar ? "scale-110" : "scale-100"}`}
                  >
                    {uploadProfilePictureLoading ||
                    removeProfilePictureLoading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : profile.profile_picture?.url ? (
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.display_name || "User Profile"}
                </h2>
                <p className="text-sm sm:text-base text-neutral-600">
                  {profile.joinDate
                    ? `Member since ${profile.joinDate}`
                    : "New member"}
                </p>
                {profile.dealershipName && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {profile.dealershipName}
                  </p>
                )}
                {(uploadProfilePictureError || removeProfilePictureError) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      {uploadProfilePictureError || removeProfilePictureError}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      profile.user_status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {profile.user_status || "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div
            variants={itemVariants}
            className="card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
          >
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 mb-4 sm:mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700">
                  Email Address
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-neutral-600">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {profile.email || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700">
                  Phone Number
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-neutral-600">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {profile.phone || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700">
                  City
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-neutral-600">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {profile.city || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700">
                  State
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-neutral-600">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {profile.state || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700">
                  Zipcode
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-neutral-600">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {profile.zipcode || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-700">
                  Dealership
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base text-neutral-600">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    {profile.dealershipName || "Not provided"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {user &&
            (user.role === "dealer" ||
              (user.roles && user.roles.includes("dealer"))) && (
              <div>
                {/* Subscription Status */}
                <motion.div
                  variants={itemVariants}
                  className="card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
                >
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 mb-4 sm:mb-6">
                    Subscription Status
                  </h3>

                  {subscriptionLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-neutral-600">
                        Loading subscription...
                      </span>
                    </div>
                  ) : subscriptionError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-4">{subscriptionError}</p>
                      <button
                        onClick={() => dispatch(fetchSubscriptionStatus())}
                        className="btn-primary"
                      >
                        Retry
                      </button>
                    </div>
                  ) : subscription ? (
                    <div className="space-y-4">
                      {/* Subscription Status Card */}
                      <div
                        className={`p-4 sm:p-6 rounded-xl border-2 ${
                          subscription.has_subscription
                            ? subscription.status === "trialing"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                subscription.has_subscription
                                  ? subscription.status === "trialing"
                                    ? "bg-blue-500"
                                    : "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <h4 className="text-lg font-semibold text-neutral-800">
                              {subscription.has_subscription
                                ? "Active Subscription"
                                : "No Subscription"}
                            </h4>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              subscription.status === "trialing"
                                ? "bg-blue-100 text-blue-800"
                                : subscription.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {subscription.status?.charAt(0).toUpperCase() +
                              subscription.status?.slice(1) || "Unknown"}
                          </span>
                        </div>

                        {subscription.has_subscription && (
                          <div className="space-y-6">
                            {/* Trial Information - Prominent Display */}
                            {subscription.is_trialing && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                      <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="text-xl font-bold text-blue-900">
                                        Trial Period Active
                                      </h4>
                                      <p className="text-blue-700">
                                        You're currently in your trial period
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-3xl font-bold text-blue-900">
                                      $
                                      {subscription.trial_amount *
                                        subscription.quantity}
                                    </div>
                                    <div className="text-sm text-blue-700">
                                      Trial Amount
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center mb-2">
                                      <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                      <span className="text-sm font-medium text-blue-800">
                                        Trial Started
                                      </span>
                                    </div>
                                    <div className="text-lg font-semibold text-blue-900">
                                      {subscription.trial_start_date
                                        ? new Date(
                                            subscription.trial_start_date
                                          ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })
                                        : "N/A"}
                                    </div>
                                  </div>

                                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center mb-2">
                                      <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                      <span className="text-sm font-medium text-blue-800">
                                        Trial Ends
                                      </span>
                                    </div>
                                    <div className="text-lg font-semibold text-blue-900">
                                      {subscription.trial_end_date
                                        ? new Date(
                                            subscription.trial_end_date
                                          ).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })
                                        : "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Subscription Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                                <div className="flex items-center mb-3">
                                  <CreditCard className="w-5 h-5 text-neutral-600 mr-2" />
                                  <h5 className="font-semibold text-neutral-800">
                                    Subscription Details
                                  </h5>
                                </div>
                                <div className="space-y-3 text-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <CreditCard className="w-4 h-4 text-neutral-500 mr-1" />
                                      <span className="text-neutral-600">
                                        Stripe ID:
                                      </span>
                                    </div>
                                    <span className="font-mono text-xs text-neutral-500 truncate max-w-24">
                                      {subscription.stripe_subscription_id ||
                                        "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Settings className="w-4 h-4 text-neutral-500 mr-1" />
                                      <span className="text-neutral-600">
                                        Status:
                                      </span>
                                    </div>
                                    <span className="font-medium capitalize">
                                      {subscription.status || "Unknown"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Billing Information */}
                              <div className="bg-white p-4 rounded-lg border border-neutral-200">
                                <div className="flex items-center mb-3">
                                  <DollarSign className="w-5 h-5 text-neutral-600 mr-2" />
                                  <h5 className="font-semibold text-neutral-800">
                                    Billing Information
                                  </h5>
                                </div>
                                {billingLoading ? (
                                  <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                    <span className="ml-2 text-sm text-neutral-600">
                                      Loading billing...
                                    </span>
                                  </div>
                                ) : billingError ? (
                                  <div className="text-center py-4">
                                    <p className="text-red-600 text-sm mb-2">
                                      {billingError}
                                    </p>
                                    <button
                                      onClick={() =>
                                        dispatch(fetchBillingInfo())
                                      }
                                      className="btn-primary text-xs py-1 px-2"
                                    >
                                      Retry
                                    </button>
                                  </div>
                                ) : billing ? (
                                  <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 text-neutral-500 mr-1" />
                                        <span className="text-neutral-600">
                                          Has Billing:
                                        </span>
                                      </div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          billing.has_billing
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {billing.has_billing ? "Yes" : "No"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <CreditCard className="w-4 h-4 text-neutral-500 mr-1" />
                                        <span className="text-neutral-600">
                                          Customer ID:
                                        </span>
                                      </div>
                                      <span className="font-mono text-xs text-neutral-500 truncate max-w-24">
                                        {billing.stripe_customer_id || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 text-neutral-500 mr-1" />
                                        <span className="text-neutral-600">
                                          Trial Amount:
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        ${billing.trial_amount || 0}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 text-neutral-500 mr-1" />
                                        <span className="text-neutral-600">
                                          Currency:
                                        </span>
                                      </div>
                                      <span className="font-medium">
                                        {billing.currency || "USD"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-neutral-600 text-sm">
                                      No billing data available
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cancel Subscription Button - Only show for active subscriptions */}
                            {subscription?.has_subscription &&
                              !cancellationStatus?.has_request &&
                              (subscription.status === "active" ||
                                subscription.status === "trialing") && (
                                <div className="mt-6 pt-6 border-t border-neutral-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-sm font-semibold text-neutral-800 mb-1">
                                        Cancel Subscription
                                      </h5>
                                      <p className="text-xs text-neutral-600">
                                        Cancel your subscription to stop future
                                        charges
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleOpenCancelModal("request")
                                      }
                                      disabled={cancellationStatusLoading}
                                      className={`cursor-pointer px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 bg-red-500 hover:bg-red-600 ${
                                        cancellationStatusLoading
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      {cancellationStatusLoading ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          Loading...
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-4 h-4" />
                                          Cancel Subscription
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}

                            {/* Cancellation Status Button - Show for pending */}
                            {subscription.has_subscription &&
                              cancellationStatus?.has_request &&
                              cancellationStatus?.status === "pending" && (
                                <div className="mt-6 pt-6 border-t border-neutral-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="text-sm font-semibold text-neutral-800 mb-1">
                                        Cancellation Status
                                      </h5>
                                      <p className="text-xs text-neutral-600">
                                        View the status of your cancellation
                                        request
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleOpenCancelModal("status")
                                      }
                                      disabled={cancellationStatusLoading}
                                      className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 ${
                                        cancellationStatusLoading
                                          ? "opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      {cancellationStatusLoading ? (
                                        <>
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          Loading...
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-4 h-4" />
                                          Show Cancel Status
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        )}

                        {(!subscription.has_subscription ||
                          subscription.status === "canceled") && (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-neutral-800 mb-2">
                              {subscription.status === "canceled"
                                ? "Subscription Cancelled"
                                : "No Active Subscription"}
                            </h4>
                            <p className="text-neutral-600 mb-4">
                              {subscription.status === "canceled"
                                ? "Your subscription has been cancelled. Choose a plan to reactivate your account."
                                : "Get started with a subscription to access all features"}
                            </p>
                            <button
                              onClick={() => handleOpenCancelModal("status")}
                              className="btn-primary"
                            >
                              {subscription.status === "canceled"
                                ? "Restart Subscription"
                                : "Choose a Plan"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-600">
                        No subscription data available
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Previous 5 Bills - Only show for dealers */}
                <motion.div
                  variants={itemVariants}
                  className="card p-4 sm:p-6 lg:p-8 mb-8"
                >
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 mb-4 sm:mb-6">
                    Previous 5 Bills
                  </h3>

                  {invoicesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-neutral-600">Loading invoices...</p>
                    </div>
                  ) : invoicesError ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">{invoicesError}</p>
                      <button
                        onClick={() => {
                          setInvoicesFetched(false);
                          fetchInvoices();
                        }}
                        className="btn-secondary"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-600">No invoices found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invoices.slice(0, 5).map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-neutral-200 gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <FileText className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="text-sm sm:text-base font-semibold text-neutral-800">
                                  {invoice.number}
                                </h4>
                                <p className="text-xs sm:text-sm text-neutral-600">
                                  {invoice.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {invoice.created}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />$
                                {invoice.amount} {invoice.currency}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  invoice.status === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : invoice.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {invoice.status.charAt(0).toUpperCase() +
                                  invoice.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              downloadInvoice(
                                invoice.invoice_pdf,
                                invoice.number
                              )
                            }
                            className="cursor-pointer btn-secondary flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto"
                            disabled={!invoice.invoice_pdf}
                          >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}

          {/* Account Settings */}
          <motion.div
            variants={itemVariants}
            className="card p-4 sm:p-6 lg:p-8"
          >
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-800 mb-4 sm:mb-6">
              Account Settings
            </h3>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-neutral-200 gap-4">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-1">
                    Change Password
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="cursor-pointer btn-secondary flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto"
                >
                  <Key className="w-4 h-4" />
                  <span>Change</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-neutral-800 mb-1">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    {isTwoFactorEnabled
                      ? "An extra layer of security is enabled for your account"
                      : "Add an extra layer of security to your account"}
                  </p>
                </div>
                <button
                  onClick={handleTwoFactorToggle}
                  className={`cursor-pointer btn-secondary w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 ${
                    isTwoFactorEnabled
                      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  }`}
                >
                  {isTwoFactorEnabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={handleCancel}
        onSave={handleSave}
        initialData={editData}
      />

      {/* Two-Factor Authentication Modal */}
      <TwoFactorAuthModal
        isOpen={showTwoFactorModal}
        onClose={() => setShowTwoFactorModal(false)}
        onSuccess={handleTwoFactorSuccess}
        isEnabled={isTwoFactorEnabled}
      />

      {/* Cancel Subscription Modal */}
      <CancelSubscriptionModal
        isOpen={showCancelSubscriptionModal}
        onClose={() => setShowCancelSubscriptionModal(false)}
        onSuccess={handleCancelSubscriptionSuccess}
        mode={cancelModalMode}
        cancellationStatus={cancellationStatus}
        subscription={subscription}
        user={user}
      />
    </div>
  );
};

export default Profile;
