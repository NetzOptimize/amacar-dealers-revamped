import { motion } from "framer-motion";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  MessageCircle,
  Users,
  ArrowRight,
  Gift,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-hot-toast';
import useDebounce from '@/hooks/useDebounce';

const ContactInfo = ({ formData, updateFormData, errors, isInvitedUser, invitationData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const previousErrorsRef = useRef({});
  const [inlineErrors, setInlineErrors] = useState({});

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,

      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: formData.password.length >= 8 },
    { text: "Contains number", met: /\d/.test(formData.password) },
    {
      text: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    },
  ];
  const isPasswordValid = passwordRequirements.every((req) => req.met);

  // Debounce errors with 800ms delay
  const debouncedErrors = useDebounce(errors, 800);

  // Show toast notifications for new errors
  useEffect(() => {
    if (!debouncedErrors) return;

    const currentErrors = debouncedErrors;
    const previousErrors = previousErrorsRef.current;

    // Check each field for new errors
    Object.keys(currentErrors).forEach((fieldName) => {
      const currentError = currentErrors[fieldName];
      const previousError = previousErrors[fieldName];

      // Errors are now only shown inline, no toast notifications
    });

    // Update previous errors reference
    previousErrorsRef.current = currentErrors;
  }, [debouncedErrors]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="text-left mb-6">
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            variants={itemVariants}
            className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-soft"
          >
            <User className="w-6 h-6 text-primary-600" />
          </motion.div>
          <div>
            <motion.h2
              variants={itemVariants}
              className="text-xl font-bold text-neutral-900"
            >
              Personal Information & Account Setup
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-neutral-600 text-sm"
            >
              Tell us about yourself and create your account
            </motion.p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-700">
            First Name *
            {isInvitedUser && (
              <span className="text-xs text-green-600 ml-2">(Pre-filled from invitation)</span>
            )}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              maxLength={20}
              value={formData.firstName}
              onChange={(e) => {
                const inputValue = e.target.value;

                // Check if numbers/digits were attempted (before filtering)
                const hasNumbers = /[0-9]/.test(inputValue);

                // Allow letters and spaces to be typed, but filter out numbers and special characters
                const value = inputValue.replace(/[^a-zA-Z ]/g, '');

                updateFormData("firstName", value);

                // Show error if numbers were attempted
                if (hasNumbers) {
                  const errorMsg = "only letters are allowed";
                  setInlineErrors(prev => ({ ...prev, firstName: errorMsg }));
                } else if (value && value.includes(' ')) {
                  // Show error for spaces
                  const errorMsg = "Please enter your first name as a single word (e.g., 'Mary').";
                  setInlineErrors(prev => ({ ...prev, firstName: errorMsg }));
                } else {
                  // Clear errors when valid input
                  setInlineErrors(prev => ({ ...prev, firstName: '' }));
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value && value.includes(' ')) {
                  const errorMsg = "Please enter your first name as a single word (e.g., 'Mary').";
                  setInlineErrors(prev => ({ ...prev, firstName: errorMsg }));
                } else if (value && !inlineErrors.firstName) {
                  // Clear errors if we have valid input and no existing errors
                  setInlineErrors(prev => ({ ...prev, firstName: '' }));
                }
              }}
              disabled={isInvitedUser}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${(errors.firstName || inlineErrors.firstName) ? "border-error" : "border-neutral-200"
                } ${isInvitedUser
                  ? 'bg-neutral-50 text-neutral-600 cursor-not-allowed'
                  : 'bg-white text-neutral-900'
                } placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200`}
              placeholder="Enter your first name"
            />
          </div>
          {(errors.firstName || inlineErrors.firstName) && (
            <p className="text-sm text-error">{errors.firstName || inlineErrors.firstName}</p>
          )}
        </motion.div>

        {/* Last Name */}
        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-semibold text-neutral-700">
            Last Name *
            {isInvitedUser && (
              <span className="text-xs text-green-600 ml-2">(Pre-filled from invitation)</span>
            )}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              maxLength={20}
              value={formData.lastName}
              onChange={(e) => {
                const inputValue = e.target.value;

                // Check if numbers/digits were attempted (before filtering)
                const hasNumbers = /[0-9]/.test(inputValue);

                // Allow letters and spaces to be typed, but filter out numbers and special characters
                const value = inputValue.replace(/[^a-zA-Z ]/g, '');

                updateFormData("lastName", value);

                // Show error if numbers were attempted
                if (hasNumbers) {
                  const errorMsg = "only letters are allowed";
                  setInlineErrors(prev => ({ ...prev, lastName: errorMsg }));
                } else if (value && value.includes(' ')) {
                  // Show error for spaces
                  const errorMsg = "Please enter your last name as a single word (e.g., 'Smith').";
                  setInlineErrors(prev => ({ ...prev, lastName: errorMsg }));
                } else {
                  // Clear errors when valid input
                  setInlineErrors(prev => ({ ...prev, lastName: '' }));
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value && value.includes(' ')) {
                  const errorMsg = "Please enter your last name as a single word (e.g., 'Smith').";
                  setInlineErrors(prev => ({ ...prev, lastName: errorMsg }));
                } else if (value && !inlineErrors.lastName) {
                  // Clear errors if we have valid input and no existing errors
                  setInlineErrors(prev => ({ ...prev, lastName: '' }));
                }
              }}
              disabled={isInvitedUser}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${(errors.lastName || inlineErrors.lastName) ? "border-error" : "border-neutral-200"
                } ${isInvitedUser
                  ? 'bg-neutral-50 text-neutral-600 cursor-not-allowed'
                  : 'bg-white text-neutral-900'
                } placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200`}
              placeholder="Enter your last name"
            />
          </div>
          {(errors.lastName || inlineErrors.lastName) && (
            <p className="text-sm text-error">{errors.lastName || inlineErrors.lastName}</p>
          )}
        </motion.div>

        {/* Mobile Number */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
          <label className="block text-sm font-semibold text-neutral-700">
            Mobile Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => {
                const inputValue = e.target.value;

                // Check if letters were attempted (before filtering)
                const hasLetters = /[a-zA-Z]/.test(inputValue);

                // Only allow digits and limit to 10 digits (letters are blocked from input)
                const digitsOnly = inputValue.replace(/\D/g, '');
                const value = digitsOnly.slice(0, 10);

                // Check if user tried to enter more than 10 digits
                const exceedsLimit = digitsOnly.length > 10;

                updateFormData("mobileNumber", value);

                // Show error priority: letters > length limit > valid input
                if (hasLetters) {
                  // Highest priority: letters error
                  const errorMsg = 'only digits are allowed';
                  setInlineErrors(prev => ({ ...prev, mobileNumber: errorMsg }));
                } else if (exceedsLimit) {
                  // Second priority: exceeds 10 digits
                  const errorMsg = 'phone number is of 10 digits only';
                  setInlineErrors(prev => ({ ...prev, mobileNumber: errorMsg }));
                } else if (value.length === 10) {
                  // Clear all errors if we have exactly 10 digits
                  setInlineErrors(prev => ({ ...prev, mobileNumber: '' }));
                } else if (value.length > 0 && value.length < 10) {
                  // Clear errors if we're typing valid digits (not yet 10)
                  setInlineErrors(prev => {
                    // Only clear if we had a length limit error or letter error
                    if (prev.mobileNumber === 'phone number is of 10 digits only' ||
                      prev.mobileNumber === 'only digits are allowed') {
                      return { ...prev, mobileNumber: '' };
                    }
                    return prev;
                  });
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;

                // Check for length error (less than 10 digits)
                if (value && value.length !== 10) {
                  // Only set length error if we don't already have letter or limit error
                  const currentError = inlineErrors.mobileNumber;
                  if (currentError !== 'only digits are allowed' &&
                    currentError !== 'phone number is of 10 digits only') {
                    const errorMsg = 'Mobile number must be exactly 10 digits';
                    setInlineErrors(prev => ({ ...prev, mobileNumber: errorMsg }));
                  }
                } else if (value.length === 10) {
                  // Clear all errors if we have exactly 10 digits
                  setInlineErrors(prev => ({ ...prev, mobileNumber: '' }));
                }
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${(errors.mobileNumber || inlineErrors.mobileNumber) ? "border-error" : "border-neutral-200"
                } bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200`}
              placeholder="1234567890"
              maxLength="10"
            />
          </div>
          {(errors.mobileNumber || inlineErrors.mobileNumber) && (
            <p className="text-sm text-error">{errors.mobileNumber || inlineErrors.mobileNumber}</p>
          )}
        </motion.div>
      </div>

      {/* Account Setup Section */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <div className="space-y-6">
          {/* Password */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFormData("password", value);
                  // Clear inline error when password meets criteria (at least 4 characters)
                  if (value.length >= 4) {
                    setInlineErrors(prev => ({ ...prev, password: '' }));
                  }
                  // Clear confirm password error if passwords match
                  if (formData.confirmPassword && value === formData.confirmPassword) {
                    setInlineErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && value.length < 4) {
                    const errorMsg = 'Must be at least 4 characters';
                    setInlineErrors(prev => ({ ...prev, password: errorMsg }));
                  } else {
                    setInlineErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${(errors.password || inlineErrors.password) ? "border-error" : "border-neutral-200"
                  } bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {(errors.password || inlineErrors.password) && (
              <p className="text-sm text-error">{errors.password || inlineErrors.password}</p>
            )}
          </motion.div>

          {/* Password Requirements */}
          {/* {formData.password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-neutral-50 rounded-xl p-4 space-y-2"
            >
              <h4 className="text-sm font-semibold text-neutral-700 mb-2">Password Requirements:</h4>
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    req.met ? 'bg-success' : 'bg-neutral-300'
                  }`}>
                    {req.met && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${
                    req.met ? 'text-success' : 'text-neutral-600'
                  }`}>
                    {req.text}
                  </span>
                </div>
              ))}
            </motion.div>
          )} */}

          {/* Confirm Password */}
          <motion.div variants={itemVariants} className="space-y-2 mb-0">
            <label className="block text-sm font-semibold text-neutral-700">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFormData("confirmPassword", value);
                  // Clear inline error when passwords match
                  if (value && formData.password && value === formData.password) {
                    setInlineErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && formData.password && value !== formData.password) {
                    const errorMsg = 'Passwords do not match';
                    setInlineErrors(prev => ({ ...prev, confirmPassword: errorMsg }));
                  } else {
                    setInlineErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                className={`w-full pl-10 pr-12 py-3 rounded-xl border ${(errors.confirmPassword || inlineErrors.confirmPassword) ? "border-error" : "border-neutral-200"
                  } bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-200`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {(errors.confirmPassword || inlineErrors.confirmPassword) && (
              <p className="text-sm text-error">{errors.confirmPassword || inlineErrors.confirmPassword}</p>
            )}
          </motion.div>

          {/* Password Match Indicator */}
          {/* {formData.confirmPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex mt-2 items-center space-x-2 text-sm ${formData.password === formData.confirmPassword &&
                formData.confirmPassword
                ? "text-success"
                : "text-error"
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${formData.password === formData.confirmPassword &&
                  formData.confirmPassword
                  ? "bg-success"
                  : "bg-error"
                  }`}
              >
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
              <span>
                {formData.password === formData.confirmPassword &&
                  formData.confirmPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </span>
            </motion.div>
          )} */}

          {/* Agreement Checkbox */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-start space-x-3 mt-4">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={formData.agreementAccepted}
                  onChange={(e) =>
                    updateFormData("agreementAccepted", e.target.checked)
                  }
                  className="w-4 h-4 text-[var(--brand-orange)] bg-neutral-100 border-neutral-300 rounded focus:ring-[var(--brand-orange)] focus:ring-2"
                />
              </div>
              <div className="text-sm">
                <label
                  htmlFor="agreement"
                  className="text-neutral-700 cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="terms-conditions"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Terms of Service
                  </a>
                  {", "}
                  <a
                    href="privacy-policy"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Privacy Policy
                  </a>
                  and{" "}
                  <a
                    href="/dealership-agreement"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Dealership agreement
                  </a>
                  *
                </label>
                {errors.agreementAccepted && (
                  <p className="text-sm text-error mt-1">
                    {errors.agreementAccepted}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Talk to Sales and Free Trial Section - Two Columns */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Talk to Sales Checkbox */}
            <motion.div variants={itemVariants} className="space-y-2">
              <motion.div
                className="p-6 h-full bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:border-orange-200 transition-all duration-300 group"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(246, 133, 31, 0.15)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.input
                    type="radio"
                    name="registrationOption"
                    id="talkToSales"
                    checked={formData.talkToSales}
                    onChange={(e) => {
                      updateFormData("talkToSales", true);
                      updateFormData("acceptFreeTrial", false);
                      // Clear inline error when user selects an option
                      setInlineErrors(prev => ({ ...prev, talkToSales: '' }));
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="w-5 h-5 text-[var(--brand-orange)] bg-white border-2 border-orange-200 rounded-full focus:ring-[var(--brand-orange)] focus:ring-2 transition-all duration-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <motion.div
                        animate={formData.talkToSales ? {
                          color: "var(--brand-orange)"
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <label
                          htmlFor="talkToSales"
                          className="text-lg font-bold text-neutral-800 cursor-pointer group-hover:text-[var(--brand-orange)] transition-colors duration-200"
                        >
                          Talk to sales
                        </label>
                        <p className="text-sm text-neutral-600 mt-1">
                          Get in touch with our sales team
                        </p>
                      </motion.div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[var(--brand-orange)]" />
                        <span>Expert consultation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-[var(--brand-orange)]" />
                        <span>Personalized demo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Free 7-Day Trial */}
            <motion.div variants={itemVariants} className="space-y-2">
              <motion.div
                className="p-6 h-full bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 hover:border-orange-200 transition-all duration-300 group"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(246, 133, 31, 0.15)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.input
                    type="radio"
                    name="registrationOption"
                    id="acceptFreeTrial"
                    checked={formData.acceptFreeTrial}
                    onChange={(e) => {
                      updateFormData("acceptFreeTrial", true);
                      updateFormData("talkToSales", false);
                      // Clear inline error when user selects an option
                      setInlineErrors(prev => ({ ...prev, talkToSales: '' }));
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="w-5 h-5 bg-white/20 border-2 border-white/40 rounded-full focus:ring-white focus:ring-2 transition-all duration-200"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <motion.div
                        animate={formData.acceptFreeTrial ? {
                          color: "var(--brand-orange)"
                        } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <label
                            htmlFor="acceptFreeTrial"
                            className="text-lg font-bold cursor-pointer group-hover:text-[var(--brand-orange)] text-neutral-800 transition-colors duration-200"
                          >
                            Free 7-Day Trial
                          </label>
                        </div>
                        <p className="text-neutral-600 text-sm mt-1">
                          Start with a free 7-day trial. No charges until your trial period
                          ends. Cancel anytime during the trial
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Radio Button Error Message */}
          {(errors.talkToSales || inlineErrors.talkToSales) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="text-sm text-error">{errors.talkToSales || inlineErrors.talkToSales}</p>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfo;
