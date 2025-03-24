/**
 * ParkingLotDetail.jsx
 * 
 * This component displays detailed information about a specific parking lot,
 * including its floor plan, real-time occupancy data, and sensor information.
 * 
 * Features:
 * - Displays overall lot information (name, availability, status)
 * - Shows a visual floor plan with spot-by-spot occupancy data
 * - Provides floor selection for multi-level parking garages
 * - Allows users to add/remove the lot from their favorites
 * - Displays information about the sensor technology used
 * - Handles error states when lot information is not found
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';

/**
 * Mock data for parking lots - in production, this would come from an API
 * Contains detailed information including:
 * - Basic lot information (name, total spots, available spots)
 * - Number of floors for multi-level garages
 * - Spots per floor
 * - Occupancy data for each spot (0 = empty, 1 = occupied)
 */
const parkingLotData = {
  1: {
    name: 'Perry Street Garage',
    totalSpots: 120,
    availableSpots: 45,
    floors: 4,
    spotsPerFloor: 30,
    // Mock occupancy data
    occupancy: [
      // Floor 1
      [1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1],
      // Floor 2
      [1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1],
      // Floor 3
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      // Floor 4
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    ]
  },
  2: {
    name: 'Cassell Lot',
    totalSpots: 80,
    availableSpots: 0,
    floors: 1,
    spotsPerFloor: 80,
    // All spots occupied
    occupancy: [
      Array(80).fill(1)
    ]
  },
  3: {
    name: 'Litton Reaves',
    totalSpots: 60,
    availableSpots: 35,
    floors: 1,
    spotsPerFloor: 60,
    occupancy: [
      // Mix of available and occupied spots
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
       0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
       0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
    ]
  },
  4: {
    name: 'Squires',
    totalSpots: 40,
    availableSpots: 5,
    floors: 1,
    spotsPerFloor: 40,
    occupancy: [
      // Mostly occupied with few available spots
      [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
       1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1]
    ]
  },
  5: {
    name: 'Architecture Annex',
    totalSpots: 30,
    availableSpots: 20,
    floors: 1,
    spotsPerFloor: 30,
    occupancy: [
      // Mostly available
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
       1, 0, 0, 0, 1, 0, 0, 0, 0, 1]
    ]
  }
};

/**
 * Component that displays detailed information about a specific parking lot
 * 
 * @returns {JSX.Element} The rendered parking lot detail view
 */
