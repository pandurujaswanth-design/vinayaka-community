"use client";

import { FormEvent } from "react";

export default function ContactPage() {

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    alert("Thank you for contacting Sri Vinayaka Community! 🙏");

    event.currentTarget.reset();
  }

  return (
    <main className="contact-page">

      <div className="contact-container">

        <a href="/" className="back-home">
          ← Back to Home
        </a>

        <div className="contact-heading">

          <p className="section-label">
            GET IN TOUCH
          </p>

          <h1>
            Contact <span>Our Community</span>
          </h1>

          <p>
            Have a question, want to volunteer, or want to
            know more about our celebrations? Get in touch
            with us.
          </p>

        </div>


        <div className="contact-layout">

          {/* Contact Information */}

          <div className="contact-info">

            <h2>Let's Connect 🙏</h2>

            <p>
              We would be happy to hear from you.
            </p>


            <div className="contact-item">

              <div className="contact-icon">
                📍
              </div>

              <div>
                <h3>Location</h3>

                <p>
                  Sri Vinayaka Community Hall
                  <br />
                  Your Community Address
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                📞
              </div>

              <div>
                <h3>Phone</h3>

                <p>
                  +91 XXXXX XXXXX
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                📧
              </div>

              <div>
                <h3>Email</h3>

                <p>
                  vinayakacommunity@example.com
                </p>
              </div>

            </div>


            <div className="contact-item">

              <div className="contact-icon">
                🕐
              </div>

              <div>
                <h3>Community Hours</h3>

                <p>
                  Every day
                  <br />
                  9:00 AM – 8:00 PM
                </p>
              </div>

            </div>

          </div>


          {/* Contact Form */}

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <h2>Send Us a Message</h2>

            <div className="form-group">

              <label>
                Your Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Phone Number
              </label>

              <input
                type="tel"
                placeholder="Enter phone number"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                required
              />

            </div>


            <div className="form-group">

              <label>
                Message
              </label>

              <textarea
                rows={6}
                placeholder="Write your message..."
                required
              />

            </div>


            <button
              type="submit"
              className="contact-submit"
            >
              Send Message 🙏
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}