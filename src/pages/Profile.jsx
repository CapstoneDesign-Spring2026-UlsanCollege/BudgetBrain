import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserIcon, KeyIcon, EnvelopeIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import api from '../api';

const AVATARS = ['🎯', '🌟', '💎', '🚀', '🔥', '💪', '🎨', '🌈', '🦁', '🐉', '🦅', '⭐'];

export async function profileLoader() {
  try {
    const res = await api.get('/auth/me');
    return { user: res.data };
  } catch {
    return { user: null };
  }
}

const Profile = () => {
  const { user } = useLoaderData();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(localStorage.getItem('budgetbrain-avatar') || '🎯');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(name);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/me', { name });
      localStorage.setItem('userName', JSON.stringify(name));
      toast.success('Profile updated!');
      setIsEditingName(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarSelect = async (emoji) => {
    setAvatar(emoji);
    localStorage.setItem('budgetbrain-avatar', emoji);
    try {
      await api.put('/auth/me', { avatar: emoji });
    } catch {
      /* avatar saved locally even if server sync fails */
    }
    setShowAvatarPicker(false);
    toast.success('Avatar updated!');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to change password');
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="grid-lg" style={{ width: '100%', maxWidth: '800px' }}>
      <h1>Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-large">{avatar}</div>
          <button className="avatar-edit-btn" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <PencilIcon width={14} />
          </button>
        </div>
        <div className="profile-info">
          {isEditingName ? (
            <div className="profile-name-edit">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="profile-name-input"
                autoFocus
              />
              <button className="btn-icon" onClick={() => { setName(editName); handleUpdateProfile({ preventDefault: () => {} }); }}>
                <CheckCircleIcon width={20} style={{ color: 'hsl(var(--success))' }} />
              </button>
            </div>
          ) : (
            <div className="profile-name-display">
              <h2>{user?.name}</h2>
              <button className="btn-icon" onClick={() => { setEditName(name); setIsEditingName(true); }}>
                <PencilIcon width={16} style={{ color: 'hsl(var(--muted))' }} />
              </button>
            </div>
          )}
          <p style={{ color: 'hsl(215 20% 65%)' }}>{user?.email}</p>
          <small style={{ color: 'hsl(215 20% 50%)' }}>Member since {memberSince}</small>
        </div>
      </div>

      {showAvatarPicker && (
        <div className="profile-section">
          <h3>Choose Avatar</h3>
          <div className="icon-picker">
            {AVATARS.map((em) => (
              <button
                key={em}
                type="button"
                className={`icon-btn ${avatar === em ? 'active' : ''}`}
                onClick={() => handleAvatarSelect(em)}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="profile-section">
        <h3><UserIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Update Name</h3>
        <div className="grid-xs">
          <label>Display Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn--dark" style={{ marginTop: '0.5rem' }}>Save Changes</button>
      </form>

      <div className="profile-section">
        <h3><EnvelopeIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email</h3>
        <div className="grid-xs">
          <input type="email" value={email} disabled style={{ opacity: 0.6 }} />
          <small style={{ color: 'hsl(215 20% 50%)' }}>Email cannot be changed</small>
        </div>
      </div>

      <form onSubmit={handleChangePassword} className="profile-section">
        <h3><KeyIcon width={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> Change Password</h3>
        <div className="grid-xs">
          <label>Current Password</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </div>
        <div className="grid-xs">
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength="6" required />
        </div>
        <div className="grid-xs">
          <label>Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn--dark" style={{ marginTop: '0.5rem' }}>Change Password</button>
      </form>
    </div>
  );
};

export default Profile;
