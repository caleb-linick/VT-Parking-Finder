/**
 * ParkingLotDetail.jsx
 *
 * Enhanced version with Google Maps navigation integration.
 * This component displays detailed information about a specific parking lot,
 * including its floor plan, real-time occupancy data, and navigation options.
 *
 * Features:
 * - Displays overall lot information (name, availability, status)
 * - Shows a visual floor plan with spot-by-spot occupancy data
 * - Provides floor selection for multi-level parking garages
 * - Allows users to add/remove the lot from their favorites
 * - Displays information about the sensor technology used
 * - Provides Google Maps navigation via an integrated button
 * - Handles error states when lot information is not found
 *
 * @author VT Parking Finder Team
 * @version 1.2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';
import GoogleMapsNavigation from './GoogleMapsNavigation';
import apiService from '../services/apiService';

/**
 * Mock data for parking lots - in production, this would come from an API
 */
const parkingLotData = {
  1: {
    name: 'Perry Street Garage',
    totalSpots: 120,
    availableSpots: 45,
    floors: 4,
    spotsPerFloor: 30,
    position: [37.2312, -80.4263],
    address: '155 Perry St, Blacksburg, VA 24061',
    // Mock occupancy data
    occupancy: [
      // Floor 1
      [
        1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 0, 1,
      ],
      // Floor 2
      [
        1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1,
        0, 0, 1, 0, 0, 1,
      ],
      // Floor 3
      [
        0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        0, 0, 1, 0, 0, 1,
      ],
      // Floor 4
      [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 0, 0,
      ],
    ],
  },
  2: {
    name: 'Cassell Lot',
    totalSpots: 80,
    availableSpots: 0,
    floors: 1,
    spotsPerFloor: 80,
    position: [37.2214, -80.4205],
    address: '675 Washington St, Blacksburg, VA 24061',
    // All spots occupied
    occupancy: [Array(80).fill(1)],
  },
  3: {
    name: 'Litton Reaves',
    totalSpots: 60,
    availableSpots: 35,
    floors: 1,
    spotsPerFloor: 60,
    position: [37.222, -80.4267],
    address: 'Litton Reaves Hall, Blacksburg, VA 24061',
    occupancy: [
      // Mix of available and occupied spots
      [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      ],
    ],
  },
  4: {
    name: 'Squires',
    totalSpots: 40,
    availableSpots: 5,
    floors: 1,
    spotsPerFloor: 40,
    position: [37.2291, -80.4168],
    address: 'Squires Student Center, 290 College Ave, Blacksburg, VA 24060',
    occupancy: [
      // Mostly occupied with few available spots
      [
        1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1,
      ],
    ],
    // Indicate which spot is connected to a sensor
    sensorMappings: {
      1: 0, // Sensor ID 1 maps to spot index 0
    },
  },
  5: {
    name: 'Architecture Annex',
    totalSpots: 30,
    availableSpots: 20,
    floors: 1,
    spotsPerFloor: 30,
    position: [37.2283, -80.4158],
    address: 'Architecture Annex, Blacksburg, VA 24061',
    occupancy: [
      // Mostly available
      [
        1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0,
        1, 0, 0, 0, 0, 1,
      ],
    ],
  },
};

