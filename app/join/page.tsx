"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JoinPage() {
 async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const form = event.currentTarget;

  const formData = new FormData(form);

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const city = formData.get("city") as string;
  const membershipType =
    formData.get("membershipType") as string;
  const message = formData.get("message") as string;

  const { error } = await supabase
    .from("members")
    .insert({
      name,
      phone,
      email,
      city,
      membership_type: membershipType,
      message,
    });

  if (error) {
    console.error(error);

    alert("Something went wrong. Please try again.");

    return;
  }

  alert(
    "Thank you for joining Sri Vinayaka Community! 🙏"
  );

  form.reset();
}

  return (
    <main className="join-page">
      <div className="join-container">

        <div className="join-header">
          <a href="/" className="back-home">
            ← Back to Home
          </a>

          <p className="section-label">
            JOIN OUR FAMILY
          </p>

          <h1>
            Become a Part of Our
            <br />
            <span>Vinayaka Community</span>
          </h1>

          <p>
            Join us in celebrating devotion, tradition,
            friendship and community.
          </p>
        </div>

        <form
          className="join-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Full Name</label>

            <input
                type="text"
                name="name"
                placeholder="Enter your name"
                required
                />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                required
                />
            </div>

            <div className="form-group">
              <label>Email</label>

             <input
                type="email"
                name="email"
                placeholder="Enter email address"
                required
                />
            </div>
          </div>

          <div className="form-group">
            <label>City</label>

            <input
                type="text"
                name="city"
                placeholder="Enter your city"
                required
                />
          </div>

          <div className="form-group">
            <label>I want to join as</label>

            <select name="membershipType" required>
              <option value="">
                Select an option
              </option>

              <option value="member">
                Community Member
              </option>

              <option value="volunteer">
                Volunteer
              </option>

              <option value="organizer">
                Event Organizer
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Message</label>

            <textarea
                name="message"
                placeholder="Tell us something about yourself..."
                rows={5}
                />
          </div>

          <button
            type="submit"
            className="join-submit"
          >
            Join Community 🙏
          </button>
        </form>

      </div>
    </main>
  );
}