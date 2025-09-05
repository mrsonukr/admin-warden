import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Theme } from "@radix-ui/themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ComplaintsProvider } from "./contexts/ComplaintsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Complaints from "./pages/Complaints";
import ComplaintView from "./pages/ComplaintView";
import Profile from "./pages/Profile";
import CreateComplaint from "./pages/CreateComplaint";

export default function App() {
  return (
    <Theme>
      <AuthProvider>
        <ComplaintsProvider>
          <Router>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/complaints" 
                element={
                  <ProtectedRoute>
                    <Complaints />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/complaints/:id" 
                element={
                  <ProtectedRoute>
                    <ComplaintView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-complaint" 
                element={
                  <ProtectedRoute>
                    <CreateComplaint />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ComplaintsProvider>
      </AuthProvider>
    </Theme>
  );
}
