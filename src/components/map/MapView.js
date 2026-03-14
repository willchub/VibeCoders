import React, { useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in react-leaflet (webpack/bundler path issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Tile layer presets: different styles and quality. All free, no API key.
const TILE_LAYERS = {
  'carto-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  'carto-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      map.setView([center.lat, center.lng], zoom ?? map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  const map = useMap();
  React.useEffect(() => {
    if (!map || !onMapClick) return;
    const handler = (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onMapClick]);
  return null;
}

/**
 * Renders an OpenStreetMap map with optional markers (Leaflet).
 * No API key required.
 * tileLayer: 'carto-light' (default, crisp) | 'carto-dark' | 'osm'
 */
const MapView = ({
  center,
  zoom = 14,
  markers = [],
  onMapClick,
  onMarkerClick,
  style = { width: '100%', height: '400px' },
  mapContainerClassName = '',
  tileLayer = 'carto-light',
}) => {
  const pos = center && typeof center.lat === 'number' && typeof center.lng === 'number'
    ? [center.lat, center.lng]
    : [-37.8136, 144.9631];

  const handleMapClick = useCallback(
    (e) => {
      if (onMapClick) onMapClick(e);
    },
    [onMapClick]
  );

  const layerConfig = useMemo(
    () => TILE_LAYERS[tileLayer] || TILE_LAYERS['carto-light'],
    [tileLayer]
  );

  return (
    <div className={mapContainerClassName} style={{ ...style, minHeight: 200 }}>
      <MapContainer
        center={pos}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        maxZoom={layerConfig.maxZoom}
        minZoom={2}
      >
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onMapClick={handleMapClick} />
        <TileLayer
          attribution={layerConfig.attribution}
          url={layerConfig.url}
          maxZoom={layerConfig.maxZoom}
          detectRetina
        />
        {markers.map((m) => (
          <Marker
            key={m.id != null ? m.id : `${m.lat}-${m.lng}`}
            position={[m.lat, m.lng]}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(m),
            }}
          >
            {m.title && <Popup>{m.title}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
