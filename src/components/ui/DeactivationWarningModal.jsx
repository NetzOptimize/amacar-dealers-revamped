import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./Button";

const DeactivationWarningModal = ({ isOpen, onClose, warningType = "account" }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate("/profile");
    onClose(); // Close the modal after navigation
  };

  // Conditional styling and content based on warning type
  const isPendingWarning = warningType === "pending";
  const isRejectedWarning = warningType === "rejected";
  const isAccountWarning = warningType === "account";
  const isSubscriptionWarning = warningType === "subscription";

  // Determine styles based on warning type
  const getModalStyles = () => {
    if (isPendingWarning) return "max-w-md border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100";
    if (isRejectedWarning) return "max-w-md border-red-200 bg-gradient-to-b from-red-50 to-red-100";
    if (isAccountWarning) return "max-w-md border-red-200 bg-gradient-to-b from-red-50 to-red-100";
    return "max-w-md border-orange-200 bg-gradient-to-b from-orange-50 to-orange-100";
  };

  const getIconStyles = () => {
    if (isPendingWarning) return "bg-amber-100";
    if (isRejectedWarning || isAccountWarning) return "bg-red-100";
    return "bg-orange-100";
  };

  const getIconColor = () => {
    if (isPendingWarning) return "text-amber-600";
    if (isRejectedWarning || isAccountWarning) return "text-red-600";
    return "text-orange-600";
  };

  const getTitleColor = () => {
    if (isPendingWarning) return "text-amber-800";
    if (isRejectedWarning || isAccountWarning) return "text-red-800";
    return "text-orange-800";
  };

  const getDescriptionColor = () => {
    if (isPendingWarning) return "text-amber-700";
    if (isRejectedWarning || isAccountWarning) return "text-red-700";
    return "text-orange-700";
  };

  const getInfoBoxStyles = () => {
    if (isPendingWarning) return "bg-amber-50 border-amber-200";
    if (isRejectedWarning || isAccountWarning) return "bg-red-50 border-red-200";
    return "bg-orange-50 border-orange-200";
  };

  const getInfoTextColor = () => {
    if (isPendingWarning) return "text-amber-800";
    if (isRejectedWarning || isAccountWarning) return "text-red-800";
    return "text-orange-800";
  };

  const getInfoSubTextColor = () => {
    if (isPendingWarning) return "text-amber-700";
    if (isRejectedWarning || isAccountWarning) return "text-red-700";
    return "text-orange-700";
  };

  const getButtonStyles = () => {
    if (isPendingWarning) return "bg-amber-600 hover:bg-amber-700";
    if (isRejectedWarning || isAccountWarning) return "bg-red-600 hover:bg-red-700";
    return "bg-orange-600 hover:bg-orange-700";
  };

  const getTitle = () => {
    if (isPendingWarning) return "Account Under Review";
    if (isRejectedWarning) return "Account Review Unsuccessful";
    if (isAccountWarning) return "Account Deactivated";
    return "No Active Subscription";
  };

  const getDescription = () => {
    if (isPendingWarning) {
      return "Your profile is currently under review by our team. You will receive full platform access once the review process is complete. We appreciate your patience during this time.";
    }
    if (isRejectedWarning) {
      return "Our team has reviewed your account application, and unfortunately, it did not meet our current platform requirements. If you believe this is an error or have additional information to provide, please contact our support team for further assistance.";
    }
    if (isAccountWarning) {
      return "Your account has been deactivated. You can only access your profile page to update your information and contact support.";
    }
    return "You don't have an active subscription. Subscribe to a plan to access all platform features and continue using the service.";
  };

  const getInfoTitle = () => {
    if (isPendingWarning) return "Review in Progress";
    if (isRejectedWarning) return "Access Restricted";
    if (isAccountWarning) return "Limited Access";
    return "Subscription Required";
  };

  const getInfoText = () => {
    if (isPendingWarning) {
      return "You can only view and edit your profile information. All other features will be available once your account review is complete and approved.";
    }
    if (isRejectedWarning) {
      return "You can only view and edit your profile information. All other features are restricted. Please contact support if you have questions or need to provide additional information.";
    }
    if (isAccountWarning) {
      return "You can only view and edit your profile information. All other features are restricted until your account is reactivated.";
    }
    return "You need an active subscription to access all platform features. Choose a plan that fits your needs to continue using the service.";
  };

  const modalStyles = getModalStyles();
  const iconStyles = getIconStyles();
  const iconColor = getIconColor();
  const titleColor = getTitleColor();
  const descriptionColor = getDescriptionColor();
  const infoBoxStyles = getInfoBoxStyles();
  const infoTextColor = getInfoTextColor();
  const infoSubTextColor = getInfoSubTextColor();
  const buttonStyles = getButtonStyles();

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        showCloseButton={false}
        className={modalStyles}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconStyles}`}>
            <AlertTriangle className={`h-8 w-8 ${iconColor}`} />
          </div>
          <DialogTitle className={`text-xl font-bold ${titleColor}`}>
            {getTitle()}
          </DialogTitle>
          <DialogDescription className={`${descriptionColor} mt-2`}>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className={`rounded-lg ${infoBoxStyles} p-4 border`}>
            <div className="flex items-start space-x-3">
              <User className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
              <div className={`text-sm ${infoTextColor}`}>
                <p className="font-medium mb-1">
                  {getInfoTitle()}
                </p>
                <p className={infoSubTextColor}>
                  {getInfoText()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleGoToProfile}
              className={`w-full ${buttonStyles} text-white font-medium py-3 rounded-lg transition-colors duration-200`}
            >
              <User className="h-4 w-4 mr-2" />
              Go to Profile Page
            </Button>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivationWarningModal;
