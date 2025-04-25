/**
 * App.js
 *
 * This is the root component for the VT Parking Finder application.
 * It defines the routing structure and handles authentication checks.
 *
 * Updated with JWT authentication and protected routes.
 *
 * @author VT Parking Finder Team
 * @version 2.0.0
 */

import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import HomePage from './components/HomePage';
import ParkingLots from './components/ParkingLots';
import Login from './components/Login';
import ParkingLotDetail from './components/ParkingLotDetail';
import UserProfile from './components/UserProfile';
import apiService from './services/apiService';
import './App.css';

/**
 * Protected Route component that checks authentication
 * Redirects to login if user is not authenticated
 *
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to render if authenticated
 * @returns {JSX.Element} The rendered component or redirect
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = apiService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  return children;
};

/**
 * Main application component that sets up routing and authentication
 *
 * @returns {JSX.Element} The rendered application
 */
function App() {
  // Check token validity on app start
  useEffect(() => {
    // If token exists but is invalid, clean it up
    if (localStorage.getItem('token') && !apiService.isAuthenticated()) {
      apiService.logout();
    }
  }, []);

  return (
    <Router basename="/caleb-linick/VT-Parking-Finder">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/parking-lots" element={<ParkingLots />} />
        <Route path="/login" element={<Login />} />
        <Route path="/parking-lots/:id" element={<ParkingLotDetail />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
