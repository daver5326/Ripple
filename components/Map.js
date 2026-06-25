import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map({ venues = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-92.3731, 34.7465],
      zoom: 6,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    // Group venues by coordinates
    const groups = {};
    venues.forEach((venue) => {
      if (!venue.longitude || !venue.latitude) return;
      const key = `${venue.longitude},${venue.latitude}`;
      if (!groups[key]) {
        groups[key] = { lng: venue.longitude, lat: venue.latitude, venues: [] };
      }
      groups[key].venues.push(venue);
    });

    Object.values(groups).forEach((group) => {
      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.background = '#c9a84c';
      el.style.border = '2px solid #ffffff';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 0 6px rgba(201,168,76,0.7)';

      const popupHTML = group.venues
        .map(
          (v) =>
            `<div style="margin-bottom:8px">
              <strong style="font-size:14px">${v.name}</strong><br/>
              ${v.city ? `<span style="font-size:12px;color:#888">${v.city}</span>` : ''}
            </div>`
        )
        .join('');

      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<div style="font-family:system-ui,sans-serif;padding:4px">${popupHTML}</div>`
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([group.lng, group.lat])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [venues]);

  return (
    <div
      ref={mapContainer}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
