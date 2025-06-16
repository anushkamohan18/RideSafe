import React from 'react';
import OpenStreetMap from './OpenStreetMap';

export default function WebMap({
  initialCenter = { lat: 28.6139, lng: 77.2090 }, // Delhi default
  zoom = 13,
  markers = [],
  onMapReady,
  style = { height: '400px', width: '100%' },
  showUserLocation = true,
  onMarkerClick,
  polylines = [],
  // Legacy props for compatibility
  center,
  userLocation,
  drivers = [],
  route = null,
  onMapClick = null
}) {
  // Convert center from Google Maps format to Leaflet format
  const mapCenter = center 
    ? (Array.isArray(center) ? center : [center.lat, center.lng])
    : [initialCenter.lat, initialCenter.lng];

  // Convert markers to OpenStreetMap format
  const osmMarkers = markers.map((marker, index) => ({
    latitude: marker.latitude,
    longitude: marker.longitude,
    title: marker.title || `Marker ${index + 1}`,
    description: marker.description,
    color: marker.color,
    type: marker.type || 'default'
  }));

  // Convert polylines to route format for OpenStreetMap
  const osmRoute = route || (polylines.length > 0 ? polylines[0]?.coordinates : null);

  // Handle user location
  const currentUserLocation = userLocation || (showUserLocation ? {
    latitude: mapCenter[0],
    longitude: mapCenter[1]
  } : null);

  return (
    <OpenStreetMap
      center={mapCenter}
      zoom={zoom}
      markers={osmMarkers}
      userLocation={currentUserLocation}
      drivers={drivers}
      route={osmRoute}
      onMapClick={onMapClick || onMarkerClick}
      style={style}
    />
  );
}