const ParkingLotDetail = () => {
  // Get the parking lot ID from URL parameters
  const { id } = useParams();
  
  // State management
  const [selectedFloor, setSelectedFloor] = useState(0); // Default to first floor
  const [lotInfo, setLotInfo] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  /**
   * Load parking lot information and check favorite status
   * on component mount
   */
  useEffect(() => {
    // Get lot info from mock data
    const lotData = parkingLotData[id];
    if (lotData) {
      setLotInfo(lotData);
    }

    // Check if this lot is in user favorites
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.favorites && user.favorites.includes(Number(id))) {
        setIsFavorite(true);
      }
    }
  }, [id]);

  /**
   * Toggle the favorite status of the current parking lot
   */
  const toggleFavorite = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const favorites = user.favorites || [];
      
      if (isFavorite) {
        // Remove from favorites
        const newFavorites = favorites.filter(fav => fav !== Number(id));
        user.favorites = newFavorites;
      } else {
        // Add to favorites
        user.favorites = [...favorites, Number(id)];
      }
      
      // Update localStorage and state
      localStorage.setItem('user', JSON.stringify(user));
      setIsFavorite(!isFavorite);
    } else {
      alert('Please log in to save favorites');
    }
  };

  /**
   * Render error message if parking lot information is not found
   */
  if (!lotInfo) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.main}>
          <div style={styles.errorMessage}>
            <h2>Parking lot not found</h2>
            <Link to="/parking-lots" style={styles.backLink}>Back to Parking Lots</Link>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render detailed parking lot information
   */
  return (
    <div style={styles.container}>
      <Header />
      <main style={styles.main}>
        {/* Navigation and favorite button */}
        <div style={styles.topBar}>
          <Link to="/parking-lots" style={styles.backLink}>
            &larr; Back to Parking Lots
          </Link>
          <button 
            onClick={toggleFavorite} 
            style={isFavorite ? styles.favoriteButton.active : styles.favoriteButton.default}
          >
            {isFavorite ? '★ Favorite' : '☆ Add to Favorites'}
          </button>
        </div>
        
        {/* Lot header with key information */}
        <div style={styles.lotHeader}>
          <h1 style={styles.lotName}>{lotInfo.name}</h1>
          <div style={styles.lotStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Available:</span>
              <span style={styles.statValue}>{lotInfo.availableSpots}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total:</span>
              <span style={styles.statValue}>{lotInfo.totalSpots}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Status:</span>
              <span 
                style={{
                  ...styles.statusBadge,
                  backgroundColor: 
                    lotInfo.availableSpots === 0 ? 'red' : 
                    lotInfo.availableSpots < lotInfo.totalSpots / 3 ? 'yellow' : 'green',
                  color: lotInfo.availableSpots < lotInfo.totalSpots / 3 && lotInfo.availableSpots > 0 ? 'black' : 'white'
                }}
              >
                {lotInfo.availableSpots === 0 ? 'Full' : 
                  lotInfo.availableSpots < lotInfo.totalSpots / 3 ? 'Some Open' : 'Available'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Floor selector for multi-level garages */}
        {lotInfo.floors > 1 && (
          <div style={styles.floorSelector}>
            <h3 style={styles.sectionTitle}>Select Floor</h3>
            <div style={styles.floorButtons}>
              {Array.from({ length: lotInfo.floors }, (_, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.floorButton,
                    ...(selectedFloor === i ? styles.activeFloorButton : {})
                  }}
                  onClick={() => setSelectedFloor(i)}
                >
                  Floor {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Floor plan with parking spot grid */}
        <div style={styles.floorPlanContainer}>
          <h3 style={styles.sectionTitle}>
            {lotInfo.floors > 1 ? `Floor ${selectedFloor + 1} Plan` : 'Parking Lot Map'}
          </h3>
          <div style={styles.floorPlan}>
            <div style={styles.spotGrid}>
              {lotInfo.occupancy[selectedFloor].map((isOccupied, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.parkingSpot,
                    backgroundColor: isOccupied ? '#FF6B6B' : '#6BFF6B'
                  }}
                >
                  <span style={styles.spotNumber}>{index + 1}</span>
                  <span style={styles.spotStatus}>
                    {isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend for parking spot colors */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={styles.legendColor.available}></div>
              <span>Available</span>
            </div>
            <div style={styles.legendItem}>
              <div style={styles.legendColor.occupied}></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>
        
        {/* Sensor information section */}
        <div style={styles.sensorInfo}>
          <h3 style={styles.sectionTitle}>Sensor Information</h3>
          <p style={styles.sensorText}>
            This parking lot is equipped with ultrasonic sensors that detect vehicle presence in real-time.
            Data is updated every 5 seconds to provide the most accurate information about parking availability.
          </p>
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
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: '20px',
  },
  backLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    padding: '8px 16px',
    backgroundColor: '#990000', // Slightly lighter maroon
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  favoriteButton: {
    default: {
      padding: '8px 16px',
      backgroundColor: '#333333',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    active: {
      padding: '8px 16px',
      backgroundColor: '#FFD700', // Gold for favorites
      color: '#333333',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }
  },
  lotHeader: {
    width: '90%',
    backgroundColor: '#990000', // Slightly lighter maroon
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  lotName: {
    margin: '0 0 15px 0',
    textAlign: 'center',
  },
  lotStats: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '14px',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  floorSelector: {
    width: '90%',
    backgroundColor: '#EEEEEE',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#333333',
  },
  sectionTitle: {
    textAlign: 'center',
    margin: '0 0 15px 0',
  },
  floorButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  floorButton: {
    padding: '8px 16px',
    backgroundColor: '#DDDDDD',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  activeFloorButton: {
    backgroundColor: '#800000', // VT Maroon
    color: '#FFFFFF',
  },
  floorPlanContainer: {
    width: '90%',
    backgroundColor: '#EEEEEE',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#333333',
  },
  floorPlan: {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '4px',
  },
  spotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px',
  },
  parkingSpot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60px',
    borderRadius: '4px',
    padding: '5px',
  },
  spotNumber: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  spotStatus: {
    fontSize: '12px',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
  },
  legendColor: {
    available: {
      width: '20px',
      height: '20px',
      backgroundColor: '#6BFF6B', // Light green
      marginRight: '5px',
      borderRadius: '3px',
    },
    occupied: {
      width: '20px',
      height: '20px',
      backgroundColor: '#FF6B6B', // Light red
      marginRight: '5px',
      borderRadius: '3px',
    },
  },
  sensorInfo: {
    width: '90%',
    backgroundColor: '#EEEEEE',
    padding: '20px',
    borderRadius: '8px',
    color: '#333333',
  },
  sensorText: {
    textAlign: 'center',
    lineHeight: '1.6',
  },
  errorMessage: {
    backgroundColor: '#FFDDDD', // Light red
    padding: '20px',
    borderRadius: '8px',
    color: '#800000', // VT Maroon
    textAlign: 'center',
  },
};

export default ParkingLotDetail;