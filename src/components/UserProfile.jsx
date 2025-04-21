/**
 * UserProfile.jsx
 * 
 * Component with JWT authentication and car management.
 * 
 * Features:
 * - Display user information (username, car information)
 * - Allow editing of car information with backend integration
 * - Show list of favorite parking locations with quick access
 * - Provide logout functionality
 * - Authentication verification (redirects to login if not authenticated)
 * - Handle empty states for profile sections
 * 
 * @author VT Parking Finder Team
 * @version 1.2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import apiService from '../services/apiService';

/**
 * Component that displays and manages user profile with JWT authentication
 * 
 * @returns {JSX.Element} The rendered user profile component
 */
const UserProfile = () => {
  // State management
  const [user, setUser] = useState(null);
  const [carInfo, setCarInfo] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Navigation hook for redirects
  const navigate = useNavigate();

  /**
   * Load user information on component mount and
   * redirect to login if user is not authenticated
   */
  useEffect(() => {
    // Check authentication status using JWT
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Get user from the service
    const userData = apiService.getUser();
    if (userData) {
      setUser(userData);
      setCarInfo(userData.car || '');
    } else {
      // If token exists but no user data, fetch it
      apiService.logout();
      navigate('/login');
    }
  }, [navigate]);

  /**
   * Handle user logout with JWT
   * Removes token and user data, then redirects to home page
   */
  const handleLogout = () => {
    apiService.logout();
    navigate('/');
  };

  /**
   * Update user profile information
   * Saves changes using JWT authentication
   */
  const handleUpdateProfile = async () => {
    if (user) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      try {
        // Call API to update car information with JWT token
        await apiService.updateCar(carInfo);
        
        // Update local user state
        setUser({
          ...user,
          car: carInfo
        });
        
        setIsEditing(false);
        setSuccessMessage('Car information updated successfully!');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error updating car information:', error);
        
        // Handle different error scenarios
        if (error.response) {
          if (error.response.status === 401) {
            setError('Your session has expired. Please log in again.');
            // Clear auth data on authentication failure
            setTimeout(() => {
              apiService.logout();
              navigate('/login');
            }, 2000);
          } else {
            setError(`Failed to update car information: ${error.response.data || 'Server error'}`);
          }
        } else if (error.request) {
          setError('Could not connect to the server. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Show loading state while user data is being fetched
   */
  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        <div style={styles.profileContainer}>
          <h1 style={styles.title}>Your Profile</h1>
          
          {/* Success message */}
          {successMessage && (
            <div style={styles.successMessage}>{successMessage}</div>
          )}
          
          {/* Error message */}
          {error && (
            <div style={styles.errorMessage}>{error}</div>
          )}
          
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
                      disabled={isLoading}
                    />
                    <small style={styles.helpText}>
                      Enter your car make, model, and color to help identify your car in the parking lot.
                    </small>
                  </div>
                  <div style={styles.buttonGroup}>
                    <button 
                      onClick={handleUpdateProfile} 
                      style={styles.saveButton}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setCarInfo(user.car || '');
                        setError('');
                      }} 
                      style={styles.cancelButton}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode: display current profile information
                <div style={styles.detailsView}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Car Information:</span>
                    <span style={styles.detailValue}>{user.car || 'Not provided'}</span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    style={styles.editButton}
                  >
                    Edit Car Information
                  </button>
                </div>
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
                  <br />
                  <a href="/parking-lots" style={styles.link}>Browse parking lots</a> to add favorites.
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
  detailsView: {
    display: 'flex',
    flexDirection: 'column',
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
    alignSelf: 'flex-start',
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
  helpText: {
    display: 'block',
    marginTop: '5px',
    fontSize: '12px',
    opacity: 0.8,
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
  link: {
    color: '#FFFFFF',
    textDecoration: 'underline',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#800000', // VT Maroon
    color: '#FFFFFF',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '4px solid #FFFFFF',
    animation: 'spin 1s linear infinite',
  },
  successMessage: {
    backgroundColor: '#DFF2BF', // Light green
    color: '#4F8A10', // Dark green
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: '#FFBABA', // Light red
    color: '#D8000C', // Dark red
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px',
    textAlign: 'center',
  },
};

export default UserProfile;