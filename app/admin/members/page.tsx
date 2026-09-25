"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CommunityMember = {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  display_order: number;
};

export default function AdminMembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [photo, setPhoto] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [oldPhotoUrl, setOldPhotoUrl] = useState<string | null>(null);

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

    const fileInput = document.getElementById(
      "member-photo"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
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

  async function uploadPhoto(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

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

  async function deletePhoto(photoUrl: string | null) {
    if (!photoUrl) return;

    try {
      const marker = "/storage/v1/object/public/member-photos/";

      if (!photoUrl.includes(marker)) {
        return;
      }

      const filePath = photoUrl.split(marker)[1];

      if (!filePath) return;

      const { error } = await supabase.storage
        .from("member-photos")
        .remove([filePath]);

      if (error) {
        console.error("PHOTO DELETE ERROR:", error);
      }
    } catch (error) {
      console.error("PHOTO DELETE ERROR:", error);
    }
  }

  async function saveMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter member name.");
      return;
    }

    if (!position.trim()) {
      alert("Please enter member position.");
      return;
    }

    setSaving(true);

    try {
      let photoUrl = oldPhotoUrl;

      if (photo) {
        photoUrl = await uploadPhoto(photo);

        if (editingId && oldPhotoUrl) {
          await deletePhoto(oldPhotoUrl);
        }
      }

      const memberData = {
        name: name.trim(),
        position: position.trim(),
        photo_url: photoUrl,
        display_order: Number(displayOrder) || 0,
      };

      if (editingId) {
        const { error } = await supabase
          .from("community_members")
          .update(memberData)
          .eq("id", editingId);

        if (error) {
          console.error("UPDATE MEMBER ERROR:", error);
          alert("Unable to update member.");
          setSaving(false);
          return;
        }

        alert("Member updated successfully.");
      } else {
        const { error } = await supabase
          .from("community_members")
          .insert([memberData]);

        if (error) {
          console.error("ADD MEMBER ERROR:", error);
          alert("Unable to add member.");
          setSaving(false);
          return;
        }

        alert("Member added successfully.");
      }

      resetForm();
      await getMembers();
    } catch (error) {
      console.error("SAVE MEMBER ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }

    setSaving(false);
  }

  async function deleteMember(member: CommunityMember) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}?`
    );

    if (!confirmed) {
      return;
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

    if (member.photo_url) {
      await deletePhoto(member.photo_url);
    }

    alert("Member deleted successfully.");

    await getMembers();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="admin-page">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">🕉️</div>

          <div>
            <h2>Vinayaka</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          <a href="/admin">📊 Dashboard</a>

          <a
            href="/admin/members"
            className="admin-nav-active"
          >
            👥 Community Members
          </a>

          <a href="/admin/events">📅 Events</a>

          <a href="/" target="_blank">
            🌐 View Website
          </a>
        </nav>

        <button
          className="admin-logout"
          onClick={logout}
        >
          🚪 Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <div className="admin-top">
          <div>
            <p className="admin-page-label">
              COMMUNITY MANAGEMENT
            </p>

            <h1>Community Members</h1>

            <p className="admin-page-description">
              Add the people who help manage and serve the
              Vinayaka community.
            </p>
          </div>

          <button
            className="admin-refresh-button"
            onClick={getMembers}
          >
            🔄 Refresh
          </button>
        </div>

        {/* ADD / EDIT FORM */}
        <section className="admin-card member-form-card">
          <div className="admin-card-heading">
            <div>
              <h2>
                {editingId
                  ? "✏️ Edit Member"
                  : "➕ Add Community Member"}
              </h2>

              <p>
                Add member photo, name and position.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={saveMember}
            className="member-form"
          >
            <div className="member-form-grid">
              <div className="form-group">
                <label htmlFor="member-name">
                  Member Name
                </label>

                <input
                  id="member-name"
                  type="text"
                  placeholder="Enter member name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="member-position">
                  Position
                </label>

                <input
                  id="member-position"
                  type="text"
                  placeholder="Example: President"
                  value={position}
                  onChange={(e) =>
                    setPosition(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="member-order">
                  Display Order
                </label>

                <input
                  id="member-order"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={displayOrder}
                  onChange={(e) =>
                    setDisplayOrder(e.target.value)
                  }
                />

                <small>
                  Lower number appears first.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="member-photo">
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

                <small>
                  Use JPG, PNG or WEBP image.
                </small>
              </div>
            </div>

            {editingId && oldPhotoUrl && !photo && (
              <div className="current-photo">
                <p>Current Photo</p>

                <img
                  src={oldPhotoUrl}
                  alt={name}
                />
              </div>
            )}

            {photo && (
              <div className="selected-photo">
                <p>Selected Photo</p>

                <img
                  src={URL.createObjectURL(photo)}
                  alt="Selected member"
                />
              </div>
            )}

            <div className="member-form-actions">
              <button
                type="submit"
                className="save-member-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "💾 Update Member"
                  : "➕ Add Member"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-member-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* MEMBERS LIST */}
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2>👥 Community Members</h2>

              <p>
                {members.length} member
                {members.length !== 1 ? "s" : ""}{" "}
                currently displayed on the website.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="member-empty">
              <div className="member-loading">
                Loading members...
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="member-empty">
              <div className="member-empty-icon">
                👥
              </div>

              <h3>No Community Members Yet</h3>

              <p>
                Add your first community member using
                the form above.
              </p>
            </div>
          ) : (
            <div className="admin-members-grid">
              {members.map((member) => (
                <div
                  className="admin-member-card"
                  key={member.id}
                >
                  <div className="admin-member-photo">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                      />
                    ) : (
                      <div className="admin-member-placeholder">
                        👤
                      </div>
                    )}
                  </div>

                  <div className="admin-member-info">
                    <span className="member-order">
                      #{member.display_order}
                    </span>

                    <h3>{member.name}</h3>

                    <p>{member.position}</p>
                  </div>

                  <div className="admin-member-actions">
                    <button
                      className="edit-member-button"
                      onClick={() =>
                        editMember(member)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="delete-member-button"
                      onClick={() =>
                        deleteMember(member)
                      }
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}