/**
 * Component that displays detailed information about a specific parking lot
 * with real-time sensor updates
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
  const [sensorData, setSensorData] = useState(null);
  const [sensorError, setSensorError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load parking lot information and check favorite status
   * on component mount
   */
  useEffect(() => {
    setIsLoading(true);

    // Get lot info from mock data
    const lotData = parkingLotData[id];
    if (lotData) {
      setLotInfo(lotData);

      // Check if this lot is in user favorites using JWT auth
      if (apiService.isAuthenticated()) {
        const user = apiService.getUser();
        if (user && user.favorites) {
          setIsFavorite(user.favorites.includes(Number(id)));
        }
      }
    }

    setIsLoading(false);
  }, [id]);

  /**
   * Poll sensor data for applicable parking lots
   */
  useEffect(() => {
    // Only run this polling for lots with sensor mappings
    if (lotInfo && lotInfo.sensorMappings) {
      const sensors = Object.keys(lotInfo.sensorMappings);

      if (sensors.length > 0) {
        // Set up polling for sensor data
        const pollSensorData = async () => {
          try {
            setSensorError(null);

            // For demo purposes, we're only using sensor ID 1
            // In production, you would fetch data for all sensors
            const sensorId = 1;
            const data = await apiService.getSensorData(sensorId);

            if (data) {
              setSensorData(data);

              // Update the occupancy state based on sensor data
              updateOccupancyFromSensor(sensorId, data.is_occupied);
            }
          } catch (error) {
            console.error('Error fetching sensor data:', error);
            setSensorError('Unable to fetch real-time sensor data');
          }
        };

        // Initial fetch
        pollSensorData();

        // Set up polling interval (every 5 seconds)
        const intervalId = setInterval(pollSensorData, 5000);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
      }
    }
  }, [lotInfo, id]);

  /**
   * Update the occupancy state based on sensor data
   *
   * @param {string} sensorId - The ID of the sensor
   * @param {boolean} isOccupied - Whether the spot is occupied
   */
  const updateOccupancyFromSensor = (sensorId, isOccupied) => {
    if (!lotInfo || !lotInfo.sensorMappings) return;

    // Get the spot index for this sensor
    const spotIndex = lotInfo.sensorMappings[sensorId];

    if (spotIndex !== undefined) {
      // Clone the current lot info to avoid direct state mutation
      setLotInfo((prevLotInfo) => {
        // Deep clone the occupancy array
        const newOccupancy = prevLotInfo.occupancy.map((floor) => [...floor]);

        // Update the spot occupancy (0 = empty, 1 = occupied)
        newOccupancy[0][spotIndex] = isOccupied ? 1 : 0;

        // Count available spots
        const flatOccupancy = newOccupancy.flat();
        const occupied = flatOccupancy.filter((spot) => spot === 1).length;
        const available = flatOccupancy.length - occupied;

        return {
          ...prevLotInfo,
          occupancy: newOccupancy,
          availableSpots: available,
        };
      });
    }
  };

  /**
   * Toggle the favorite status of the current parking lot
   * using JWT authentication
   */
  const toggleFavorite = async () => {
    if (!apiService.isAuthenticated()) {
      alert('Please log in to save favorites');
      return;
    }

    try {
      const user = apiService.getUser();
      const favorites = user.favorites || [];
      let newFavorites;

      if (isFavorite) {
        // Remove from favorites
        newFavorites = favorites.filter((fav) => fav !== Number(id));
      } else {
        // Add to favorites
        newFavorites = [...favorites, Number(id)];
      }

      // Update favorites in the backend
      await apiService.updateFavorites(newFavorites);

      // Update local state
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading parking lot information...</p>
        </div>
      </div>
    );
  }

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
            <Link to="/parking-lots" style={styles.backLink}>
              Back to Parking Lots
            </Link>
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
            style={
              isFavorite
                ? styles.favoriteButton.active
                : styles.favoriteButton.default
            }
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
                    lotInfo.availableSpots === 0
                      ? 'red'
                      : lotInfo.availableSpots < lotInfo.totalSpots / 3
                      ? 'yellow'
                      : 'green',
                  color:
                    lotInfo.availableSpots < lotInfo.totalSpots / 3 &&
                    lotInfo.availableSpots > 0
                      ? 'black'
                      : 'white',
                }}
              >
                {lotInfo.availableSpots === 0
                  ? 'Full'
                  : lotInfo.availableSpots < lotInfo.totalSpots / 3
                  ? 'Some Open'
                  : 'Available'}
              </span>
            </div>
          </div>

          {/* Google Maps Navigation Button */}
          <div style={styles.navigationSection}>
            <GoogleMapsNavigation
              name={lotInfo.name}
              coordinates={lotInfo.position}
              address={lotInfo.address}
            />
          </div>
        </div>

        {/* Sensor status indicator (if applicable) */}
        {sensorData && (
          <div style={styles.sensorStatusContainer}>
            <div style={styles.sensorStatusHeader}>
              <h3 style={styles.sensorStatusTitle}>Live Sensor Status</h3>
              <span style={styles.sensorStatusTime}>
                Last updated:{' '}
                {new Date(sensorData.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div style={styles.sensorStatusInfo}>
              <div
                style={{
                  ...styles.sensorStatusIndicator,
                  backgroundColor: sensorData.is_occupied ? 'red' : 'green',
                }}
              ></div>
              <span>
                Spot 1 is currently{' '}
                {sensorData.is_occupied ? 'occupied' : 'available'}
              </span>
            </div>
            {sensorError && <div style={styles.sensorError}>{sensorError}</div>}
          </div>
        )}

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
                    ...(selectedFloor === i ? styles.activeFloorButton : {}),
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
            {lotInfo.floors > 1
              ? `Floor ${selectedFloor + 1} Plan`
              : 'Parking Lot Map'}
          </h3>
          <div style={styles.floorPlan}>
            <div style={styles.spotGrid}>
              {lotInfo.occupancy[selectedFloor].map((isOccupied, index) => {
                // Check if this spot has a sensor connected to it
                const hasSensor =
                  lotInfo.sensorMappings &&
                  Object.values(lotInfo.sensorMappings).includes(index) &&
                  selectedFloor === 0; // Sensors are only on floor 1 for demo

                return (
                  <div
                    key={index}
                    style={{
                      ...styles.parkingSpot,
                      backgroundColor: isOccupied ? '#FF6B6B' : '#6BFF6B',
                      ...(hasSensor ? styles.sensorEnabledSpot : {}),
                    }}
                  >
                    <span style={styles.spotNumber}>{index + 1}</span>
                    <span style={styles.spotStatus}>
                      {isOccupied ? 'Occupied' : 'Available'}
                    </span>
                    {hasSensor && (
                      <span style={styles.sensorBadge}>SENSOR</span>
                    )}
                  </div>
                );
              })}
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
            {lotInfo.sensorMappings && (
              <div style={styles.legendItem}>
                <div style={styles.legendColor.sensor}></div>
                <span>Sensor-Enabled Spot</span>
              </div>
            )}
          </div>
        </div>

        {/* Sensor information section */}
        <div style={styles.sensorInfo}>
          <h3 style={styles.sectionTitle}>Sensor Information</h3>
          <p style={styles.sensorText}>
            This parking lot is equipped with ultrasonic sensors that detect
            vehicle presence in real-time. Data is updated every 5 seconds to
            provide the most accurate information about parking availability.
          </p>
          {lotInfo.sensorMappings && (
            <p style={styles.sensorDetail}>
              Currently, {Object.keys(lotInfo.sensorMappings).length} sensor
              {Object.keys(lotInfo.sensorMappings).length > 1 ? 's are' : ' is'}{' '}
              active in this lot, monitoring specific parking spots in
              real-time.
            </p>
          )}
        </div>

        {/* Location information section */}
        <div style={styles.locationInfo}>
          <h3 style={styles.sectionTitle}>Location Information</h3>
          <p style={styles.locationText}>
            <strong>Address:</strong> {lotInfo.address}
          </p>
          <p style={styles.locationText}>
            Use the "Navigate to this Parking Lot" button above to get
            directions via Google Maps.
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
    },
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
    marginBottom: '20px',
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
  navigationSection: {
    width: '100%',
  },
  sensorStatusContainer: {
    width: '90%',
    backgroundColor: '#800080', // Purple to distinguish it
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  sensorStatusHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  sensorStatusTitle: {
    margin: 0,
    fontSize: '18px',
  },
  sensorStatusTime: {
    fontSize: '14px',
    opacity: 0.8,
  },
  sensorStatusInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  sensorStatusIndicator: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    marginRight: '10px',
  },
  sensorError: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    padding: '5px 10px',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '14px',
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
    position: 'relative',
  },
  sensorEnabledSpot: {
    boxShadow: '0 0 8px 2px rgba(128, 0, 128, 0.6)', // Purple glow for sensor spots
    border: '2px solid #800080', // Purple border
  },
  spotNumber: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  spotStatus: {
    fontSize: '12px',
  },
  sensorBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#800080', // Purple
    color: 'white',
    fontSize: '8px',
    padding: '2px 4px',
    borderRadius: '2px',
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
    sensor: {
      width: '20px',
      height: '20px',
      backgroundColor: 'white',
      border: '2px solid #800080', // Purple border
      boxShadow: '0 0 5px 1px rgba(128, 0, 128, 0.6)', // Purple glow
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
    marginBottom: '20px',
  },
  sensorText: {
    textAlign: 'center',
    lineHeight: '1.6',
  },
  sensorDetail: {
    textAlign: 'center',
    lineHeight: '1.6',
    fontWeight: 'bold',
    color: '#800080', // Purple
    marginTop: '10px',
  },
  locationInfo: {
    width: '90%',
    backgroundColor: '#EEEEEE',
    padding: '20px',
    borderRadius: '8px',
    color: '#333333',
  },
  locationText: {
    textAlign: 'center',
    lineHeight: '1.6',
    margin: '5px 0',
  },
  errorMessage: {
    backgroundColor: '#FFDDDD', // Light red
    padding: '20px',
    borderRadius: '8px',
    color: '#800000', // VT Maroon
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
    color: '#FFFFFF',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '4px solid #FFFFFF',
    animation: 'spin 1s linear infinite',
    marginBottom: '15px',
  },
};

export default ParkingLotDetail;
