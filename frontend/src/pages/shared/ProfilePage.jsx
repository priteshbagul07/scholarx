import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks";
import { Toast } from "../../components/common";
import api from "../../services/api";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast, showToast, clearToast } = useToast();

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", profileForm.name);
      fd.append("bio", profileForm.bio);
      if (avatarFile) fd.append("avatar", avatarFile);
      const { data } = await api.put("/api/users/profile", fd);
      updateUser(data);
      showToast("Profile updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/api/users/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      <h1 className="page-header mb-8">Your Profile</h1>

      {/* Profile info */}
      <div className="card p-6 mb-5">
        <h2 className="font-display font-semibold text-slate-800 mb-5">Personal Information</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="preview" className="w-full h-full object-cover" />
              ) : user?.avatar ? (
                <img src={`${import.meta.env.VITE_API_URL || "http://localhost:5050"}${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
              ) : initials}
            </div>
            <div>
              <label className="btn-secondary text-sm cursor-pointer">
                Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files[0])} />
              </label>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input className="input" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input bg-slate-50 capitalize" value={user?.role} disabled />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none" rows={3} value={profileForm.bio} onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell others a bit about yourself…" />
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2">
            {profileLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-slate-800 mb-5">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} required />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
            {pwLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}
