"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CommunityMember = {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  display_order: number;
};

export default function AdminMembers() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [photo, setPhoto] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [oldPhotoUrl, setOldPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      window.location.href = "/admin/login";
      return;
    }

    getMembers();
  }

  async function getMembers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("community_members")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("COMMUNITY MEMBERS ERROR:", error);
      alert("Unable to load community members.");
      setLoading(false);
      return;
    }

    setMembers(data || []);
    setLoading(false);
  }

  function resetForm() {
    setName("");
    setPosition("");
    setDisplayOrder("0");
    setPhoto(null);
    setEditingId(null);
    setOldPhotoUrl(null);

    const input = document.getElementById(
      "member-photo"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function uploadPhoto(file: File) {
    const extension = file.name.split(".").pop() || "jpg";

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const filePath = fileName;

    const { error } = await supabase.storage
      .from("member-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("PHOTO UPLOAD ERROR:", error);
      throw new Error("Photo upload failed.");
    }

    const { data } = supabase.storage
      .from("member-photos")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function deleteOldPhoto(url: string | null) {
    if (!url) return;

    try {
      const marker = "/storage/v1/object/public/member-photos/";

      if (!url.includes(marker)) return;

      const filePath = url.split(marker)[1];

      if (!filePath) return;

      await supabase.storage
        .from("member-photos")
        .remove([filePath]);
    } catch (error) {
      console.error("OLD PHOTO DELETE ERROR:", error);
    }
  }

  async function saveMember(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !position.trim()) {
      alert("Please enter member name and position.");
      return;
    }

    try {
      let photoUrl = oldPhotoUrl;

      if (photo) {
        photoUrl = await uploadPhoto(photo);

        if (oldPhotoUrl) {
          await deleteOldPhoto(oldPhotoUrl);
        }
      }

      if (editingId) {
        const { error } = await supabase
          .from("community_members")
          .update({
            name: name.trim(),
            position: position.trim(),
            photo_url: photoUrl,
            display_order: Number(displayOrder) || 0,
          })
          .eq("id", editingId);

        if (error) {
          console.error("UPDATE MEMBER ERROR:", error);
          alert("Unable to update member.");
          return;
        }

        alert("Member updated successfully.");
      } else {
        const { error } = await supabase
          .from("community_members")
          .insert({
            name: name.trim(),
            position: position.trim(),
            photo_url: photoUrl,
            display_order: Number(displayOrder) || 0,
          });

        if (error) {
          console.error("ADD MEMBER ERROR:", error);
          alert("Unable to add member.");
          return;
        }

        alert("Member added successfully.");
      }

      resetForm();
      getMembers();
    } catch (error) {
      console.error("SAVE MEMBER ERROR:", error);
      alert("Something went wrong.");
    }
  }

  function editMember(member: CommunityMember) {
    setEditingId(member.id);
    setName(member.name);
    setPosition(member.position);
    setDisplayOrder(String(member.display_order || 0));
    setOldPhotoUrl(member.photo_url);
    setPhoto(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteMember(member: CommunityMember) {
    const confirmed = confirm(
      `Delete ${member.name} from community members?`
    );

    if (!confirmed) return;

    if (member.photo_url) {
      await deleteOldPhoto(member.photo_url);
    }

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("id", member.id);

    if (error) {
      console.error("DELETE MEMBER ERROR:", error);
      alert("Unable to delete member.");
      return;
    }

    getMembers();
  }

  return (
    <main className="admin-page">

      <aside className="admin-sidebar">
        <div className="admin-logo">
          🕉️ Sri Vinayaka
        </div>

        <nav>
          <a href="/admin">
            Dashboard
          </a>

          <a
            href="/admin/members"
            className="active"
          >
            👥 Members
          </a>

          <a href="/admin#events">
            📅 Events
          </a>

          <a href="/">
            🌐 View Website
          </a>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/admin/login";
            }}
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              border: "none",
              borderRadius: "10px",
              background: "#e47700",
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </aside>


      <section className="admin-content">

        <div className="admin-top">

          <p className="section-label">
            COMMUNITY MANAGEMENT
          </p>

          <h1>
            Community Members
          </h1>

          <p>
            Add the members you want to display
            publicly on the Sri Vinayaka website.
          </p>

        </div>


        {/* FORM */}

        <div
          className="admin-welcome"
          style={{ marginTop: "30px" }}
        >

          <h2>
            {editingId
              ? "Edit Member"
              : "Add Community Member"}
          </h2>

          <form onSubmit={saveMember}>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "20px",
                marginTop: "25px",
              }}
            >

              <div className="form-group">

                <label>
                  Member Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter member name"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Position
                </label>

                <input
                  type="text"
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value)
                  }
                  placeholder="President / Secretary / Treasurer"
                  required
                />

              </div>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "20px",
              }}
            >

              <div className="form-group">

                <label>
                  Member Photo
                </label>

                <input
                  id="member-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPhoto(
                      e.target.files?.[0] || null
                    )
                  }
                />

                {oldPhotoUrl && !photo && (
                  <img
                    src={oldPhotoUrl}
                    alt={name}
                    style={{
                      width: "90px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginTop: "12px",
                    }}
                  />
                )}

              </div>


              <div className="form-group">

                <label>
                  Display Order
                </label>

                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(e.target.value)
                  }
                  min="0"
                />

                <small
                  style={{
                    color: "#75675c",
                    marginTop: "6px",
                  }}
                >
                  Lower numbers appear first.
                </small>

              </div>

            </div>


            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="submit"
                className="login-button"
                style={{
                  width: "auto",
                  padding: "13px 25px",
                }}
              >
                {editingId
                  ? "Update Member"
                  : "Add Member"}
              </button>


              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "13px 25px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>

        </div>


        {/* MEMBERS */}

        <div
          style={{
            marginTop: "40px",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >

            <h2>
              Published Members
            </h2>

            <button
              onClick={getMembers}
              style={{
                padding: "10px 18px",
                border: "none",
                borderRadius: "10px",
                background: "#fff0d9",
                color: "#e47700",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              🔄 Refresh
            </button>

          </div>


          {loading ? (

            <p>
              Loading members...
            </p>

          ) : members.length === 0 ? (

            <div className="admin-welcome">

              <h2>
                No community members yet
              </h2>

              <p>
                Add your first community member
                using the form above.
              </p>

            </div>

          ) : (

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "22px",
              }}
            >

              {members.map((member) => (

                <div
                  key={member.id}
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "25px",
                    textAlign: "center",
                    boxShadow:
                      "0 10px 30px rgba(80,40,0,0.08)",
                  }}
                >

                  {member.photo_url ? (

                    <img
                      src={member.photo_url}
                      alt={member.name}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border:
                          "4px solid #fff0d9",
                        marginBottom: "15px",
                      }}
                    />

                  ) : (

                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        margin: "0 auto 15px",
                        borderRadius: "50%",
                        background: "#fff0d9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "45px",
                      }}
                    >
                      👤
                    </div>

                  )}


                  <h3>
                    {member.name}
                  </h3>

                  <p
                    style={{
                      color: "#e47700",
                      fontWeight: "bold",
                      marginTop: "6px",
                    }}
                  >
                    {member.position}
                  </p>


                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                      marginTop: "18px",
                    }}
                  >

                    <button
                      onClick={() =>
                        editMember(member)
                      }
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#fff0d9",
                        color: "#e47700",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteMember(member)
                      }
                      style={{
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "8px",
                        background: "#ffe5e5",
                        color: "#c62828",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}