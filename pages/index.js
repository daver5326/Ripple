import { useEffect, useRef } from 'react';

export default function Home() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mapboxgl;
    try {
      mapboxgl = require('mapbox-gl');
    } catch (e) {
      console.error('mapbox-gl not available', e);
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-92.2896, 34.7465],
      zoom: 11,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        const res = await fetch('/api/shows');
        const data = await res.json();
        const shows = Array.isArray(data) ? data : data.shows || [];

        shows.forEach((show) => {
          const lat = show.venue?.latitude ?? show.latitude;
          const lng = show.venue?.longitude ?? show.longitude;
          const artistName = show.artist ?? show.artistName ?? '';
          const venueName = show.venue?.name ?? show.venueName ?? '';
          const showDate = show.date ?? show.showDate ?? '';

          if (lat == null || lng == null) return;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="font-family: system-ui, sans-serif; padding: 4px;">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">${artistName}</div>
              <div style="font-size: 13px; margin-bottom: 2px;">${venueName}</div>
              <div style="font-size: 12px; color: #6b6b6b;">${showDate}</div>
            </div>`
          );

          new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
        });
      } catch (err) {
        console.error('Failed to fetch shows', err);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
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
