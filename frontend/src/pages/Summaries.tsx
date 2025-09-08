import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentTextIcon, FunnelIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { SummaryCard } from '../components/SummaryCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Summaries: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    tier: '',
    category: '',
    isRead: undefined as boolean | undefined,
  });

  const { data: summaries, isLoading } = useQuery({
    queryKey: ['summaries', page, filters],
    queryFn: () => apiService.getSummaries(page, 20, filters),
  });

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  if (isLoading) {
    return <LoadingSpinner className="min-h-64" />;
  }

  const summariesData = Array.isArray(summaries?.data.summaries) ? summaries!.data.summaries : [];
  const pagination = summaries?.data.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Summaries
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            AI-generated summaries from your tracked websites.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-4">
            <select
              value={filters.tier}
              onChange={(e) => handleFilterChange('tier', e.target.value)}
              className="input-field w-auto"
            >
              <option value="">All Tiers</option>
              <option value="tier1">Critical (Tier 1)</option>
              <option value="tier2">Informational (Tier 2)</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="input-field w-auto"
            >
              <option value="">All Categories</option>
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

            <select
              value={filters.isRead === undefined ? '' : String(filters.isRead)}
              onChange={(e) => {
                const value = e.target.value === '' ? undefined : e.target.value === 'true';
                handleFilterChange('isRead', value);
              }}
              className="input-field w-auto"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summaries List */}
      {summariesData.length > 0 ? (
        <div className="space-y-4">
          {summariesData.map((summary) => (
            <SummaryCard key={summary._id} summary={summary} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results.'
              : 'Start by adding websites to track and we\'ll generate summaries for you.'
            }
          </p>
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
    </div>
  );
};
