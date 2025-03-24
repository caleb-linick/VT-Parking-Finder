/**
 * UserProfile.jsx
 * 
 * This component displays and manages the user's profile information,
 * including personal details and favorite parking locations.
 * 
 * Features:
 * - Display user information (username, car information)
 * - Allow editing of profile information
 * - Show list of favorite parking locations with quick access
 * - Provide logout functionality
 * - Authentication verification (redirects to login if not authenticated)
 * - Handle empty states for profile sections
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

/**
 * Component that displays and manages user profile information
 * 
 * @returns {JSX.Element} The rendered user profile component
 */
const UserProfile = () => {
  // State management
  const [user, setUser] = useState(null);
  const [carInfo, setCarInfo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Navigation hook for redirects
  const navigate = useNavigate();

  /**
   * Load user information on component mount and
   * redirect to login if user is not authenticated
   */
  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setCarInfo(userData.car || '');
    } else {
      // Redirect to login if not logged in
      navigate('/login');
    }
  }, [navigate]);

  /**
   * Handle user logout
   * Removes user data from localStorage and redirects to home page
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  /**
   * Update user profile information
   * Saves changes to localStorage and updates state
   */
  const handleUpdateProfile = () => {
    if (user) {
      // Create updated user object with new car information
      const updatedUser = {
        ...user,
        car: carInfo
      };
      
      // Update localStorage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    }
  };

  /**
   * Show loading state while user data is being fetched
   */
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.profileContainer}>
          <h1 style={styles.title}>Your Profile</h1>
          
          <div style={styles.profileCard}>
            {/* Profile header with avatar and username */}
            <div style={styles.profileHeader}>
              <div style={styles.avatar}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <h2 style={styles.username}>{user.username}</h2>
            </div>
            
            {/* Profile details section */}
            <div style={styles.profileDetails}>
              {isEditing ? (
                // Edit mode: form for updating profile information
                <div style={styles.editForm}>
                  <div style={styles.formGroup}>
                    <label htmlFor="carInfo" style={styles.label}>Car Information:</label>
                    <input
                      type="text"
                      id="carInfo"
                      value={carInfo}
                      onChange={(e) => setCarInfo(e.target.value)}
                      style={styles.input}
                      placeholder="e.g., 2021 Honda Civic (Silver)"
                    />
                  </div>
                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={handleUpdateProfile} 
                      style={styles.saveButton}
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setCarInfo(user.car || '');
                      }} 
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode: display current profile information
                <>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Car Information:</span>
                    <span style={styles.detailValue}>{user.car || 'Not provided'}</span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={styles.editButton}
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
            
            {/* Favorites section */}
            <div style={styles.favoritesSection}>
              <h3 style={styles.sectionTitle}>Favorite Parking Locations</h3>
              {user.favorites && user.favorites.length > 0 ? (
                // Display favorite parking lots if they exist
                <div style={styles.favoritesList}>
                  {user.favorites.map(favId => {
                    // Mock data for favorite parking lot names
                    // In production, this would come from an API
                    const lotNames = {
                      1: 'Perry Street Garage',
                      2: 'Cassell Lot',
                      3: 'Litton Reaves',
                      4: 'Squires',
                      5: 'Architecture Annex',
                    };
                    return (
                      <div 
                        key={favId} 
                        style={styles.favoriteItem}
                        onClick={() => navigate(`/parking-lots/${favId}`)}
                      >
                        {lotNames[favId] || `Parking Lot ${favId}`}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Empty state for favorites
                <p style={styles.emptyFavorites}>
                  You haven't added any favorite parking locations yet.
                </p>
              )}
            </div>
            
            {/* Logout button */}
            <button 
              onClick={handleLogout} 
              style={styles.logoutButton}
            >
              Log Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Component styles
 */
const styles = {
  container: {
    backgroundColor: '#800000', // VT Maroon
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    color: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
  },
  main: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  profileContainer: {
    width: '100%',
    maxWidth: '600px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  profileCard: {
    backgroundColor: '#990000', // Slightly lighter maroon
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    color: '#800000', // VT Maroon
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    marginRight: '20px',
  },
  username: {
    fontSize: '24px',
    margin: 0,
  },
  profileDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  detailItem: {
    marginBottom: '15px',
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: '10px',
    display: 'block',
    marginBottom: '5px',
  },
  detailValue: {
    display: 'block',
  },
  editButton: {
    backgroundColor: '#FFFFFF',
    color: '#800000', // VT Maroon
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  editForm: {
    width: '100%',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Green
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F44336', // Red
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  favoritesSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '18px',
  },
  favoritesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  favoriteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Slightly more opaque white
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  emptyFavorites: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#333333', // Dark gray
    color: '#FFFFFF',
    border: 'none',
    padding: '12px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default UserProfile;