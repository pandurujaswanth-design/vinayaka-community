export default function DonatePage() {
  return (
    <main className="donate-page">

      <div className="donate-container">

        <a href="/" className="back-home">
          ← Back to Home
        </a>

        <p className="section-label">
          SUPPORT OUR COMMUNITY
        </p>

        <h1>
          Support Our
          <br />
          <span>Vinayaka Community</span>
        </h1>

        <p className="donate-intro">
          Your contribution helps us organize celebrations,
          pooja, cultural programs, Annadanam and community
          activities.
        </p>

        <div className="donate-card">

          <div className="donate-icon">
            🙏
          </div>

          <h2>Donate with PhonePe</h2>

          <p>
            Scan the QR code using the PhonePe app
            to make your contribution.
          </p>

          <div className="qr-box">
            <img
              src="/phonepe-qr.png"
              alt="PhonePe donation QR code"
            />
          </div>

          <p className="scan-text">
            📱 Scan & Pay
          </p>

          <p className="thank-you">
            Every contribution helps us serve our
            community and celebrate together. ❤️
          </p>

        </div>

      </div>

    </main>
  );
}