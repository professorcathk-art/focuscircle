import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, GlobeAltIcon, PauseIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AddWebsiteModal } from '../components/AddWebsiteModal';

export const Websites: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites', page],
    queryFn: () => apiService.getWebsites(page, 20),
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteWebsite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });

  const toggleWebsiteMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiService.updateWebsite(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      deleteWebsiteMutation.mutate(id);
    }
  };

  const handleToggle = (id: string, isActive: boolean) => {
    toggleWebsiteMutation.mutate({ id, isActive: !isActive });
  };

  if (isLoading) {
    return <LoadingSpinner className="min-h-64" />;
  }

  const websitesData = websites?.data.websites || [];
  const pagination = websites?.data.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Tracked Websites
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the websites you want to monitor for updates.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Website
          </button>
        </div>
      </div>

      {/* Websites List */}
      {websitesData.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {websitesData.map((website) => (
            <div key={website._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {website.favicon ? (
                    <img
                      src={website.favicon}
                      alt=""
                      className="h-6 w-6 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <GlobeAltIcon className="h-6 w-6 text-gray-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {website.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {website.url}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleToggle(website._id, website.isActive)}
                    className={`p-1 rounded ${
                      website.isActive
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={website.isActive ? 'Pause monitoring' : 'Resume monitoring'}
                  >
                    {website.isActive ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(website._id)}
                    className="p-1 text-red-600 hover:text-red-700 rounded"
                    title="Delete website"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{website.category}</span>
                  <span className="capitalize">{website.monitoringFrequency}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {website.statistics.totalChecks} checks
                  </span>
                  <span className={`${
                    website.statistics.successfulChecks / website.statistics.totalChecks > 0.8
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {Math.round((website.statistics.successfulChecks / website.statistics.totalChecks) * 100)}% success
                  </span>
                </div>
                
                {website.lastChecked && (
                  <div className="text-xs text-gray-500">
                    Last checked: {new Date(website.lastChecked).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No websites tracked</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first website to track.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First Website
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['websites'] });
        }}
      />
    </div>
  );
};
