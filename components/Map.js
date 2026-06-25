import { useEffect, useRef } from 'react';

export default function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let mapboxgl;
    try {
      mapboxgl = require('mapbox-gl');
    } catch (e) {
      console.error('mapbox-gl not available', e);
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-92.2896, 34.7465],
      zoom: 8,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        const res = await fetch('/api/shows');
        const shows = await res.json();

        // Group shows by unique lng,lat key
        const venueMap = {};
        for (const show of shows) {
          const lat = show.venues?.latitude;
          const lng = show.venues?.longitude;
          if (lat == null || lng == null) continue;
          const key = `${lng},${lat}`;
          if (!venueMap[key]) {
            venueMap[key] = {
              lng: parseFloat(lng),
              lat: parseFloat(lat),
              venueName: show.venues?.name || '',
              venueCity: show.venues?.city || '',
              shows: [],
            };
          }
          venueMap[key].shows.push(show);
        }

        for (const key of Object.keys(venueMap)) {
          const group = venueMap[key];
          const count = group.shows.length;

          // Build marker element
          const el = document.createElement('div');
          const size = count > 1 ? 38 : 28;
          el.style.width = size + 'px';
          el.style.height = size + 'px';
          el.style.borderRadius = '50%';
          el.style.background = '#3fb68a';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.color = '#ffffff';
          el.style.fontWeight = '700';
          el.style.fontSize = count > 1 ? '14px' : '16px';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
          el.style.border = '2px solid rgba(255,255,255,0.3)';
          el.style.userSelect = 'none';
          el.textContent = count > 1 ? String(count) : '\u266a';

          // Build popup HTML
          const sortedShows = group.shows.slice().sort((a, b) =>
            new Date(a.starts_at) - new Date(b.starts_at)
          );

          const artistRows = sortedShows.map((show) => {
            const artistName = show.artist_profiles?.name || 'Unknown Artist';
            const slug = show.artist_profiles?.slug || '';
            const genres = Array.isArray(show.artist_profiles?.genre_tags)
              ? show.artist_profiles.genre_tags.join(', ')
              : '';
            const time = show.starts_at
              ? new Date(show.starts_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : '';
            const freeLabel = show.is_free ? '<span style="color:#3fb68a;font-size:11px;margin-left:6px;">FREE</span>' : '';
            return `<div style="padding:6px 0;border-bottom:1px solid #2a2a2a;">
  <a href="/artists/${slug}" style="color:#3fb68a;text-decoration:none;font-weight:600;font-size:14px;">${artistName}</a>${freeLabel}
  ${genres ? `<div style="color:#999;font-size:11px;margin-top:2px;">${genres}</div>` : ''}
  ${time ? `<div style="color:#aaa;font-size:11px;">${time}</div>` : ''}
</div>`;
          }).join('');

          const popupHTML = `
<div style="font-family:system-ui,sans-serif;min-width:200px;max-width:280px;">
  <div style="font-weight:700;font-size:14px;color:#ffffff;margin-bottom:2px;">${group.venueName}</div>
  <div style="font-size:12px;color:#aaa;margin-bottom:8px;">${group.venueCity}</div>
  <div style="max-height:220px;overflow-y:auto;">${artistRows}</div>
</div>`;

          const popup = new mapboxgl.Popup({ offset: 12, closeButton: true })
            .setHTML(popupHTML);

          new mapboxgl.Marker({ element: el })
            .setLngLat([group.lng, group.lat])
            .setPopup(popup)
            .addTo(map);
        }
      } catch (err) {
        console.error('Map failed to load shows', err);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: '100%', height: '100vh' }}
    />
  );
}
