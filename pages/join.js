import { useState } from 'react';
import Head from 'next/head';

const GENRES = [
  'Folk', 'Americana', 'Roots', 'Blues', 'Gospel', 'Soul / R&B',
  'Country', 'Old-time / Bluegrass', 'Singer-Songwriter',
  'Latin', 'Hip-Hop', 'Rock', 'Indie', 'Jazz', 'World', 'Kids / Family',
];

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    artistName: '', city: '', genres: [], genreCustom: '',
    spotify: '', instagram: '', appleMusic: '', website: '', youtube: '',
    email: '', phone: '', bio: '',
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleGenre = (g) => {
    setForm(f => ({
      ...f,
      genres: f.genres.includes(g)
        ? f.genres.filter(x => x !== g)
        : [...f.genres, g],
    }));
  };

  const progress = submitted ? 100 : (step / 4) * 100;

  const goNext = () => {
    if (step === 1 && !form.artistName.trim()) return;
    if (step === 4) { handleSubmit(); return; }
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/artists/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Ripple — Get on the Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0d1117; --surface: #161b22; --border: #30363d;
          --accent: #3fb68a; --text: #e6edf3; --muted: #8b949e;
          --error: #f85149; --radius: 12px;
        }
        body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; padding-bottom: 60px; }
        .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 20px 20px 16px; text-align: center; }
        .logo { font-size: 13px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); font-weight: 600; margin-bottom: 8px; }
        .header h1 { font-size: 22px; font-weight: 700; }
        .header p { color: var(--muted); font-size: 14px; margin-top: 6px; line-height: 1.5; }
        .progress-bar { height: 3px; background: var(--border); }
        .progress-fill { height: 100%; background: var(--accent); transition: width 0.3s ease; }
        .body { padding: 24px 20px; }
        .step-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); font-weight: 600; margin-bottom: 6px; }
        h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
        .sub { color: var(--muted); font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        .field { margin-bottom: 18px; }
        label { display: block; font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 6px; }
        input, textarea { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); font-size: 16px; font-family: inherit; padding: 14px 16px; outline: none; transition: border-color 0.15s; -webkit-appearance: none; }
        input:focus, textarea:focus { border-color: var(--accent); }
        input::placeholder, textarea::placeholder { color: var(--muted); }
        textarea { resize: vertical; min-height: 90px; }
        .opt { font-weight: 400; color: var(--border); font-size: 11px; margin-left: 4px; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .chip { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 8px 14px; font-size: 14px; color: var(--muted); cursor: pointer; transition: all 0.15s; user-select: none; -webkit-tap-highlight-color: transparent; }
        .chip.on { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 600; }
        .social-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .social-icon { width: 40px; height: 40px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .social-row input { margin-bottom: 0; }
        .btn-row { display: flex; gap: 10px; margin-top: 28px; }
        .btn { flex: 1; padding: 16px; border-radius: var(--radius); font-size: 16px; font-weight: 600; border: none; cursor: pointer; transition: opacity 0.15s, transform 0.1s; -webkit-tap-highlight-color: transparent; }
        .btn:active { transform: scale(0.97); }
        .btn-primary { background: var(--accent); color: #000; }
        .btn-primary:disabled { opacity: 0.4; cursor: default; }
        .btn-secondary { background: var(--surface); border: 1px solid var(--border); color: var(--muted); flex: 0 0 auto; padding: 16px 20px; }
        .error-msg { color: var(--error); font-size: 13px; margin-top: 8px; }
        .success { text-align: center; padding: 48px 20px; }
        .success-icon { width: 80px; height: 80px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 24px; }
        .success h2 { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
        .success p { color: var(--muted); font-size: 15px; line-height: 1.6; margin-bottom: 6px; }
        .highlight { color: var(--accent); font-weight: 700; }
      `}</style>

      <div className="header">
        <div className="logo">Ripple</div>
        <h1>Get on the map</h1>
        <p>Takes about 60 seconds. Your shows appear on the Little Rock scene map.</p>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="body">

        {submitted && (
          <div className="success">
            <div className="success-icon">🎵</div>
            <h2>You&apos;re on the map.</h2>
            <p>Thanks, <span className="highlight">{form.artistName}</span>.</p>
            <p style={{ marginTop: 12 }}>
              We&apos;ll be in touch at <span className="highlight">{form.email}</span> to confirm your listing.
            </p>
            <p style={{ marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>ripple-wine.vercel.app</p>
          </div>
        )}

        {!submitted && step === 1 && (
          <>
            <div className="step-label">Step 1 of 4</div>
            <h2>Who are you?</h2>
            <p className="sub">Your name as it appears on show listings.</p>
            <div className="field">
              <label>Artist or band name</label>
              <input type="text" value={form.artistName} onChange={e => set('artistName', e.target.value)} placeholder="e.g. Patty & the Cakes" autoComplete="off" />
            </div>
            <div className="field">
              <label>Your city <span className="opt">optional</span></label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Little Rock, AR" autoComplete="off" />
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={goNext} disabled={!form.artistName.trim()}>Next →</button>
            </div>
          </>
        )}

        {!submitted && step === 2 && (
          <>
            <div className="step-label">Step 2 of 4</div>
            <h2>What&apos;s your sound?</h2>
            <p className="sub">Pick everything that fits.</p>
            <div className="chips">
              {GENRES.map(g => (
                <div key={g} className={`chip${form.genres.includes(g) ? ' on' : ''}`} onClick={() => toggleGenre(g)}>{g}</div>
              ))}
            </div>
            <div className="field" style={{ marginTop: 18 }}>
              <label>Or describe it yourself <span className="opt">optional</span></label>
              <input type="text" value={form.genreCustom} onChange={e => set('genreCustom', e.target.value)} placeholder="e.g. Feel Good Soul / Modern Americana" />
            </div>
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={goBack}>←</button>
              <button className="btn btn-primary" onClick={goNext}>Next →</button>
            </div>
          </>
        )}

        {!submitted && step === 3 && (
          <>
            <div className="step-label">Step 3 of 4</div>
            <h2>Where can people find you?</h2>
            <p className="sub">All optional — add whatever you have.</p>
            <div className="social-row">
              <div className="social-icon">𝕊</div>
              <input type="url" value={form.spotify} onChange={e => set('spotify', e.target.value)} placeholder="Spotify link" inputMode="url" />
            </div>
            <div className="social-row">
              <div className="social-icon">📸</div>
              <input type="text" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="Instagram  @yourband" />
            </div>
            <div className="social-row">
              <div className="social-icon">🎵</div>
              <input type="url" value={form.appleMusic} onChange={e => set('appleMusic', e.target.value)} placeholder="Apple Music link" inputMode="url" />
            </div>
            <div className="social-row">
              <div className="social-icon">🌐</div>
              <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="yourwebsite.com" inputMode="url" />
            </div>
            <div className="social-row">
              <div className="social-icon">▶</div>
              <input type="url" value={form.youtube} onChange={e => set('youtube', e.target.value)} placeholder="YouTube channel" inputMode="url" />
            </div>
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={goBack}>←</button>
              <button className="btn btn-primary" onClick={goNext}>Next →</button>
            </div>
          </>
        )}

        {!submitted && step === 4 && (
          <>
            <div className="step-label">Step 4 of 4</div>
            <h2>How do we reach you?</h2>
            <p className="sub">So we can confirm your listing and send updates.</p>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => { set('email', e.target.value); setError(null); }} placeholder="you@example.com" inputMode="email" autoComplete="email" />
            </div>
            <div className="field">
              <label>Phone <span className="opt">optional</span></label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(501) 555-0000" inputMode="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label>Anything else? <span className="opt">optional</span></label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="A sentence about your music, upcoming shows, or a note for us…" />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={goBack}>←</button>
              <button className="btn btn-primary" onClick={goNext} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit ✓'}
              </button>
            </div>
          </>
        )}

      </div>
    </>
  );
}
