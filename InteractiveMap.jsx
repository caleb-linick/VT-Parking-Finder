// InteractiveMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icon not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const parkingLots = [
  {
    id: 1,
    name: 'Perry Street',
    position: [37.2312, -80.4263],
  },
  {
    id: 2,
    name: 'Cassell',
    position: [37.2214, -80.4205],
  },
  {
    id: 3,
    name: 'Squires',
    position: [37.2291, -80.4168],
  },
  {
    id: 4,
    name: 'Archeticure Annex',
    position: [37.2283, -80.4158],
  },
  {
    id: 5,
    name: 'Litton Reaves',
    position: [37.2220, -80.4267],
  },
];

const InteractiveMap = () => {
  const navigate = useNavigate();
  const handleMarkerClick = (id) => {
    // Navigate to the page for the parking lot
    navigate(`/parking-lots/${id}`);
  };

  return (
    <MapContainer center={[37.225, -80.423]} zoom={14.6} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {parkingLots.map((lot) => (
        <Marker
          key={lot.id}
          position={lot.position}
          eventHandlers={{
            click: () => {
              handleMarkerClick(lot.id);
            },
          }}
        >
          <Popup>{lot.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default InteractiveMap;
