/**
 * MapWithUpdatingCenter.jsx
 * 
 * A reusable map component that provides smooth transitions when changing the map's center.
 * This component wraps react-leaflet's MapContainer and adds the ability to dynamically
 * update the center position with an animation using the flyTo method.
 * 
 * The component includes:
 * - A nested ChangeMapView component that handles center updates
 * - Customized marker icons based on parking status
 * - Informative popups with parking lot details
 * 
 * @author VT Parking Finder Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for marker icon not displaying correctly in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * Creates a custom marker icon based on the parking lot status
 * @param {string} status - The status of the parking lot ('Full', 'Some Open', or 'Available')
 * @returns {L.divIcon} A Leaflet divIcon with appropriate styling
 */
const createMarkerIcon = (status) => {
  // Determine color based on parking status
  const color = status === 'Full' ? 'red' : 
               status === 'Some Open' ? 'yellow' : 'green';
               
  // Create a custom div icon with the specified color
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

/**
 * A child component that handles map center updates with animation.
 * Uses the useMap hook to access the map instance and apply the flyTo method.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.center - The [lat, lng] coordinates to center the map on
 * @param {number} props.zoom - The zoom level to apply
 * @returns {null} - This component doesn't render anything visible
 */
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      // Animate the transition to the new center
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5 // Duration of animation in seconds
      });
    }
  }, [center, zoom, map]); // Only re-run when these dependencies change
  
  return null; // This component doesn't render anything visible
};

/**
 * Main map component with auto-centering capability
 * 
 * @param {Object} props - Component props
 * @param {Array} props.center - The [lat, lng] coordinates to center the map on
 * @param {number} props.zoom - The zoom level to apply
 * @param {Array} props.markers - An array of marker objects to display on the map
 * @param {Function} props.onMarkerClick - Callback function when a marker is clicked
 * @returns {JSX.Element} The rendered map component
 */
const MapWithUpdatingCenter = ({ center, zoom, markers, onMarkerClick }) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '4px' }}
    >
      {/* Base map tile layer - uses OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Render markers for each parking lot */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={marker.status ? createMarkerIcon(marker.status) : undefined}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(marker.id),
          }}
        >
          <Popup>
            <div style={styles.popup}>
              <h3 style={styles.popupTitle}>{marker.name}</h3>
              {/* Only show availability if the data exists */}
              {marker.availableSpots !== undefined && (
                <p style={styles.popupInfo}>
                  Available: {marker.availableSpots}/{marker.totalSpots}
                </p>
              )}
              {/* Only show status if the data exists */}
              {marker.status && (
                <p style={styles.popupStatus}>
                  Status: <span style={{
                    color: marker.status === 'Full' ? 'red' : 
                           marker.status === 'Some Open' ? 'darkgoldenrod' : 'green',
                    fontWeight: 'bold'
                  }}>
                    {marker.status}
                  </span>
                </p>
              )}
              <button 
                onClick={() => onMarkerClick && onMarkerClick(marker.id)} 
                style={styles.popupButton}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* This component handles map center updates */}
      <ChangeMapView center={center} zoom={zoom} />
    </MapContainer>
  );
};

/**
 * Component styles
 */
const styles = {
  popup: {
    textAlign: 'center',
    padding: '5px',
    minWidth: '150px',
  },
  popupTitle: {
    margin: '0 0 5px 0',
    color: '#800000', // VT maroon
  },
  popupInfo: {
    margin: '5px 0',
    fontSize: '14px',
  },
  popupStatus: {
    margin: '5px 0',
    fontSize: '14px',
  },
  popupButton: {
    backgroundColor: '#800000', // VT maroon
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '5px',
    fontWeight: 'bold',
  },
};

export default MapWithUpdatingCenter;