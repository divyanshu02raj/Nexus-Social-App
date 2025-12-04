//frontend\src\pages\Settings.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { updateUserProfile, toggleTheme, updatePassword } from '../store';
import {
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  EyeIcon,
  SwatchIcon,
  CameraIcon,
  PencilIcon,
  MapPinIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

function Settings() {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    isPrivate: false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        isPrivate: user.isPrivate || false,
      });
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'appearance', name: 'Appearance', icon: SwatchIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'privacy', name: 'Privacy', icon: EyeIcon },
  ];

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    dispatch(updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }))
      .unwrap()
      .then(() => {
        toast.success('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to update password');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'profile') {
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('username', profileData.username);
      formData.append('email', profileData.email);
      formData.append('bio', profileData.bio);
      formData.append('isPrivate', profileData.isPrivate);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      dispatch(updateUserProfile(formData))
        .unwrap()
        .then(() => {
          toast.success('Profile updated successfully!');
          setAvatarFile(null);
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to update profile.');
        });
    } else if (activeTab === 'privacy') {
      const formData = new FormData();
      formData.append('isPrivate', profileData.isPrivate);

      dispatch(updateUserProfile(formData))
        .unwrap()
        .then(() => {
          toast.success('Privacy settings updated!');
        })
        .catch((error) => {
          toast.error(error.message || 'Failed to update privacy settings.');
        });
    } else {
      toast.info('This feature is not yet implemented.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                Profile Picture
              </label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                  />
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors cursor-pointer">
                    <CameraIcon className="w-5 h-5" />
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                  <PencilIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                  <PencilIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows="4"
                value={profileData.bio}
                onChange={handleProfileChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={authLoading}
                className="px-8 py-3 bg-purple-600 text-white text-lg font-medium rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        );
      case 'appearance':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => darkMode && dispatch(toggleTheme())} className={`p-6 rounded-xl border-2 text-left ${!darkMode ? 'border-purple-500 bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md"><SwatchIcon className="w-8 h-8 text-yellow-500" /></div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Light</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">For bright environments</p>
                  </div>
                </div>
              </motion.button>
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => !darkMode && dispatch(toggleTheme())} className={`p-6 rounded-xl border-2 text-left ${darkMode ? 'border-purple-500 bg-gray-800' : 'border-gray-300 dark:border-gray-600'}`}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center shadow-md"><SwatchIcon className="w-8 h-8 text-gray-400" /></div>
                  <div>
                    <p className="text-lg font-medium text-white">Dark</p>
                    <p className="text-sm text-gray-400">For dark environments</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        );
      case 'privacy':
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Private Account</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  When your account is private, only people you approve can see your photos and videos.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={profileData.isPrivate}
                  onChange={handleProfileChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={authLoading}
                className="px-8 py-3 bg-purple-600 text-white text-lg font-medium rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <div className="grid grid-cols-4 min-h-[800px]">
        <div className="col-span-1 border-r border-gray-200 dark:border-gray-700">
          <nav className="p-6 space-y-2">
            {tabs.map((tab) => (
              <motion.button
                type="button"
                key={tab.id}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 text-left ${activeTab === tab.id
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="col-span-3 p-8">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            {tabs.find(tab => tab.id === activeTab)?.name} Settings
          </h2>

          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default Settings;

