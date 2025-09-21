import React, { useState } from "react";
import { Box, Typography, TextField, Button, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";

export default function ForgotPassword() {
  const [emailOrWardenId, setEmailOrWardenId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    
    // Validate email
    const emailValidationError = validateEmail(emailOrWardenId);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("OTP sent to:", emailOrWardenId);
      setOtpSent(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleClickShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email or Warden ID is required";
    }
    if (email.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
      }
    }
    return "";
  };

  const validateOtp = (otp) => {
    if (!otp.trim()) {
      return "OTP is required";
    }
    if (otp.length !== 6) {
      return "OTP must be 6 digits";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword.trim()) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setOtpError("");
    
    // Validate OTP
    const otpValidationError = validateOtp(otp);
    if (otpValidationError) {
      setOtpError(otpValidationError);
      return;
    }
    
    // Check if OTP is correct (hardcoded for testing)
    if (otp !== "222222") {
      setOtpError("Incorrect OTP. Please enter the correct OTP.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("OTP verified:", otp);
      setOtpVerified(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordError("");
    setConfirmPasswordError("");
    
    // Validate passwords
    const passwordValidationError = validatePassword(newPassword);
    const confirmPasswordValidationError = validateConfirmPassword(newPassword, confirmPassword);
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Password changed successfully for:", emailOrWardenId);
      setIsLoading(false);
      // Handle successful password change here
      alert("Password changed successfully!");
    }, 2000);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: "var(--gray-2)",
      }}
    >
      <Box
        sx={{
          width: 800,
          height: 400,
          display: "flex",
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "white",
        }}
      >
        {/* Left Half */}
        <Box
          sx={{
            width: "40%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://panel.shipmozo.com/images/slider/1.svg"
            alt="ShipMozo"
            style={{
              width: "80%",
              height: "auto",
              maxHeight: "300px",
            }}
          />
        </Box>

        {/* Right Half */}
        <Box
          sx={{
            width: "60%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
                     <Typography
             variant="h4"
             component="h2"
             sx={{
               fontWeight: "bold",
               mb: 3,
             }}
           >
             {otpVerified ? "Change Password" : otpSent ? "Verify OTP" : "Forgot Password"}
           </Typography>

          <Box
            component="form"
            onSubmit={otpVerified ? handleChangePassword : otpSent ? handleVerifyOtp : handleSendOtp}
            sx={{ width: "100%", maxWidth: 400 }}
          >
            {/* Email / Warden ID - Only show if not OTP verified */}
            {!otpVerified && (
              <TextField
                fullWidth
                type="text"
                label="Email / Warden ID"
                value={emailOrWardenId}
                onChange={(e) => {
                  setEmailOrWardenId(e.target.value);
                  if (emailError) setEmailError(""); // Clear error when user types
                }}
                disabled={otpSent}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                    height: 48,
                  },
                  "& .MuiInputBase-input": {
                    padding: "12px 14px",
                    "&:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px white inset",
                      WebkitTextFillColor: "inherit",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    top: "-4px",
                  },
                }}
              />
            )}

            {/* OTP Field - Only show after OTP is sent and before verification */}
            {otpSent && !otpVerified && (
              <TextField
                fullWidth
                type="text"
                label="Enter OTP"
                value={otp}
                onChange={(e) => {
                  handleOtpChange(e);
                  if (otpError) setOtpError(""); // Clear error when user types
                }}
                placeholder="Enter 6-digit OTP"
                inputProps={{ maxLength: 6 }}
                error={!!otpError}
                helperText={otpError}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                    height: 48,
                  },
                  "& .MuiInputBase-input": {
                    padding: "12px 14px",
                    "&:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px white inset",
                      WebkitTextFillColor: "inherit",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    top: "-4px",
                  },
                }}
              />
            )}

            {/* New Password Field - Only show after OTP verification */}
            {otpVerified && (
              <TextField
                fullWidth
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) setPasswordError(""); // Clear error when user types
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowNewPassword}
                        edge="end"
                        sx={{ color: "grey.600" }}
                      >
                        {showNewPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={!!passwordError}
                helperText={passwordError}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                    height: 48,
                  },
                  "& .MuiInputBase-input": {
                    padding: "12px 14px",
                    "&:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px white inset",
                      WebkitTextFillColor: "inherit",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    top: "-4px",
                  },
                }}
              />
            )}

            {/* Confirm Password Field - Only show after OTP verification */}
            {otpVerified && (
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(""); // Clear error when user types
                }}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                sx={{
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                    height: 48,
                  },
                  "& .MuiInputBase-input": {
                    padding: "12px 14px",
                    "&:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0 1000px white inset",
                      WebkitTextFillColor: "inherit",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    top: "-4px",
                  },
                }}
              />
            )}

            {/* Send OTP / Verify OTP / Change Password Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                height: 48,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                backgroundColor: "black",
                color: "white",
                borderRadius: 2,
                boxShadow: "none",
                mb: 2,
                "&:hover": {
                  backgroundColor: "grey.800",
                  boxShadow: "none",
                },
                "&:disabled": {
                  backgroundColor: "black",
                  color: "white",
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                otpVerified ? "Change Password" : otpSent ? "Verify OTP" : "Send OTP"
              )}
            </Button>

            {/* Back to Login */}
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "grey.600",
                cursor: "pointer",
                "&:hover": {
                  color: "grey.800",
                },
              }}
              onClick={() => window.history.back()}
            >
              Back to Login
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
