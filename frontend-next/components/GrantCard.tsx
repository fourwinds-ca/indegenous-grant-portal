"use client";

import React from 'react';
import { FaDollarSign, FaCalendarAlt, FaBuilding, FaExternalLinkAlt } from 'react-icons/fa';

interface GrantCardProps {
  grant: {
    id: string;
    title: string;
    description: string;
    agency: string;
    category: string;
    eligibility: string;
    applicationLink: string;
    deadline: string;
    amount: string;
    currency: string;
    status: string;
  };
  onApply?: (grantId: string) => void;
}

const categoryColors: Record<string, string> = {
  'Housing': 'bg-blue-100 text-blue-800 border-blue-300',
  'Economic Development': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Education': 'bg-purple-100 text-purple-800 border-purple-300',
  'Health': 'bg-red-100 text-red-800 border-red-300',
  'Culture and Language': 'bg-amber-100 text-amber-800 border-amber-300',
  'Environment': 'bg-green-100 text-green-800 border-green-300',
  'Community': 'bg-teal-100 text-teal-800 border-teal-300',
};

const GrantCard: React.FC<GrantCardProps> = ({ grant, onApply }) => {
  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleApply = () => {
    if (onApply) {
      onApply(grant.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        {/* Category Badge */}
        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
              categoryColors[grant.category] || 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          >
            {grant.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {grant.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {grant.description}
        </p>

        {/* Grant Details */}
        <div className="space-y-3 mb-4">
          {/* Agency */}
          <div className="flex items-start gap-2 text-sm">
            <FaBuilding className="text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-700">Agency:</span>
              <span className="text-gray-600 ml-1">{grant.agency}</span>
            </div>
          </div>

          {/* Funding Amount */}
          <div className="flex items-start gap-2 text-sm">
            <FaDollarSign className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-700">Funding:</span>
              <span className="text-emerald-700 font-bold ml-1">
                {formatCurrency(grant.amount)}
              </span>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-start gap-2 text-sm">
            <FaCalendarAlt className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-700">Deadline:</span>
              <span className="text-gray-600 ml-1">{formatDate(grant.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-teal-50 border border-teal-200 rounded-md p-3 mb-4">
          <p className="text-xs font-semibold text-teal-900 mb-1">Eligibility:</p>
          <p className="text-xs text-teal-800">{grant.eligibility}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={handleApply}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm"
          >
            Track Application
          </button>
          <a
            href={grant.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-teal-600 font-semibold py-2 px-4 rounded-md border-2 border-teal-600 transition-colors duration-200 text-sm"
          >
            Apply
            <FaExternalLinkAlt className="text-xs" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default GrantCard;
