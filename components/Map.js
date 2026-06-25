import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-92.2896, 34.7465],
      zoom: 11,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        const res = await fetch('/api/shows');
        const shows = await res.json();

        const venueMap = {};
        shows.forEach((show) => {
          const venue = show.venues;
          const artist = show.artist_profiles;
          const lat = venue?.latitude;
          const lng = venue?.longitude;
          if (!lat || !lng) return;

          const key = `${lng},${lat}`;
          if (!venueMap[key]) {
            venueMap[key] = {
              lng: parseFloat(lng),
              lat: parseFloat(lat),
              venueName: venue?.name || '',
              venueCity: venue?.city || '',
              shows: [],
            };
          }
          venueMap[key].shows.push(show);
        });

        Object.values(venueMap).forEach((group) => {
          const count = group.shows.length;

          const el = document.createElement('div');
          const size = count > 1 ? 44 : 32;
          el.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: #3fb68a;
            border: 2px solid rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
            font-weight: 700;
            font-size: ${count > 1 ? '14px' : '16px'};
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            user-select: none;
          `;
          el.textContent = count > 1 ? String(count) : '\u266a';

          const artistRows = group.shows.map((show) => {
            const artistName = show.artist_profiles?.name || 'Unknown Artist';
            const slug = show.artist_profiles?.slug || '';
            const genres = Array.isArray(show.artist_profiles?.genre_tags)
              ? show.artist_profiles.genre_tags.slice(0, 2).join(', ')
              : '';
            const time = show.starts_at
              ? new Date(show.starts_at).toLocaleString('en-US', {
                  month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit',
                })
              : '';
            const freeLabel = show.is_free
              ? '<span style="color:#3fb68a;font-size:11px;margin-left:6px">FREE</span>'
              : '';
            return `<div style="padding:6px 0;border-bottom:1px solid #2a2a2a;">
              <a href="/artists/${slug}" style="color:#3fb68a;text-decoration:none;font-weight:600;font-size:14px;">${artistName}</a>${freeLabel}
              ${genres ? `<div style="color:#999;font-size:11px;margin-top:2px">${genres}</div>` : ''}
              ${time ? `<div style="color:#aaa;font-size:11px">${time}</div>` : ''}
            </div>`;
          }).join('');

          const popupHTML = `
            <div style="font-family:system-ui,sans-serif;min-width:200px;max-width:280px">
              <div style="font-weight:700;font-size:14px;color:#fff;margin-bottom:2px">${group.venueName}</div>
              <div style="font-size:12px;color:#aaa;margin-bottom:8px">${group.venueCity}</div>
              <div style="max-height:220px;overflow-y:auto">${artistRows}</div>
            </div>`;

          const popup = new mapboxgl.Popup({ offset: 12, closeButton: true })
            .setHTML(popupHTML);

          new mapboxgl.Marker({ element: el })
            .setLngLat([group.lng, group.lat])
            .setPopup(popup)
            .addTo(map);
        });

      } catch (err) {
        console.error('Map failed to load shows', err);
      }
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
}
