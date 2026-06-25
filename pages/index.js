import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Ripple — Little Rock Live Music</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="See what's happening in Little Rock tonight." />
      </Head>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #0d1117;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          min-height: 100vh;
          overflow: hidden;
        }
        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 28px;
          text-align: center;
          position: relative;
        }
        .glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(63,182,138,0.15) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -60%);
          pointer-events: none;
        }
        .logo {
          font-size: 13px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #3fb68a;
          font-weight: 600;
          margin-bottom: 32px;
        }
        .headline {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          max-width: 320px;
        }
        .headline em {
          font-style: normal;
          color: #3fb68a;
        }
        .subhead {
          font-size: 16px;
          color: #8b949e;
          line-height: 1.5;
          margin-bottom: 48px;
          max-width: 280px;
        }
        .btn-primary {
          display: block;
          width: 100%;
          max-width: 320px;
          padding: 18px 24px;
          background: #3fb68a;
          color: #000;
          font-size: 17px;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          margin-bottom: 14px;
          transition: opacity 0.15s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
          text-decoration: none;
        }
        .btn-primary:active { transform: scale(0.97); opacity: 0.9; }
        .btn-secondary {
          display: block;
          font-size: 14px;
          color: #8b949e;
          text-decoration: none;
          padding: 10px;
          margin-top: 4px;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-secondary:active { opacity: 0.6; }
        .footer {
          position: absolute;
          bottom: 28px;
          font-size: 12px;
          color: #30363d;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="page">
        <div className="glow" />
        <div className="logo">Ripple</div>
        <h1 className="headline">
          See what's happening in <em>Little Rock</em> tonight.
        </h1>
        <p className="subhead">
          Live music, on a map, right now.
        </p>
        <a href="/map" className="btn-primary">
          See tonight's scene →
        </a>
        <a href="/join" className="btn-secondary">
          Are you an artist? Get on the map →
        </a>
        <div className="footer">LITTLE ROCK · AR</div>
      </div>
    </>
  );
}
