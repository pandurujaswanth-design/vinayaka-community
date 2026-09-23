"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    getEvents();
    getMemberCount();
  }, []);

  async function getEvents() {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("event_date", today)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("EVENT ERROR:", error);
      setLoadingEvents(false);
      return;
    }

    setEvents(data || []);
    setLoadingEvents(false);
  }

  async function getMemberCount() {
    const { count, error } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("MEMBER COUNT ERROR:", error);
      return;
    }

    setMemberCount(count || 0);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatMonth(date: string) {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
    });
  }

  function formatDay(date: string) {
    return new Date(date).getDate();
  }

  return (
    <main>

      {/* ================= NAVIGATION ================= */}

      <nav className="navbar">
        <div className="logo">
          🕉️ Sri Vinayaka
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#events">Events</a>
          <a href="#gallery">Gallery</a>
          <a href="#community">Community</a>
          <a href="/contact">Contact</a>
        </div>

        <a href="/donate" className="donate-button">
          Donate
        </a>
      </nav>


      {/* ================= HERO ================= */}

      <section id="home" className="hero">
        <div className="hero-overlay">
          <div className="hero-content">

            <p className="small-title">
              🙏 GANAPATHI BAPPA MORYA 🙏
            </p>

            <h1>
              Sri Vinayaka
              <br />
              <span>Community</span>
            </h1>

            <p className="hero-description">
              Together in devotion, tradition and community.
              <br />
              Let us celebrate the blessings of Lord Vinayaka.
            </p>

            <div className="hero-buttons">
              <a href="/join" className="primary-button">
                Join Our Community
              </a>

              <a href="#events" className="secondary-button">
                View Events
              </a>
            </div>

          </div>
        </div>
      </section>


      {/* ================= ABOUT ================= */}

      <section id="about" className="about">

        <div className="about-image">
          <img
            src="/vinayaka.jpg"
            alt="Lord Vinayaka"
          />
        </div>

        <div className="about-content">

          <p className="section-label">
            ABOUT OUR COMMUNITY
          </p>

          <h2>
            United by Faith,
            <br />
            <span>Connected by Tradition</span>
          </h2>

          <p>
            Sri Vinayaka Community is a place where devotion,
            culture and friendship come together. We celebrate
            Lord Vinayaka and bring families, friends and
            devotees together through meaningful celebrations.
          </p>

          <p>
            Our goal is to preserve our traditions, encourage
            community participation and create a joyful
            environment for everyone.
          </p>

          <div className="about-features">

            <div>
              <strong>🙏</strong>
              <h3>Devotion</h3>
              <p>Growing together in faith.</p>
            </div>

            <div>
              <strong>🌺</strong>
              <h3>Tradition</h3>
              <p>Keeping our culture alive.</p>
            </div>

            <div>
              <strong>🤝</strong>
              <h3>Unity</h3>
              <p>Everyone is part of our family.</p>
            </div>

          </div>

        </div>
      </section>


      {/* ================= EVENTS ================= */}

      <section id="events" className="events">

        <div className="events-heading">

          <p className="section-label">
            CELEBRATE WITH US
          </p>

          <h2>
            Upcoming <span>Events</span>
          </h2>

          <p>
            Join our community in celebrating devotion,
            tradition and togetherness.
          </p>

        </div>


        <div className="event-cards">

          {loadingEvents ? (

            <p>Loading events...</p>

          ) : events.length === 0 ? (

            <p>No upcoming events yet.</p>

          ) : (

            events.map((event) => (

              <div
                className="event-card"
                key={event.id}
              >

                <div className="event-date">

                  <strong>
                    {formatDay(event.event_date)}
                  </strong>

                  <span>
                    {formatMonth(event.event_date)}
                  </span>

                </div>


                <div className="event-icon">
                  🙏
                </div>


                <h3>
                  {event.title}
                </h3>


                <p>
                  {event.description ||
                    "Join us for this special community event."}
                </p>


                <div className="event-info">
                  📅 {formatDate(event.event_date)}
                </div>


                {event.event_time && (
                  <div className="event-info">
                    🕐 {event.event_time}
                  </div>
                )}


                <div className="event-info">
                  📍 {event.location}
                </div>


                <button
                  onClick={() => setSelectedEvent(event)}
                >
                  View Details →
                </button>

              </div>

            ))

          )}

        </div>

      </section>


      {/* ================= EVENT DETAILS POPUP ================= */}

      {selectedEvent && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setSelectedEvent(null)}
        >

          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "550px",
              padding: "30px",
              borderRadius: "18px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
              }}
            >

              <h2
                style={{
                  color: "#e47700",
                  margin: 0,
                }}
              >
                {selectedEvent.title}
              </h2>

              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>

            </div>


            <p
              style={{
                marginTop: "20px",
                lineHeight: "1.7",
              }}
            >
              {selectedEvent.description ||
                "No description available."}
            </p>


            <div
              style={{
                marginTop: "20px",
                lineHeight: "2",
              }}
            >

              <p>
                📅 <strong>Date:</strong>{" "}
                {formatDate(selectedEvent.event_date)}
              </p>

              {selectedEvent.event_time && (
                <p>
                  🕐 <strong>Time:</strong>{" "}
                  {selectedEvent.event_time}
                </p>
              )}

              <p>
                📍 <strong>Location:</strong>{" "}
                {selectedEvent.location}
              </p>

            </div>


            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                marginTop: "20px",
                padding: "12px 22px",
                border: "none",
                borderRadius: "8px",
                background: "#e47700",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* ================= GALLERY ================= */}

      <section id="gallery" className="gallery">

        <div className="gallery-heading">

          <p className="section-label">
            OUR MEMORIES
          </p>

          <h2>
            Moments of <span>Devotion</span>
          </h2>

          <p>
            Beautiful memories from our Vinayaka
            celebrations and community gatherings.
          </p>

        </div>


        <div className="gallery-grid">

          <div className="gallery-item gallery-large">

            <img
              src="/vinayaka.jpg"
              alt="Lord Vinayaka"
            />

            <div className="gallery-overlay">

              <h3>
                Lord Vinayaka
              </h3>

              <p>
                🙏 Our beloved Vinayaka
              </p>

            </div>

          </div>


          <div className="gallery-item">

            <video
              src="/vinayaka.mp4"
              controls
              muted
              playsInline
            />

            <div className="gallery-overlay">

              <h3>
                Vinayaka Celebration
              </h3>

              <p>
                🎥 Community memories
              </p>

            </div>

          </div>


          <div className="gallery-item">

            <img
              src="/vinayaka.jpg"
              alt="Vinayaka celebration"
            />

            <div className="gallery-overlay">

              <h3>
                Festival Celebration
              </h3>

              <p>
                🌺 Together in devotion
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= COMMUNITY ================= */}

      <section id="community" className="community">

        <div className="community-content">

          <p className="section-label">
            OUR FAMILY
          </p>

          <h2>
            One Community.
            <br />
            <span>One Family.</span>
          </h2>

          <p>
            Our Vinayaka community brings devotees,
            families and friends together to celebrate
            our traditions, participate in events and
            serve society.
          </p>


          <div className="community-stats">

            <div>
              <strong>
                {memberCount}+
              </strong>
              <span>
                Members
              </span>
            </div>


            <div>
              <strong>
                {events.length}+
              </strong>
              <span>
                Events
              </span>
            </div>


            <div>
              <strong>
                5+
              </strong>
              <span>
                Years
              </span>
            </div>

          </div>


          <a
            href="/join"
            className="primary-button"
          >
            Join Community
          </a>

        </div>

      </section>


      {/* ================= CONTACT ================= */}

      <section id="contact" className="contact">

        <p className="section-label">
          GET IN TOUCH
        </p>

        <h2>
          Contact Us
        </h2>

        <p>
          Have questions or want to volunteer?
          <br />
          We would love to hear from you.
        </p>

        <a
          href="/contact"
          className="primary-button"
        >
          Contact Community
        </a>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <h3>
          🕉️ Sri Vinayaka Community
        </h3>

        <p>
          Ganapathi Bappa Morya 🙏
        </p>

        <p className="copyright">
          © 2026 Sri Vinayaka Community.
          All rights reserved.
        </p>

      </footer>

    </main>
  );
}