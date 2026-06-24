import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-92.2896, 34.7465],
      zoom: 8,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        const res = await fetch('/api/shows');
        const shows = await res.json();

        shows.forEach((show) => {
          const venue = show.venues;
          const artist = show.artist_profiles;

          const lat = venue?.latitude;
          const lng = venue?.longitude;

          if (!lat || !lng) return;

          const artistName = artist?.name || 'Unknown Artist';
          const venueName = venue?.name || '';
          const showDate = new Date(show.starts_at).toLocaleDateString();

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            '<div style="font-family:system-ui;padding:4px">' +
            '<div style="font-weight:700;font-size:14px">' + artistName + '</div>' +
            '<div style="font-size:13px">' + venueName + '</div>' +
            '<div style="font-size:12px;color:#666">' + showDate + '</div>' +
            '</div>'
          );

          new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });
      } catch (err) {
        console.error('Failed to load shows', err);
      }
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}
