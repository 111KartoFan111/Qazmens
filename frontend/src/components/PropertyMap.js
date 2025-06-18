import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography } from '@mui/material';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const subjectIcon = new L.Icon({
  iconUrl: require('../assets/subject-marker.png'),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const comparableIcon = new L.Icon({
  iconUrl: require('../assets/comparable-marker.png'),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle map view changes
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function PropertyMap({ subjectProperty, comparableProperties, className }) {
  const mapRef = useRef(null);

  // Calculate the center point of all properties
  const calculateCenter = () => {
    if (!subjectProperty && (!comparableProperties || comparableProperties.length === 0)) {
      return [43.2220, 76.8512]; // Default to Almaty
    }

    const allProperties = [subjectProperty, ...(comparableProperties || [])].filter(Boolean);
    const totalLat = allProperties.reduce((sum, prop) => sum + prop.location.lat, 0);
    const totalLng = allProperties.reduce((sum, prop) => sum + prop.location.lng, 0);
    
    return [
      totalLat / allProperties.length,
      totalLng / allProperties.length
    ];
  };

  const center = calculateCenter();
  const zoom = 13;

  return (
    <Box
      className={className}
      sx={{
        height: '400px',
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
          borderRadius: '20px',
        },
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapController center={center} zoom={zoom} />

        {subjectProperty && (
          <Marker
            position={[subjectProperty.location.lat, subjectProperty.location.lng]}
            icon={subjectIcon}
          >
            <Popup>
              <Typography variant="subtitle1" fontWeight="bold">
                Subject Property
              </Typography>
              <Typography variant="body2">
                {subjectProperty.address}
              </Typography>
              <Typography variant="body2">
                Price: ${subjectProperty.price.toLocaleString()}
              </Typography>
            </Popup>
          </Marker>
        )}

        {comparableProperties?.map((property, index) => (
          <Marker
            key={property.id || index}
            position={[property.location.lat, property.location.lng]}
            icon={comparableIcon}
          >
            <Popup>
              <Typography variant="subtitle1" fontWeight="bold">
                Comparable Property {index + 1}
              </Typography>
              <Typography variant="body2">
                {property.address}
              </Typography>
              <Typography variant="body2">
                Price: ${property.price.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Distance: {property.distance?.toFixed(2)} km
              </Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}

export default PropertyMap; 