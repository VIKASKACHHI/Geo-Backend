import { getDistance } from 'geolib';

/**
 * Check if a user's location is within the allowed radius of an office location
 * @param {Array} userCoordinates - [longitude, latitude] of the user's location
 * @param {Array} officeCoordinates - [longitude, latitude] of the office location
 * @param {Number} radius - Maximum allowed distance in meters
 * @returns {Boolean} - True if user is within the radius, false otherwise
 */
export function isWithinRadius(userCoordinates, officeCoordinates, radius) {
  // Convert coordinates from [longitude, latitude] to {latitude, longitude} format for geolib
  const userPosition = {
    latitude: userCoordinates[1],
    longitude: userCoordinates[0]
  };
  
  const officePosition = {
    latitude: officeCoordinates[1],
    longitude: officeCoordinates[0]
  };
  
  // Calculate distance between the two points in meters
  const distance = getDistance(userPosition, officePosition);
  
  // Return true if user is within the radius
  return distance <= radius;
}

/**
 * Format coordinates for MongoDB geospatial queries
 * @param {Number} longitude - Longitude coordinate
 * @param {Number} latitude - Latitude coordinate
 * @returns {Object} - GeoJSON Point object
 */
export function formatGeoPoint(longitude, latitude) {
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
}
