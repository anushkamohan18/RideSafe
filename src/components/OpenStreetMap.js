import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color = 'blue', type = 'default') => {
  const icons = {
    user: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="3" fill="white"/>
    </svg>`,
    driver: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="7.5" width="20" height="10" rx="2" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="8.5" cy="17.5" r="2" fill="white"/>
      <circle cx="16.5" cy="17.5" r="2" fill="white"/>
    </svg>`,
    pickup: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 2.5L20 22.5H5L12.5 2.5Z" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>`,
    dropoff: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7.5" y="7.5" width="10" height="10" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>`
  };

  return L.divIcon({
    html: icons[type] || icons.default,
    className: 'custom-div-icon',
    iconSize: [25, 25],
    iconAnchor: [12.5, 25],
    popupAnchor: [0, -25],
  });
};

// Component to handle map center changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const OpenStreetMap = ({
  center = [28.6139, 77.2090], // Default to Delhi, India
  zoom = 13,
  markers = [],
  userLocation = null,
  drivers = [],
  route = null,
  onMapClick = null,
  style = { height: '400px', width: '100%' },
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div 
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
        className={className}
      >
        <div style={{ textAlign: 'center' }}>
          <div>🗺️</div>
          <div style={{ marginTop: '8px', color: '#666' }}>Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={style} className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        {/* OpenStreetMap tiles - completely free */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        {/* Update map center when props change */}
        <MapUpdater center={center} zoom={zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createCustomIcon('#2196F3', 'user')}
          >
            <Popup>
              <div>
                <strong>Your Location</strong>
                <br />
                Lat: {userLocation.latitude.toFixed(6)}
                <br />
                Lng: {userLocation.longitude.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Driver markers */}
        {drivers.map((driver, index) => (
          <Marker
            key={`driver-${driver.id || index}`}
            position={[driver.latitude, driver.longitude]}
            icon={createCustomIcon('#4CAF50', 'driver')}
          >
            <Popup>
              <div>
                <strong>{driver.name || 'Driver'}</strong>
                <br />
                {driver.vehicle && (
                  <>
                    {driver.vehicle.make} {driver.vehicle.model}
                    <br />
                    Plate: {driver.vehicle.plateNumber}
                    <br />
                  </>
                )}
                Status: {driver.isAvailable ? 'Available' : 'Busy'}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Generic markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomIcon(
              marker.color || '#FF5722',
              marker.type || 'default'
            )}
          >
            {marker.title && (
              <Popup>
                <div>
                  <strong>{marker.title}</strong>
                  {marker.description && (
                    <>
                      <br />
                      {marker.description}
                    </>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Route polyline */}
        {route && route.length > 1 && (
          <Polyline
            positions={route.map(point => [point.latitude, point.longitude])}
            color="#2196F3"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>
      
      {/* Custom CSS */}
      <style jsx>{`
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 12px;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default OpenStreetMap; 