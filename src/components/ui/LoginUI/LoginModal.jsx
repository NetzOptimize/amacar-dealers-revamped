import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  verifyLoginOTP,
  clearError,
} from "@/redux/slices/userSlice";
import useAuth from "@/hooks/useAuth";
import useEmailValidation from "@/hooks/useEmailValidation";
import ReusableTooltip from "@/components/common/Tooltip/ReusableTooltip";
import { useNavigate } from "react-router-dom";

export default function LoginModal({
  isOpen,
  onClose,
  title = "Login to Your Account",
  description = "Enter your credentials to access your account",
}) {
  const dispatch = useDispatch();
  const { values, errors, setValue, setError, resetForm } = useAuth();
  const { status, error } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [phase, setPhase] = useState("form"); // form | loading | success | failed | forgot | verify-otp | reset-password | verify-2fa
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [shouldResetEmailValidation, setShouldResetEmailValidation] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useSelector((state) => state.user);

  const shouldRedirectToProfile = () => {
    if (!user) return false;

    // Check if user is inactive
    const isInactive = user.user_status_details?.account_status === "inactive" || user.subscription_status === "inactive";

    // Check if user role is one of the specified roles
    const validRoles = ['dealer', 'sales_manager', 'dealer_user', 'dealership_user'];
    const hasValidRole = validRoles.includes(user.role) ||
      (user.roles && user.roles.some(role => validRoles.includes(role)));

    return isInactive && hasValidRole;
  };

  const navigate = useNavigate();

  // Email validation hook - validate when email is not empty
  const emailValidation = useEmailValidation(
    values.email ? values.email : "",
    false, // Always false since we removed registration
    shouldResetEmailValidation
  );

  const isDisabled =
    status === "loading" ||
    emailValidation.isValidating ||
    // emailValidation.isDisposable === true || // Commented out disposable email check
    emailValidation.isRegistered === false;

  // Debug email validation state changes
  useEffect(() => {
    console.log("📧 [LoginModal] Email validation state changed:", {
      email: values.email,
      emailValidation,
      shouldResetEmailValidation,
    });
  }, [emailValidation, values.email, shouldResetEmailValidation]);

  const isCloseDisabled =
    phase === "loading" || phase === "verify-otp" || phase === "verify-2fa";
  function validate() {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
      newPassword: "",
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(values.email)) {
      if (!emailValidation.isValidating) {
        newErrors.email = "Please enter a valid email address";
      }
    } 
    // Commented out disposable email check
    // else if (
    //   emailValidation.isDisposable === true &&
    //   !emailValidation.isValidating
    // ) {
    //   console.log("🚫 [LoginModal] Email validation failed - disposable email");
    //   newErrors.email = "Disposable email addresses are not allowed";
    // } 
    else if (
      emailValidation.isRegistered === false &&
      !emailValidation.isValidating
    ) {
      console.log(
        "🚫 [LoginModal] Email validation failed - email not registered"
      );
      newErrors.email =
        "This email is not registered. Please check your email.";
    } else if (emailValidation.error && !emailValidation.isValidating) {
      console.log(
        "❌ [LoginModal] Email validation failed - API error:",
        emailValidation.error
      );
      newErrors.email = "Unable to verify email. Please try again.";
    } else if (
      emailValidation.isValid === true &&
      !emailValidation.isValidating
    ) {
      console.log(
        "✅ [LoginModal] Email validation passed - both checks successful"
      );
    }

    if (!isForgotPasswordMode && !values.password) {
      newErrors.password = "Password is required";
    } else if (!isForgotPasswordMode && values.password?.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (phase === "reset-password" && !values.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (
      phase === "reset-password" &&
      values.newPassword !== values.confirmPassword
    ) {
      newErrors.newPassword = "New password does not match";
    } else if (phase === "reset-password" && values.newPassword?.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }

    if (phase === "reset-password" && !values.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    }

    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key]) setError(key, newErrors[key]);
      else setError(key, "");
    });

    return Object.values(newErrors).every((error) => !error);
  }

  function validateOtp() {
    const newErrors = { ...errors, otp: "" };
    if (!values.otp) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(values.otp)) {
      newErrors.otp = "OTP must be a 6-digit number";
    }
    setError("otp", newErrors.otp || "");
    return !newErrors.otp;
  }

  async function handleAction(action, ...args) {
    setPhase("loading");
    try {
      const result = await dispatch(action(...args)).unwrap();

      // Handle 2FA case for login
      if (action === loginUser && result.requires_2fa) {
        setTwoFactorData({
          user_id: result.user_id,
          username: result.username,
        });
        setPhase("verify-2fa");
        return;
      }

      setPhase("success");

    } catch (error) {
      setPhase("failed");
      toast.error(error || "An error occurred. Please try again.", {
        duration: 2000,
      });
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!validate()) return;

    if (isForgotPasswordMode && phase === "forgot") {
      await handleAction(forgotPassword, values.email);
      if (phase !== "failed") {
        setPhase("verify-otp");
      }
    } else if (phase === "reset-password") {
      await handleAction(resetPassword, {
        token: resetToken,
        otp: values.otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
    } else {
      await handleAction(loginUser, {
        username: values.email,
        password: values.password,
      });
    }
  }

  async function handleOtpSubmit(e) {
    e?.preventDefault();
    if (!validateOtp()) return;

    // Clear any existing OTP error before making the API call
    setError("otp", "");
    dispatch(clearError()); // Clear Redux error state
    setPhase("loading");
    try {
      const token = await dispatch(
        verifyOTP({ email: values.email, otp: values.otp })
      ).unwrap();
      // Clear any OTP error on success
      setError("otp", "");
      dispatch(clearError()); // Clear Redux error state on success
      setResetToken(token);
      setPhase("reset-password");
    } catch (error) {
      // Stay in verify-otp phase and show error inline
      setPhase("verify-otp");
      setError("otp", error || "Wrong OTP. Please try again.");
      // Don't show toast for OTP errors as they're displayed inline
    }
  }

  async function handle2FAOtpSubmit(e) {
    e?.preventDefault();
    if (!validateOtp()) return;

    // Clear any existing OTP error before making the API call
    setError("otp", "");
    dispatch(clearError()); // Clear Redux error state
    setPhase("loading");
    try {
      await dispatch(
        verifyLoginOTP({
          otp: values.otp,
          username: twoFactorData.username,
        })
      ).unwrap();

      // Clear any OTP error on success
      setError("otp", "");
      dispatch(clearError()); // Clear Redux error state on success
      setPhase("success");
    } catch (error) {
      // Stay in verify-2fa phase and show error inline
      setPhase("verify-2fa");
      setError("otp", error || "Invalid or expired OTP. Please try again.");

      // Handle rate limiting specifically
      if (error.includes("rate limit") || error.includes("Too many")) {
        toast.error("Too many attempts. Please try again later.", {
          duration: 5000,
        });
      }
    }
  }

  function handleOtpModalClose(open) {
    if (!open && status !== "loading") {
      resetModalToLogin();
    }
  }

  // Function to reset modal to default login state
  function resetModalToLogin() {
    console.log("🔄 [LoginModal] Resetting modal to login state");

    // Reset modal state
    setIsForgotPasswordMode(false);
    setPhase("form");
    setResetToken(null);
    setTwoFactorData(null);

    // Reset password visibility states
    setShowPassword(false);
    setShowNewPassword(false);

    // Clear all form values and errors (this also clears tooltip errors)
    resetForm();

    // Clear Redux error state
    dispatch(clearError());

    // Reset email validation state - force reset
    setShouldResetEmailValidation(true);

    console.log("✅ [LoginModal] Modal reset complete - all states cleared");
  }

  // Enhanced onClose handler that resets modal to login mode
  function handleModalClose(open) {
    if (!open && !isCloseDisabled) {
      resetModalToLogin();
      onClose(open);
    }
  }

  function handleSuccessAction() {
    toast.success(
      phase === "reset-password"
        ? "Password updated successfully"
        : "Login successful!",
      { duration: 2000 }
    );

    setTimeout(() => {
      onClose(false);
      resetModalToLogin();
      // Redirect to dashboard after successful login
      if (phase !== "reset-password") {
        if (shouldRedirectToProfile()) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      }
    }, 500);
  }

  function handleBackToForm() {
    setPhase("form");
    resetForm();
  }

  function handleForgotPassword() {
    setIsForgotPasswordMode(true);
    setPhase("forgot");
    resetForm();
  }

  function handleBackToLogin() {
    resetModalToLogin();
  }

  useEffect(() => {
    if (phase === "success") {
      handleSuccessAction();
    }
  }, [phase]);

  // Reset the email validation reset flag after it's been used
  useEffect(() => {
    if (shouldResetEmailValidation) {
      setShouldResetEmailValidation(false);
    }
  }, [shouldResetEmailValidation]);

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      console.log("🔄 [LoginModal] Modal opened - resetting to clean state");
      resetModalToLogin();
    }
  }, [isOpen]);

  // Force email validation reset when modal opens or phase changes
  useEffect(() => {
    if (isOpen) {
      console.log("🔄 [LoginModal] Forcing email validation reset");
      setShouldResetEmailValidation(true);
    }
  }, [isOpen, phase]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("🔄 [LoginModal] Modal closed - performing cleanup");
      // Additional cleanup if needed
      setShouldResetEmailValidation(true);
    }
  }, [isOpen]);

  // Reset email validation when email field becomes empty
  useEffect(() => {
    if (!values.email || values.email.trim() === "") {
      console.log(
        "🔄 [LoginModal] Email field is empty - resetting validation state"
      );
      setShouldResetEmailValidation(true);
    }
  }, [values.email]);

  // Force reset email validation when phase changes
  useEffect(() => {
    console.log("🔄 [LoginModal] Phase changed - resetting email validation");
    setShouldResetEmailValidation(true);
  }, [phase]);

  // Memoized email change handler to prevent cursor jumping
  const handleEmailChange = useCallback(
    (e) => {
      console.log("📝 [LoginModal] Email field changed:", e.target.value);
      setValue("email", e.target.value);
    },
    [setValue]
  );

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={isCloseDisabled ? undefined : handleModalClose}
      >
        <DialogContent
          className="sm:max-w-lg rounded-2xl shadow-xl p-0 overflow-y-auto max-h-[70vh] lg:max-h-[82vh] bg-white overflow-x-hidden"
          showCloseButton={!isCloseDisabled}
        >
          <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                {isForgotPasswordMode && phase === "forgot"
                  ? "Forgot Password"
                  : isForgotPasswordMode && phase === "verify-otp"
                    ? "Verify OTP"
                    : isForgotPasswordMode && phase === "reset-password"
                      ? "Reset Password"
                      : phase === "verify-2fa"
                        ? "Two-Factor Authentication"
                        : title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                {phase === "forgot"
                  ? "Enter your email to receive a verification OTP"
                  : phase === "verify-otp"
                    ? `We've sent a 6-digit OTP to ${values.email}. Please enter it below.`
                    : phase === "reset-password"
                      ? "Enter your new password"
                      : phase === "verify-2fa"
                        ? `We've sent a 6-digit OTP to ${twoFactorData?.username}. Please enter it below to complete your login.`
                        : description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 pt-0 min-h-[420px]">
            <AnimatePresence mode="wait">
              {(phase === "form" ||
                phase === "forgot" ||
                phase === "reset-password" ||
                phase === "verify-2fa") && (
                  <motion.form
                    key="form"
                    onSubmit={
                      phase === "verify-2fa" ? handle2FAOtpSubmit : handleSubmit
                    }
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid gap-5"
                  >
                    {/* 2FA OTP Field */}
                    {phase === "verify-2fa" && (
                      <div className="grid gap-2">
                        <label
                          htmlFor="otp"
                          className="text-sm font-medium text-slate-800"
                        >
                          Enter 6-digit OTP
                        </label>
                        <ReusableTooltip
                          content={errors.otp}
                          variant="error"
                          side="top"
                        >
                          <InputOTP
                            id="otp"
                            maxLength={6}
                            value={values.otp || ""}
                            onChange={(value) => {
                              setValue("otp", value);
                              // Clear OTP error when user starts typing
                              if (errors.otp) {
                                setError("otp", "");
                              }
                            }}
                            className="flex gap-2"
                          >
                            <InputOTPGroup className="flex gap-2">
                              {Array(6)
                                .fill(null)
                                .map((_, i) => (
                                  <InputOTPSlot
                                    key={i}
                                    index={i}
                                    className={`h-11 w-11 rounded-lg border text-center text-lg font-medium outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)] ${errors.otp
                                      ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                                      : "border-slate-200 bg-white"
                                      }`}
                                  />
                                ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </ReusableTooltip>
                      </div>
                    )}

                    {/* Email Field */}
                    {(phase === "form" || phase === "forgot") && (
                      <div className="grid gap-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-slate-800"
                        >
                          Email Address
                          {emailValidation.isValidating && (
                            <span className="ml-2 text-xs text-slate-500">
                              (Validating...)
                            </span>
                          )}
                        </label>
                        <ReusableTooltip
                          content={
                            errors.email ||
                            // Commented out disposable email check
                            // (emailValidation.isDisposable === true &&
                            //   !emailValidation.isValidating &&
                            //   "Disposable email addresses are not allowed") ||
                            (emailValidation.isRegistered === false &&
                              !emailValidation.isValidating &&
                              "This email is not registered. Please check your email.") ||
                            (emailValidation.error &&
                              !emailValidation.isValidating &&
                              "Unable to verify email. Please try again.")
                          }
                          variant="error"
                          side="top"
                        >
                          <div className="relative">
                            <div
                              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                                // Only show green if explicitly valid and not validating
                                emailValidation.isValid === true &&
                                  !emailValidation.isValidating &&
                                  values.email
                                  ? "text-green-500"
                                  : // Only show red if explicitly invalid and not validating
                                  // Commented out disposable email check
                                  // (emailValidation.isDisposable === true ||
                                  (emailValidation.isRegistered === false &&
                                    !emailValidation.isValidating &&
                                    values.email)
                                    ? "text-red-500"
                                    : // Default neutral state
                                    "text-slate-400"
                                }`}
                            >
                              <Mail className="h-4 w-4" />
                            </div>
                            <input
                              key={`email-input-${phase}-${isOpen}`}
                              id="email"
                              type="email"
                              value={values.email || ""}
                              onChange={handleEmailChange}
                              placeholder="user@example.com"
                              className={`h-11 w-full rounded-xl border pl-9 pr-10 text-sm outline-none ring-0 transition-all duration-200 ${
                                // Only show green if explicitly valid and not validating
                                emailValidation.isValid === true &&
                                  !emailValidation.isValidating &&
                                  values.email
                                  ? "border-green-300 bg-green-50 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.08)]"
                                  : // Only show red if explicitly invalid and not validating
                                  // Commented out disposable email check
                                  // (emailValidation.isDisposable === true ||
                                  (emailValidation.isRegistered === false &&
                                    !emailValidation.isValidating &&
                                    values.email)
                                    ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                                    : // Show red for form validation errors
                                    errors.email && !emailValidation.isValidating
                                      ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                                      : // Default neutral state
                                      "border-slate-200 bg-white focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                                }`}
                            />
                            {/* Validation status indicator - show in both modes */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {emailValidation.isValidating && (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                              )}
                              {!emailValidation.isValidating &&
                                emailValidation.isValid === true && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              {!emailValidation.isValidating &&
                                // Commented out disposable email check
                                // (emailValidation.isDisposable === true ||
                                (emailValidation.isRegistered === false) && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                          </div>
                        </ReusableTooltip>
                      </div>
                    )}

                    {/* Password Field (Login Mode) */}
                    {phase === "form" && !isForgotPasswordMode && (
                      <div className="grid gap-2">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-slate-800"
                        >
                          Password
                        </label>
                        <ReusableTooltip
                          content={errors.password}
                          variant="error"
                          side="top"
                        >
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock className="h-4 w-4" />
                            </div>
                            <input
                              key="password-input"
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={values.password || ""}
                              onChange={(e) =>
                                setValue("password", e.target.value)
                              }
                              placeholder="••••••••"
                              className={`h-10 w-full rounded-xl border pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)] ${errors.password
                                ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                                : "border-slate-200 bg-white"
                                }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </ReusableTooltip>
                      </div>
                    )}

                    {/* New Password Field (Reset Password Mode) */}
                    {phase === "reset-password" && (
                      <div className="grid gap-2">
                        <label
                          htmlFor="newPassword"
                          className="text-sm font-medium text-slate-800"
                        >
                          New Password
                        </label>
                        <ReusableTooltip
                          content={errors.newPassword}
                          variant="error"
                          side="top"
                        >
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock className="h-4 w-4" />
                            </div>
                            <input
                              key="newPassword-input"
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={values.newPassword || ""}
                              onChange={(e) =>
                                setValue("newPassword", e.target.value)
                              }
                              placeholder="••••••••"
                              className={`h-11 w-full rounded-xl border pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)] ${errors.newPassword
                                ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                                : "border-slate-200 bg-white"
                                }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </ReusableTooltip>
                      </div>
                    )}

                    {/* Confirm Password Field (Reset Password Mode) */}
                    {phase === "reset-password" && (
                      <div className="grid gap-2">
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium text-slate-800"
                        >
                          Confirm Password
                        </label>
                        <ReusableTooltip
                          content={errors.confirmPassword}
                          variant="error"
                          side="top"
                        >
                          <div className="relative">
                            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock className="h-4 w-4" />
                            </div>
                            <input
                              key="confirmPassword-input"
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={values.confirmPassword || ""}
                              onChange={(e) =>
                                setValue("confirmPassword", e.target.value)
                              }
                              placeholder="••••••••"
                              className={`h-10 w-full rounded-xl border pl-9 pr-10 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)] ${errors.confirmPassword
                                ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                                : "border-slate-200 bg-white"
                                }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </ReusableTooltip>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={isDisabled}
                        className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-[var(--brand-purple)] to-[var(--brand-purple)] text-white text-sm font-semibold shadow-lg shadow-[var(--brand-purple)]-500/20 transition hover:from-[var(--brand-purple)]-600 hover:to-[var(--brand-purple)]-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {phase === "forgot"
                              ? "Sending OTP..."
                              : phase === "reset-password"
                                ? "Updating Password..."
                                : phase === "verify-2fa"
                                  ? "Verifying OTP..."
                                  : "Signing In..."}
                          </div>
                        ) : phase === "forgot" ? (
                          "Send OTP"
                        ) : phase === "reset-password" ? (
                          "Update Password"
                        ) : phase === "verify-2fa" ? (
                          "Verify OTP"
                        ) : (
                          "Login"
                        )}
                      </button>
                    </div>

                    {/* Back to Login Link (2FA Mode Only) */}
                    {phase === "verify-2fa" && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleBackToLogin}
                          className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition-colors underline underline-offset-2"
                        >
                          Back to Login
                        </button>
                      </div>
                    )}

                    {/* Forgot Password Link (Login Mode Only) */}
                    {phase === "form" && !isForgotPasswordMode && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition-colors underline underline-offset-2"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    {/* Security Notice */}
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      <ShieldCheck className="h-4 w-4 text-slate-700" />
                      {phase === "verify-2fa"
                        ? "Two-Factor Authentication provides enhanced security for your account"
                        : "Your credentials are encrypted and secure"}
                    </div>
                  </motion.form>
                )}

              {phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid gap-6 place-items-center text-center"
                >
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 w-full">
                    <div className="flex items-center gap-3 p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                      <span className="text-sm text-slate-700">
                        {isForgotPasswordMode && phase === "reset-password"
                          ? "Updating password..."
                          : phase === "verify-2fa"
                            ? "Verifying your OTP..."
                            : "Authenticating your credentials..."}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-200">
                      <motion.div
                        className="h-1 bg-slate-800"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ ease: "easeOut", duration: 1.8 }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    Please wait while we{" "}
                    {isForgotPasswordMode && phase === "reset-password"
                      ? "update your password"
                      : phase === "verify-2fa"
                        ? "verify your OTP"
                        : "verify your account"}
                    ...
                  </div>
                </motion.div>
              )}

              {phase === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="grid gap-5 mt-[4rem] place-items-center text-center"
                >
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 340, damping: 18 }}
                  >
                    <div className="grid place-items-center rounded-2xl border border-green-200 bg-gradient-to-b from-white to-emerald-50 p-4 shadow-sm">
                      <CheckCircle2 className="h-14 w-14 text-green-500" />
                    </div>
                    <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-[var(--brand-purple)]-500" />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {isForgotPasswordMode
                        ? "Password Updated!"
                        : "Welcome back!"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {isForgotPasswordMode
                        ? "Your password has been successfully updated."
                        : "You have been successfully logged in."}
                    </p>
                  </div>
                </motion.div>
              )}

              {phase === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="grid gap-5 mt-[4rem] place-items-center text-center"
                >
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 340, damping: 18 }}
                  >
                    <div className="grid place-items-center rounded-2xl border border-red-200 bg-gradient-to-b from-white to-red-50 p-4 shadow-sm">
                      <XCircle className="h-14 w-14 text-red-500" />
                    </div>
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Invalid credentials
                    </h3>
                    <p className="text-sm text-slate-600">Please try again.</p>
                  </div>
                  <button
                    onClick={handleBackToForm}
                    className="cursor-pointer w-full max-w-[200px] h-11 rounded-xl bg-gradient-to-r from-[var(--brand-purple)] to-[var(--brand-purple)] text-white text-sm font-semibold shadow-lg shadow-[var(--brand-purple)] transition hover:from-[var(--brand-purple)] hover:to-[var(--brand-purple)]"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal (Only for Forgot Password) */}
      {isForgotPasswordMode && phase === "verify-otp" && (
        <Dialog
          open={phase === "verify-otp"}
          onOpenChange={handleOtpModalClose}
        >
          <DialogContent className="sm:max-w-md rounded-2xl shadow-xl p-6 bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                Verify OTP
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                We’ve sent a 6-digit OTP to {values.email}. Please enter it
                below.
              </DialogDescription>
            </DialogHeader>
            <motion.form
              onSubmit={handleOtpSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid gap-5"
            >
              <div className="grid gap-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-slate-800"
                >
                  OTP
                </label>
                <ReusableTooltip
                  content={errors.otp}
                  variant="error"
                  side="top"
                >
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    value={values.otp || ""}
                    onChange={(value) => {
                      setValue("otp", value);
                      // Clear OTP error when user starts typing
                      if (errors.otp) {
                        setError("otp", "");
                      }
                    }}
                    className="flex gap-2"
                  >
                    <InputOTPGroup className="flex gap-2">
                      {Array(6)
                        .fill(null)
                        .map((_, i) => (
                          <InputOTPSlot
                            key={i}
                            index={i}
                            className={`h-11 w-11 rounded-lg border text-center text-lg font-medium outline-none ring-0 transition-shadow ${errors.otp
                              ? "border-red-300 bg-red-50 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]"
                              : "border-slate-200 bg-white"
                              }`}
                          />
                        ))}
                    </InputOTPGroup>
                  </InputOTP>
                </ReusableTooltip>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-[var(--brand-purple)] to-[var(--brand-purple)] text-white text-sm font-semibold shadow-lg shadow-[var(--brand-purple)] transition hover:from-[var(--brand-purple)] hover:to-[var(--brand-purple)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying OTP...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </motion.form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
