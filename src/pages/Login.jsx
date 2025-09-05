import React, { useState } from "react";
import { Box, Typography, TextField, Button, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [emailOrWardenId, setEmailOrWardenId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    
    // Validate email
    const emailValidationError = validateEmail(emailOrWardenId);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }
    
    // Validate password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call actual API
      const response = await fetch('https://admin.mssonutech.workers.dev/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: emailOrWardenId,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        setIsLoading(false);
        
        // Login with token - warden data will be fetched by AuthContext
        login({ 
          id: emailOrWardenId, 
          name: "Warden",
          token: data.token
        });
        
        navigate("/");
      } else {
        // Login failed
        setIsLoading(false);
        if (data.error === 'Invalid username or password') {
          setPasswordError("Incorrect Password");
        } else if (data.error === 'Account is not active. Please contact administrator.') {
          setEmailError("Account is not active. Please contact administrator.");
        } else {
          setEmailError(data.error || "Login failed. Please try again.");
        }
      }
    } catch (error) {
      // Network or other error
      setIsLoading(false);
      setEmailError("Network error. Please check your connection and try again.");
      console.error('Login error:', error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Validation functions
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email or Warden ID is required";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    }
    return "";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: "#F0F4F9",
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
            Warden Login
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%", maxWidth: 400 }}
          >
                         {/* Email / Warden ID */}
             <TextField
               fullWidth
               type="text"
               label="Email / Warden ID"
               value={emailOrWardenId}
               onChange={(e) => {
                 setEmailOrWardenId(e.target.value);
                 if (emailError) setEmailError(""); // Clear error when user types
               }}
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

                         {/* Password */}
             <TextField
               fullWidth
               type={showPassword ? "text" : "password"}
               label="Password"
               value={password}
               onChange={(e) => {
                 setPassword(e.target.value);
                 if (passwordError) setPasswordError(""); // Clear error when user types
               }}
               InputProps={{
                 endAdornment: (
                   <InputAdornment position="end">
                     <IconButton
                       onClick={handleClickShowPassword}
                       edge="end"
                       sx={{ color: "grey.600" }}
                     >
                       {showPassword ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
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

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                height: 48, // same height as input fields
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
                "Login"
              )}
            </Button>

            {/* Forgot Password */}
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
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
