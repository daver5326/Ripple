import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM shows ORDER BY show_date DESC`;
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const { title, venue, show_date, description } = req.body;
    if (!title || !venue || !show_date) {
      return res.status(400).json({ error: 'title, venue, and show_date are required' });
    }
    try {
      const { rows } = await sql`
        INSERT INTO shows (title, venue, show_date, description)
        VALUES (${title}, ${venue}, ${show_date}, ${description})
        RETURNING *
      `;
      res.status(201).json(rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
