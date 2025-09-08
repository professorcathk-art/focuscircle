import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import apiService from '../services/api';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WebsiteForm {
  url: string;
  title?: string;
  description?: string;
  category: string;
  monitoringFrequency: string;
}

export const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WebsiteForm>({
    defaultValues: {
      category: 'other',
      monitoringFrequency: 'daily',
    },
  });

  const createWebsiteMutation = useMutation({
    mutationFn: (data: WebsiteForm) => apiService.createWebsite(data),
    onSuccess: () => {
      reset();
      setError('');
      onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to add website');
    },
  });

  const onSubmit = (data: WebsiteForm) => {
    setError('');
    createWebsiteMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Website</h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                    Website URL *
                  </label>
                  <input
                    {...register('url', {
                      required: 'URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL starting with http:// or https://',
                      },
                    })}
                    type="url"
                    className="input-field mt-1"
                    placeholder="https://example.com"
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title (optional)
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="input-field mt-1"
                    placeholder="Custom title for this website"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input-field mt-1"
                    placeholder="Brief description of this website"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="input-field mt-1"
                  >
                    <option value="business">Business</option>
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="health">Health</option>
                    <option value="sports">Sports</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="politics">Politics</option>
                    <option value="science">Science</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="monitoringFrequency" className="block text-sm font-medium text-gray-700">
                    Monitoring Frequency
                  </label>
                  <select
                    {...register('monitoringFrequency')}
                    className="input-field mt-1"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={createWebsiteMutation.isPending}
                className="btn-primary w-full sm:ml-3 sm:w-auto"
              >
                {createWebsiteMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Add Website'
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary w-full mt-3 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
