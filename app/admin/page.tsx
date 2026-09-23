"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Member = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  membership_type: string;
  message: string | null;
  created_at: string;
};

type Event = {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState(0);

  const [search, setSearch] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin/login");
      return;
    }

    getMembers();
    getEvents();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  // ---------------- MEMBERS ----------------

  async function getMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("MEMBER ERROR:", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setMembers(data || []);
    setLoading(false);
  }

  async function deleteMember(id: number) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this member?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Unable to delete member.");
      return;
    }

    setMembers(
      members.filter((member) => member.id !== id)
    );

    alert("Member deleted successfully.");
  }

  // ---------------- EVENTS ----------------

  async function getEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("EVENT ERROR:", error);
      alert(error.message);
      setEventLoading(false);
      return;
    }

    setEvents(data || []);
    setEventLoading(false);
  }

  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingEventId !== null) {
      await updateEvent();
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        title: eventTitle,
        description: eventDescription || null,
        event_date: eventDate,
        event_time: eventTime || null,
        location: eventLocation,
      })
      .select()
      .single();

    if (error) {
      console.error("ADD EVENT ERROR:", error);
      alert("Unable to add event.");
      return;
    }

    setEvents([...events, data]);

    alert("Event added successfully! 📅");

    clearEventForm();
  }

  function editEvent(event: Event) {
    setEditingEventId(event.id);

    setEventTitle(event.title);
    setEventDescription(event.description || "");
    setEventDate(event.event_date);
    setEventTime(event.event_time || "");
    setEventLocation(event.location);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateEvent() {
  if (editingEventId === null) {
    return;
  }

  const { error } = await supabase
    .from("events")
    .update({
      title: eventTitle,
      description: eventDescription || null,
      event_date: eventDate,
      event_time: eventTime || null,
      location: eventLocation,
    })
    .eq("id", editingEventId);

  if (error) {
    console.error("UPDATE EVENT ERROR:", error);
    alert("Unable to update event: " + error.message);
    return;
  }

  alert("Event updated successfully! ✏️");

  clearEventForm();

  await getEvents();
}

  async function deleteEvent(id: number) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE EVENT ERROR:", error);
      alert("Unable to delete event.");
      return;
    }

    setEvents(
      events.filter((event) => event.id !== id)
    );

    alert("Event deleted successfully.");
  }

  function clearEventForm() {
    setEditingEventId(null);
    setEventTitle("");
    setEventDescription("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
  }

  // ---------------- PAGE ----------------

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>Admin Dashboard</h1>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          border: "none",
          borderRadius: "8px",
          background: "#e47700",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>

      {/* MEMBERS */}

      <h2 style={{ marginTop: "40px" }}>
        Registered Members: {members.length}
      </h2>

      <button
        onClick={getMembers}
        style={{
          marginTop: "15px",
          padding: "10px 18px",
          border: "none",
          borderRadius: "8px",
          background: "#e47700",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🔄 Refresh Members
      </button>

      <input
        type="text"
        placeholder="Search members..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "12px 15px",
          marginTop: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />

      {loading ? (
        <p>Loading members...</p>
      ) : members.length === 0 ? (
        <p>No members registered yet.</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            marginTop: "20px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                  Name
                </th>

                <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                  Phone
                </th>

                <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                  Email
                </th>

                <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                  City
                </th>

                <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                  Membership
                </th>

                <th style={{ border: "1px solid #ccc", padding: "10px" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {members
                .filter((member) =>
                  `${member.name} ${member.phone} ${member.email} ${member.city}`
                    .toLowerCase()
                    .includes(search.toLowerCase())
                )
                .map((member) => (
                  <tr key={member.id}>
                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {member.name}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {member.phone}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {member.email}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {member.city}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      {member.membership_type}
                    </td>

                    <td style={{ border: "1px solid #ccc", padding: "10px" }}>
                      <button
                        onClick={() => deleteMember(member.id)}
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          borderRadius: "6px",
                          background: "#d32f2f",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT EVENT */}

      <div
        style={{
          marginTop: "50px",
          padding: "30px",
          background: "#fff",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(80, 40, 0, 0.08)",
        }}
      >
        <h2>
          {editingEventId !== null
            ? "Edit Event ✏️"
            : "Add New Event 📅"}
        </h2>

        <form onSubmit={addEvent}>
          <div style={{ marginTop: "20px" }}>
            <label>Event Name</label>

            <input
              type="text"
              value={eventTitle}
              onChange={(e) =>
                setEventTitle(e.target.value)
              }
              placeholder="Example: Vinayaka Chavithi"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Description</label>

            <textarea
              value={eventDescription}
              onChange={(e) =>
                setEventDescription(e.target.value)
              }
              placeholder="Enter event details"
              rows={4}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Date</label>

            <input
              type="date"
              value={eventDate}
              onChange={(e) =>
                setEventDate(e.target.value)
              }
              required
              style={{
                display: "block",
                padding: "12px",
                marginTop: "8px",
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Time</label>

            <input
              type="time"
              value={eventTime}
              onChange={(e) =>
                setEventTime(e.target.value)
              }
              style={{
                display: "block",
                padding: "12px",
                marginTop: "8px",
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label>Location</label>

            <input
              type="text"
              value={eventLocation}
              onChange={(e) =>
                setEventLocation(e.target.value)
              }
              placeholder="Example: Community Hall"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "25px",
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#e47700",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {editingEventId !== null
              ? "Update Event ✏️"
              : "Add Event 📅"}
          </button>

          {editingEventId !== null && (
            <button
              type="button"
              onClick={clearEventForm}
              style={{
                marginTop: "25px",
                marginLeft: "10px",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#777",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* EVENT LIST */}

            {/* EVENTS MANAGEMENT */}

      <div style={{ marginTop: "50px" }}>
        <h2>Events Management 📅</h2>

        <p style={{ color: "#666", marginTop: "8px" }}>
          Manage all scheduled events from here.
        </p>

        <button
          onClick={getEvents}
          style={{
            marginTop: "15px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            background: "#e47700",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔄 Refresh Events
        </button>

        {eventLoading ? (
          <p style={{ marginTop: "20px" }}>Loading events...</p>
        ) : events.length === 0 ? (
          <p style={{ marginTop: "20px" }}>
            No events scheduled yet.
          </p>
        ) : (
          <div
            style={{
              overflowX: "auto",
              marginTop: "25px",
              background: "white",
              borderRadius: "15px",
              boxShadow: "0 10px 30px rgba(80, 40, 0, 0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "900px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#fff1dc",
                  }}
                >
                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Event Name
                  </th>

                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Description
                  </th>

                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Date
                  </th>

                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Time
                  </th>

                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Location
                  </th>

                  <th style={{ padding: "15px", textAlign: "left" }}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td
                      style={{
                        padding: "15px",
                        borderTop: "1px solid #eee",
                        fontWeight: "bold",
                        color: "#e47700",
                      }}
                    >
                      {event.title}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderTop: "1px solid #eee",
                        maxWidth: "250px",
                      }}
                    >
                      {event.description || "No description"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      📅 {event.event_date}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      {event.event_time
                        ? `🕐 ${event.event_time}`
                        : "Not specified"}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      📍 {event.location}
                    </td>

                    <td
                      style={{
                        padding: "15px",
                        borderTop: "1px solid #eee",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        onClick={() => editEvent(event)}
                        style={{
                          padding: "9px 14px",
                          border: "none",
                          borderRadius: "7px",
                          background: "#e47700",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginRight: "8px",
                        }}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => deleteEvent(event.id)}
                        style={{
                          padding: "9px 14px",
                          border: "none",
                          borderRadius: "7px",
                          background: "#d32f2f",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}