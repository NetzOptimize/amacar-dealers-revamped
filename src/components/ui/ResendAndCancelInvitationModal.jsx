import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, X, AlertTriangle, CheckCircle, UserX } from 'lucide-react';

const ResendAndCancelInvitationModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionType, // 'resend', 'cancel', 'approve', or 'reject'
  dealershipName,
  isLoading = false
}) => {
  const isResend = actionType === 'resend';
  const isCancel = actionType === 'cancel';
  const isApprove = actionType === 'approve';
  const isReject = actionType === 'reject';
  
  const getActionConfig = () => {
    if (isApprove) {
      return {
        title: 'Approve Dealer',
        description: 'This will approve the dealer registration and activate their account.',
        icon: CheckCircle,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        buttonBg: 'bg-green-600 hover:bg-green-700',
        buttonText: 'Approve Dealer',
        loadingText: 'Approving...',
        confirmText: `${dealershipName} will be approved and their account will be activated. They will receive a notification email.`
      };
    } else if (isReject) {
      return {
        title: 'Reject Dealer',
        description: 'This will reject the dealer registration and mark their account as rejected.',
        icon: UserX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        buttonBg: 'bg-red-600 hover:bg-red-700',
        buttonText: 'Reject Dealer',
        loadingText: 'Rejecting...',
        confirmText: `${dealershipName} will be rejected and their account will be marked as rejected. They will receive a notification email.`
      };
    } else if (isResend) {
      return {
        title: 'Resend Invitation',
        description: 'This will send a new invitation email to the dealership.',
        icon: RotateCcw,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        buttonBg: 'bg-blue-600 hover:bg-blue-700',
        buttonText: 'Resend Invitation',
        loadingText: 'Resending...',
        confirmText: `${dealershipName} will receive a new invitation email with updated expiration date.`
      };
    } else {
      return {
        title: 'Cancel Invitation',
        description: 'This will permanently cancel the invitation and remove it from the list.',
        icon: X,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        buttonBg: 'bg-orange-600 hover:bg-orange-700',
        buttonText: 'Cancel Invitation',
        loadingText: 'Canceling...',
        confirmText: `${dealershipName} will no longer be able to accept this invitation.`
      };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon;
  
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.iconBg}`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {config.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-600">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-neutral-700">
              <p className="font-medium mb-1">
                Are you sure you want to {actionType} {isApprove || isReject ? 'this dealer' : 'the invitation'}?
              </p>
              <p className="text-neutral-600">
                {config.confirmText}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 ${config.buttonBg} text-white focus:ring-${config.buttonBg.split('-')[1]}-500`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {config.loadingText}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4" />
                {config.buttonText}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResendAndCancelInvitationModal;
