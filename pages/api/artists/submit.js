import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function makeSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

function parsePlatform(platform, value) {
  if (!value || !value.trim()) return null;
  const v = value.trim();
  if (platform === 'instagram') {
    return { handle: v.replace(/^@/, ''), url: `https://instagram.com/${v.replace(/^@/, '')}` };
  }
  return { handle: null, url: v.startsWith('http') ? v : `https://${v}` };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    artistName, city, genres, genreCustom,
    spotify, instagram, appleMusic, website, youtube,
    email, phone, bio,
  } = req.body;

  if (!artistName || !artistName.trim()) {
    return res.status(400).json({ error: 'Artist name is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const genreTags = [...(genres || [])];
  if (genreCustom && genreCustom.trim()) genreTags.push(genreCustom.trim());

  let homeCity = null;
  let homeState = null;
  if (city && city.trim()) {
    const parts = city.split(',').map(s => s.trim());
    homeCity = parts[0] || null;
    homeState = parts[1] || null;
  }

  let slug = makeSlug(artistName.trim());
  const { data: existing } = await supabase
    .from('artist_profiles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const { data: artist, error: artistError } = await supabase
    .from('artist_profiles')
    .insert({
      name: artistName.trim(),
      slug,
      bio: bio || null,
      genre_tags: genreTags.length > 0 ? genreTags : null,
      home_city: homeCity,
      home_state: homeState,
      home_country: 'US',
      trust_level: 'inferred',
      primary_source: 'submission',
      is_claimed: false,
      is_verified: false,
      profile_complete: false,
      external_ids: {
        submission_email: email.trim(),
        submission_phone: phone || null,
        apple_music_url: appleMusic ? appleMusic.trim() : null,
      },
    })
    .select('id')
    .single();

  if (artistError) {
    console.error('artist_profiles insert error:', artistError);
    return res.status(500).json({ error: 'Failed to create artist profile', detail: artistError.message });
  }

  const artistId = artist.id;

  const socialMap = [
    { platform: 'spotify',   value: spotify },
    { platform: 'instagram', value: instagram },
    { platform: 'website',   value: website },
    { platform: 'youtube',   value: youtube },
  ];

  const socialInserts = [];
  let order = 0;
  for (const { platform, value } of socialMap) {
    const parsed = parsePlatform(platform, value);
    if (!parsed) continue;
    socialInserts.push({
      artist_id: artistId,
      platform,
      url: parsed.url,
      handle: parsed.handle,
      display_order: order++,
    });
  }

  if (socialInserts.length > 0) {
    const { error: socialError } = await supabase
      .from('social_links')
      .insert(socialInserts);
    if (socialError) {
      console.error('social_links insert error:', socialError);
    }
  }

  return res.status(200).json({
    success: true,
    artistId,
    slug,
    message: `${artistName} is on the map.`,
  });
}
