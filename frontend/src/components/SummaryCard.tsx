import React from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Summary } from '../types';

interface SummaryCardProps {
  summary: Summary;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTierBadge = (tier: string) => {
    return tier === 'tier1' ? (
      <span className="tier1-badge">Critical</span>
    ) : (
      <span className="tier2-badge">Informational</span>
    );
  };

  const getCategoryBadge = (category: string) => {
    return (
      <span className="category-badge capitalize">{category}</span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {getTierBadge(summary.classification.tier)}
            {getCategoryBadge(summary.classification.category)}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
            {summary.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {summary.content.summary}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDate(summary.publishedAt)}
              </div>
              {summary.websiteId && (
                <span className="truncate max-w-32">
                  {summary.websiteId.title}
                </span>
              )}
            </div>
            
            {!summary.isRead && (
              <div className="flex items-center text-primary-600">
                <EyeIcon className="h-4 w-4 mr-1" />
                Unread
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex space-x-2">
          {summary.classification.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <Link
          to={`/summaries/${summary._id}`}
          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
};
