import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function getServerSideProps({ params }) {
  const { id } = params;

  const { data: artist, error: artistError } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('slug', id)
    .single();

  if (artistError || !artist) {
    return { notFound: true };
  }

  const { data: shows } = await supabase
    .from('shows')
    .select('*, venues(name, address, city, state)')
    .eq('artist_id', artist.id)
    .eq('status', 'published')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('artist_id', artist.id)
    .order('display_order', { ascending: true });

  return {
    props: {
      artist,
      shows: shows || [],
      socialLinks: socialLinks || [],
    },
  };
}

export default function ArtistPage({ artist, shows, socialLinks }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf8f5',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Banner */}
      <div style={{
        height: '180px',
        backgroundColor: '#1e2d4a',
        backgroundImage: artist.banner_url ? `url(${artist.banner_url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Avatar + Name */}
      <div style={{ padding: '0 20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#c9a84c',
          backgroundImage: artist.avatar_url ? `url(${artist.avatar_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: '-40px',
          border: '3px solid #faf8f5',
        }} />

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e2d4a',
          margin: '12px 0 4px',
        }}>
          {artist.name}
        </h1>

        {artist.genre_tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {artist.genre_tags.map((tag) => (
              <span key={tag} style={{
                backgroundColor: '#1e2d4a',
                color: '#c9a84c',
                fontSize: '11px',
                fontWeight: '600',
                padding: '3px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {artist.home_city && (
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px' }}>
            {artist.home_city}{artist.home_state ? `, ${artist.home_state}` : ''}
          </p>
        )}

        {artist.bio && (
          <p style={{
            fontSize: '15px',
            color: '#444',
            lineHeight: '1.6',
            margin: '0 0 24px',
          }}>
            {artist.bio}
          </p>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1e2d4a',
                  color: '#faf8f5',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  textDecoration: 'none',
                  textTransform: 'capitalize',
                }}
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}

        {/* Upcoming Shows */}
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#1e2d4a',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Upcoming Shows
        </h2>

        {shows.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '40px' }}>
            No upcoming shows listed.
          </p>
        ) : (
          <div style={{ marginBottom: '40px' }}>
            {shows.map((show) => (
              <div key={show.id} style={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#1e2d4a',
                  marginBottom: '4px',
                }}>
                  {new Date(show.starts_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {' '}
                  {new Date(show.starts_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                <div style={{ fontSize: '14px', color: '#444' }}>
                  {show.venues?.name}
                </div>
                {show.venues?.city && (
                  <div style={{ fontSize: '13px', color: '#888' }}>
                    {show.venues.city}{show.venues.state ? `, ${show.venues.state}` : ''}
                  </div>
                )}
                <div style={{
                  fontSize: '12px',
                  color: show.is_free ? '#2a7a4b' : '#c9a84c',
                  fontWeight: '600',
                  marginTop: '6px',
                }}>
                  {show.is_free ? 'Free' : `$${show.cover_min}${show.cover_max ? ` – $${show.cover_max}` : ''}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
