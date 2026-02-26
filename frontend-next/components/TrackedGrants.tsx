"use client";

import React, { useState, useEffect } from 'react';
import {
  FaBookmark,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaBuilding,
  FaTrash,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { fetchGrants } from '@/lib/grantsService';
import { getTrackedGrants, removeTrackedGrant } from '@/lib/trackedGrants';
import { Grant } from '@/lib/types';

const TrackedGrants: React.FC = () => {
  const [trackedGrants, setTrackedGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadTrackedGrants() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const trackedIds = getTrackedGrants(user.id);
        if (trackedIds.length === 0) {
          setTrackedGrants([]);
          setLoading(false);
          return;
        }

        const allGrants = await fetchGrants();
        const tracked = allGrants.filter((grant) => trackedIds.includes(grant.id));
        setTrackedGrants(tracked);
      } catch (error) {
        console.error('Error loading tracked grants:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrackedGrants();
  }, [user]);

  const handleUntrack = (grantId: string) => {
    if (user) {
      removeTrackedGrant(user.id, grantId);
      setTrackedGrants((prev) => prev.filter((g) => g.id !== grantId));
    }
  };

  const formatDeadline = (deadline: string): string => {
    if (!deadline) return 'Ongoing';
    const date = new Date(deadline);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970 || date.getFullYear() >= 2099) return 'Ongoing';
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDeadlineStatus = (deadline: string): { color: string; text: string } => {
    if (!deadline) return { color: 'text-blue-600 bg-blue-50', text: 'Ongoing' };
    const date = new Date(deadline);
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970 || date.getFullYear() >= 2099) {
      return { color: 'text-blue-600 bg-blue-50', text: 'Ongoing' };
    }
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { color: 'text-red-600 bg-red-50', text: 'Closed' };
    }
    if (daysUntil <= 30) {
      return { color: 'text-orange-600 bg-orange-50', text: `${daysUntil} days left` };
    }
    if (daysUntil <= 90) {
      return { color: 'text-yellow-600 bg-yellow-50', text: `${daysUntil} days left` };
    }
    return { color: 'text-green-600 bg-green-50', text: `${daysUntil} days left` };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your tracked grants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <FaBookmark className="text-2xl text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">My Tracked Grants</h2>
        </div>
        <p className="text-gray-600 text-sm">
          Grants you're interested in and want to monitor. Track deadlines, save for later, and apply when ready.
        </p>
      </div>

      {/* Tracked Grants List */}
      {trackedGrants.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trackedGrants.map((grant) => {
            const deadlineStatus = getDeadlineStatus(grant.deadline);

            return (
              <div
                key={grant.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white line-clamp-2">{grant.title}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Agency & Province */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaBuilding className="text-teal-600 flex-shrink-0" />
                      <span>{grant.agency}</span>
                    </div>
                    {grant.province && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                        <span>{grant.province}</span>
                      </div>
                    )}
                  </div>

                  {/* Amount & Deadline */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <FaDollarSign className="text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Funding Amount</p>
                        <p className="text-sm font-bold text-emerald-700">{grant.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaCalendarAlt className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Deadline</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatDeadline(grant.deadline)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deadline Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${deadlineStatus.color}`}>
                      {deadlineStatus.text}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{grant.description}</p>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                      {grant.category}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={grant.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      <FaExternalLinkAlt />
                      Apply Now
                    </a>
                    <button
                      onClick={() => handleUntrack(grant.id)}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-red-600 font-semibold py-2 px-4 rounded-md border-2 border-red-300 hover:border-red-400 transition-colors duration-200"
                      title="Stop tracking this grant"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <FaBookmark className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">You haven't tracked any grants yet.</p>
          <p className="text-gray-400 text-sm">
            Browse available grants and click "Track Application" to add grants to your list.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackedGrants;
