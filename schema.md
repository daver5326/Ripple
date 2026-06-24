# Ripple Database Schema
**Supabase instance:** nbpdhyskdgeetafmcgzo.supabase.co

---

## artists
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | |
| bio | text | |
| photo_url | text | |
| genre | text | |
| location | text | |
| instagram | text | |
| website | text | |
| created_at | timestamptz | |

## venues
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| name | text | |
| address | text | |
| city | text | |
| state | text | |
| latitude | float8 | |
| longitude | float8 | |
| created_at | timestamptz | |

## shows
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| artist_id | uuid | foreign key → artists.id |
| venue_id | uuid | foreign key → venues.id |
| show_date | timestamptz | |
| cover_charge | numeric | |
| notes | text | |
| created_at | timestamptz | |
