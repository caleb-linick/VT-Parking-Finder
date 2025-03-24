/**
 * InteractiveMap.jsx
 * 
 * This component renders an interactive map displaying all parking lots at Virginia Tech.
 * It uses the MapWithUpdatingCenter component to handle map functionality
 * and provides a visual representation of parking lot availability across campus.
 * 
 * The map includes:
 * - Color-coded markers for each parking lot based on availability
 * - Popups with detailed information when clicking a marker
 * - Navigation to the detailed view of a parking lot when selected
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import MapWithUpdatingCenter from './MapWithUpdatingCenter';
import 'leaflet/dist/leaflet.css';

// Mock data for parking lots - in production, this would come from an API
const parkingLots = [
  {
    id: 1,
    name: 'Perry Street Garage',
    position: [37.2312, -80.4263],
    availableSpots: 45,
    totalSpots: 120,
    status: 'Some Open',
  },
  {
    id: 2,
    name: 'Cassell Lot',
    position: [37.2214, -80.4205],
    availableSpots: 0,
    totalSpots: 80,
    status: 'Full',
  },
  {
    id: 3,
    name: 'Litton Reaves',
    position: [37.2220, -80.4267],
    availableSpots: 35,
    totalSpots: 60,
    status: 'Available',
  },
  {
    id: 4,
    name: 'Squires',
    position: [37.2291, -80.4168],
    availableSpots: 5,
    totalSpots: 40,
    status: 'Some Open',
  },
  {
    id: 5,
    name: 'Architecture Annex',
    position: [37.2283, -80.4158],
    availableSpots: 20,
    totalSpots: 30,
    status: 'Available',
  },
];

/**
 * Renders an interactive map of VT parking lots
 * This component is primarily used on the HomePage to display all parking lots
 * 
 * @returns {JSX.Element} The rendered interactive map
 */
const InteractiveMap = () => {
  const navigate = useNavigate();
  
  /**
   * Handler for marker click events
   * Navigates to the detailed view of the selected parking lot
   * 
   * @param {number} id - The ID of the clicked parking lot
   */
  const handleMarkerClick = (id) => {
    // Navigate to the page for the parking lot
    navigate(`/parking-lots/${id}`);
  };

  return (
    <div style={styles.mapContainer}>
      {/* 
        Use the MapWithUpdatingCenter component with:
        - Center coordinates for VT campus
        - Appropriate zoom level to show all parking lots
        - All parking lot markers
        - Click handler for navigation
      */}
      <MapWithUpdatingCenter 
        center={[37.225, -80.423]} // VT campus center coordinates
        zoom={14.6} // Zoom level to show all parking lots
        markers={parkingLots} // All parking lots
        onMarkerClick={handleMarkerClick} // Handler for marker clicks
      />
    </div>
  );
};

/**
 * Component styles
 */
const styles = {
  mapContainer: {
    width: '100%',
    height: '100%',
    borderRadius: '4px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
};

export default InteractiveMap;