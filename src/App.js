/**
 * App.js
 * 
 * This is the root component for the VT Parking Finder application.
 * It defines the routing structure for the entire application using React Router.
 * 
 * The application has the following routes:
 * - / (Home): Displays the main dashboard with the map and parking lot status
 * - /parking-lots: Shows a list of all parking lots with detailed information
 * - /login: Handles user authentication (login/signup)
 * - /parking-lots/:id: Displays detailed information for a specific parking lot
 * - /profile: Shows the user profile with favorite parking lots
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import ParkingLots from './components/ParkingLots';
import Login from './components/Login';
import ParkingLotDetail from './components/ParkingLotDetail';
import UserProfile from './components/UserProfile';
import './App.css';

/**
 * Main application component that sets up routing and app initialization
 * 
 * @returns {JSX.Element} The rendered application
 */
function App() {
  /**
   * Initialize user data in localStorage if not present
   * This allows for a smoother experience for new users and development
   */
  React.useEffect(() => {
    if (!localStorage.getItem('user')) {
      console.log('No user found in localStorage, initializing as guest');
      // In a production app, you might want to initialize with default values
      // or redirect to a login page
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Home page route */}
        <Route path="/" element={<HomePage />} />
        
        {/* Parking lots list route */}
        <Route path="/parking-lots" element={<ParkingLots />} />
        
        {/* Authentication route */}
        <Route path="/login" element={<Login />} />
        
        {/* Individual parking lot detail route with dynamic ID parameter */}
        <Route path="/parking-lots/:id" element={<ParkingLotDetail />} />
        
        {/* User profile route (protected, requires login) */}
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;