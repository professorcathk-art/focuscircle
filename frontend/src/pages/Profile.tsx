import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserIcon, BellIcon, KeyIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: userStats } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => apiService.getUserStats(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiService.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.user);
      setSuccess('Profile updated successfully');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) => apiService.updatePassword(data),
    onSuccess: () => {
      setSuccess('Password updated successfully');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update password');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => apiService.updatePreferences(data),
    onSuccess: () => {
      setSuccess('Preferences updated successfully');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update preferences');
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: () => apiService.exportUserData(),
    onSuccess: (data) => {
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `focuscircle-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Data exported successfully');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to export data');
    },
  });

  const ProfileForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
      defaultValues: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
      },
    });

    const onSubmit = (data: any) => {
      updateProfileMutation.mutate(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              type="text"
              className="input-field mt-1"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              {...register('lastName', { required: 'Last name is required' })}
              type="text"
              className="input-field mt-1"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input-field mt-1 bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="btn-primary"
          >
            {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    );
  };

  const PasswordForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
      updatePasswordMutation.mutate(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Current password
          </label>
          <input
            {...register('currentPassword', { required: 'Current password is required' })}
            type="password"
            className="input-field mt-1"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            New password
          </label>
          <input
            {...register('newPassword', { 
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            type="password"
            className="input-field mt-1"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updatePasswordMutation.isPending}
            className="btn-primary"
          >
            {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    );
  };

  const PreferencesForm = () => {
    const { register, handleSubmit, watch } = useForm({
      defaultValues: {
        notificationFrequency: user?.preferences.notificationFrequency || 'daily',
        emailNotifications: user?.preferences.notificationTypes.email || true,
        inAppNotifications: user?.preferences.notificationTypes.inApp || true,
        pushNotifications: user?.preferences.notificationTypes.push || false,
      },
    });

    const onSubmit = (data: any) => {
      const preferences = {
        notificationFrequency: data.notificationFrequency,
        notificationTypes: {
          email: data.emailNotifications,
          inApp: data.inAppNotifications,
          push: data.pushNotifications,
        },
      };
      updatePreferencesMutation.mutate(preferences);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="notificationFrequency" className="block text-sm font-medium text-gray-700">
            Notification Frequency
          </label>
          <select {...register('notificationFrequency')} className="input-field mt-1">
            <option value="immediate">Immediate</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Notification Types</h3>
          
          <div className="flex items-center">
            <input
              {...register('emailNotifications')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Email notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              {...register('inAppNotifications')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              In-app notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              {...register('pushNotifications')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Push notifications
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updatePreferencesMutation.isPending}
            className="btn-primary"
          >
            {updatePreferencesMutation.isPending ? 'Updating...' : 'Update Preferences'}
          </button>
        </div>
      </form>
    );
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'password', name: 'Password', icon: KeyIcon },
    { id: 'preferences', name: 'Preferences', icon: BellIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="card">
            <div className="text-sm font-medium text-gray-500">Total Websites</div>
            <div className="text-2xl font-semibold text-gray-900">
              {userStats.data.overview.totalWebsites}
            </div>
          </div>
          <div className="card">
            <div className="text-sm font-medium text-gray-500">Total Summaries</div>
            <div className="text-2xl font-semibold text-gray-900">
              {userStats.data.overview.totalSummaries}
            </div>
          </div>
          <div className="card">
            <div className="text-sm font-medium text-gray-500">Unread Summaries</div>
            <div className="text-2xl font-semibold text-gray-900">
              {userStats.data.overview.unreadSummaries}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'profile' && <ProfileForm />}
        {activeTab === 'password' && <PasswordForm />}
        {activeTab === 'preferences' && <PreferencesForm />}
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-500">
                Download all your data in JSON format
              </p>
            </div>
            <button
              onClick={() => exportDataMutation.mutate()}
              disabled={exportDataMutation.isPending}
              className="btn-secondary inline-flex items-center"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {exportDataMutation.isPending ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
