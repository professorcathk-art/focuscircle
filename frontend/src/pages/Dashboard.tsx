import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  GlobeAltIcon,
  DocumentTextIcon,
  EyeIcon,
  ClockIcon,
  TrendingUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { SummaryCard } from '../components/SummaryCard';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => apiService.getUserStats(),
  });

  const { data: summaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['recentSummaries'],
    queryFn: () => apiService.getSummaries(1, 10),
  });

  const { data: trendingTopics } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: () => apiService.getTrendingTopics(7),
  });

  if (statsLoading || summariesLoading) {
    return <LoadingSpinner />;
  }

  const userStats = stats?.data;
  const recentSummaries = summaries?.data.summaries || [];
  const trendingTopicsData = trendingTopics?.data.trendingTopics || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your tracked websites.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/websites"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Website
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Websites
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {userStats?.overview.totalWebsites || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Summaries
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {userStats?.overview.totalSummaries || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Unread Summaries
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {userStats?.overview.unreadSummaries || 0}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Last Check
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {userStats?.recentActivity?.[0]?.extractedAt 
                    ? new Date(userStats.recentActivity[0].extractedAt).toLocaleDateString()
                    : 'Never'
                  }
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Summaries */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Summaries</h2>
              <Link
                to="/summaries"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
            
            {recentSummaries.length > 0 ? (
              <div className="space-y-4">
                {recentSummaries.slice(0, 5).map((summary) => (
                  <SummaryCard key={summary._id} summary={summary} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by adding websites to track and we'll generate summaries for you.
                </p>
                <div className="mt-6">
                  <Link
                    to="/websites"
                    className="btn-primary inline-flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Website
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          {trendingTopicsData.length > 0 && (
            <div className="card">
              <div className="flex items-center mb-4">
                <TrendingUpIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Trending Topics</h2>
              </div>
              <div className="space-y-2">
                {trendingTopicsData.slice(0, 5).map((topic, index) => (
                  <div key={topic._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{topic._id}</span>
                    <span className="text-xs text-gray-500">{topic.count} mentions</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Distribution */}
          {userStats?.categoryDistribution && userStats.categoryDistribution.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Content Categories</h2>
              <div className="space-y-2">
                {userStats.categoryDistribution.slice(0, 5).map((category) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 capitalize">{category._id}</span>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/websites"
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Manage Websites
              </Link>
              <Link
                to="/summaries"
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                View All Summaries
              </Link>
              <Link
                to="/profile"
                className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
              >
                Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
