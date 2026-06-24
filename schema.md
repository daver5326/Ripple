# Ripple Database Schema
**Supabase instance:** nbpdhyskdgeetafmcgzo.supabase.co
**Last updated: Session 27 | June 24 2026**

---

## Extensions
- `uuid-ossp` — UUID generation
- `postgis` — geospatial queries
- `pg_trgm` — fuzzy text search

---

## Enums
- `user_role` — fan, artist, venue_manager, admin
- `show_status` — draft, published, cancelled, completed
- `show_source` — submission, songkick, bandsintown, spotify, admin_seed
- `trust_level` — verified, claimed, inferred, seeded
- `media_type` — image, video, audio, link
- `social_platform` — instagram, tiktok, facebook, youtube, spotify, bandcamp, website

---

## users
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| email | text | unique, nullable |
| phone | text | unique, nullable |
| display_name | text | |
| avatar_url | text | |
| role | user_role | default 'fan' |
| auth_provider | text | default 'email' |
| auth_provider_id | text | |
| tier | text | default 'free' — monetization hook |
| tier_expires_at | timestamptz | |
| preferred_radius_km | integer | default 25 |
| genres_of_interest | text[] | |
| is_public | boolean | default true |
| bio | text | |
| follower_count | int | default 0 |
| following_count | int | default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | soft delete |

---

## artist_profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id, nullable (unclaimed profiles) |
| name | text | |
| slug | text | unique |
| bio | text | |
| genre_tags | text[] | |
| avatar_url | text | |
| banner_url | text | |
| home_city | text | |
| home_state | text | |
| home_country | text | default 'US' |
| home_geohash | text | |
| trust_level | trust_level | default 'inferred' |
| primary_source | show_source | default 'admin_seed' |
| external_ids | jsonb | cross-source dedup e.g. {"songkick": "123"} |
| is_claimed | boolean | default false |
| is_verified | boolean | default false |
| profile_complete | boolean | default false |
| tier | text | default 'free' |
| follower_count | int | default 0 |
| monthly_listeners | int | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | soft delete |

---

## social_links
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| artist_id | uuid | FK → artist_profiles.id |
| platform | social_platform | |
| url | text | |
| handle | text | |
| display_order | int | default 0 |
| created_at | timestamptz | |

---

## venues
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | |
| slug | text | unique |
| address | text | |
| city | text | |
| state | text | |
| country | text | default 'US' |
| location | geography(point,4326) | PostGIS point for proximity queries |
| geohash | text | for search bucketing |
| capacity | int | |
| venue_type | text | |
| website | text | |
| is_claimed | boolean | default false |
| owner_user_id | uuid | FK → users.id |
| follower_count | int | default 0 |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | soft delete |

---

## shows
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| artist_id | uuid | FK → artist_profiles.id |
| venue_id | uuid | FK → venues.id |
| title | text | |
| description | text | |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| doors_at | timestamptz | |
| is_free | boolean | default true |
| cover_min | numeric(8,2) | |
| cover_max | numeric(8,2) | |
| ticket_url | text | |
| age_restriction | text | |
| source | show_source | required — where did this show come from |
| source_id | text | external ID for dedup |
| raw_payload | jsonb | original ingestion data, never lost |
| status | show_status | default 'published' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique constraint: `(source, source_id)`

---

## media
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| artist_id | uuid | FK → artist_profiles.id |
| show_id | uuid | FK → shows.id, nullable |
| type | media_type | |
| platform | text | |
| platform_id | text | |
| url | text | |
| thumbnail_url | text | |
| title | text | |
| description | text | |
| duration_seconds | int | |
| display_order | int | default 0 |
| created_at | timestamptz | |
| deleted_at | timestamptz | soft delete |

---

## follows
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id |
| artist_id | uuid | FK → artist_profiles.id, nullable |
| venue_id | uuid | FK → venues.id, nullable |
| created_at | timestamptz | |

---

## saves
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id |
| show_id | uuid | FK → shows.id |
| created_at | timestamptz | |

---

## checkins
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id |
| show_id | uuid | FK → shows.id |
| verified | boolean | default false |
| geohash | text | location at time of checkin |
| created_at | timestamptz | |

---

## ripples
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id |
| show_id | uuid | FK → shows.id, nullable |
| artist_id | uuid | FK → artist_profiles.id, nullable |
| body | text | |
| media_urls | text[] | |
| visibility | text | default 'public' |
| reaction_count | int | default 0, denormalized |
| comment_count | int | default 0, denormalized |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | soft delete |

---

## reactions
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id |
| target_type | text | 'ripple' or 'show' or 'checkin' |
| target_id | uuid | |
| type | text | 'fire', 'heart', 'wave' |
| created_at | timestamptz | |

---

## search_sessions
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| user_id | uuid | FK → users.id, nullable (anonymous) |
| geohash | text | search origin, not stored user location |
| radius_km | integer | default 25 |
| created_at | timestamptz | |
