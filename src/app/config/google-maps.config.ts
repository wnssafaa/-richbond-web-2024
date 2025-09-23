export const GOOGLE_MAPS_CONFIG = {
  // Remplacez par votre vraie clé API Google Maps
  API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // Configuration par défaut de la carte
  DEFAULT_CENTER: {
    lat: 31.7917, // Centre du Maroc
    lng: -7.0926
  },
  
  DEFAULT_ZOOM: 6,
  
  // Options de la carte
  MAP_OPTIONS: {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true
  },
  
  // Options du marqueur
  MARKER_OPTIONS: {
    draggable: true,
    title: 'Localisation sélectionnée'
  }
};
