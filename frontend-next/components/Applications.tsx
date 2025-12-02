"use client";

import React, { useState } from 'react';
import {
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaHourglassHalf,
  FaPencilAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaBuilding
} from 'react-icons/fa';
type ApplicationStatus = 'approved' | 'submitted' | 'under_review' | 'in_progress' | 'planning';

interface Application {
  id: string;
  grantId: string;
  grantTitle: string;
  agency: string;
  applicationStatus: string;
  applicationDate: string;
  submissionDate?: string;
  responseDate?: string;
  amountRequested: string;
  amountApproved?: string;
  notes?: string;
  deadline: string;
}

interface StatusConfig {
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}

const Applications: React.FC = () => {
  // TODO: Fetch from user_grant_applications table when implemented
  const [applications] = useState<Application[]>([]);

  const statusConfigs: Record<ApplicationStatus, StatusConfig> = {
    approved: {
      icon: <FaCheckCircle className="text-green-600" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      label: 'Approved',
    },
    submitted: {
      icon: <FaClock className="text-blue-600" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
      label: 'Submitted',
    },
    under_review: {
      icon: <FaSpinner className="text-yellow-600" />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      label: 'Under Review',
    },
    in_progress: {
      icon: <FaHourglassHalf className="text-purple-600" />,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      label: 'In Progress',
    },
    planning: {
      icon: <FaPencilAlt className="text-gray-600" />,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300',
      label: 'Planning',
    },
  };

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
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (applicationId: string) => {
    console.log('View details for application:', applicationId);
    alert(`Viewing details for application: ${applicationId}`);
  };

  const handleUpdateStatus = (applicationId: string) => {
    console.log('Update status for application:', applicationId);
    alert(`Update status for application: ${applicationId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          My Applications - Green Buffalo Indigenous Grant Portal
        </h2>
        <p className="text-gray-600 text-sm">
          Track and manage your grant applications
        </p>
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = application.applicationStatus as ApplicationStatus;
            const statusConfig = statusConfigs[status];

            return (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {application.grantTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaBuilding className="text-teal-600" />
                        <span>{application.agency}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                    >
                      {statusConfig.icon}
                      <span className="font-semibold text-sm">{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Amount Requested */}
                    <div className="flex items-start gap-2">
                      <FaDollarSign className="text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Amount Requested</p>
                        <p className="text-sm font-bold text-emerald-700">
                          {formatCurrency(application.amountRequested)}
                        </p>
                      </div>
                    </div>

                    {/* Amount Approved (if applicable) */}
                    {application.amountApproved && (
                      <div className="flex items-start gap-2">
                        <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Amount Approved</p>
                          <p className="text-sm font-bold text-green-700">
                            {formatCurrency(application.amountApproved)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Application Date */}
                    <div className="flex items-start gap-2">
                      <FaCalendarAlt className="text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Application Date</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatDate(application.applicationDate)}
                        </p>
                      </div>
                    </div>

                    {/* Submission Date (if applicable) */}
                    {application.submissionDate && (
                      <div className="flex items-start gap-2">
                        <FaClock className="text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Submitted On</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatDate(application.submissionDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Deadline */}
                    <div className="flex items-start gap-2">
                      <FaCalendarAlt className="text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Deadline</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatDate(application.deadline)}
                        </p>
                      </div>
                    </div>

                    {/* Response Date (if applicable) */}
                    {application.responseDate && (
                      <div className="flex items-start gap-2">
                        <FaCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Response Date</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatDate(application.responseDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {application.notes && (
                    <div className="bg-teal-50 border border-teal-200 rounded-md p-4 mb-4">
                      <p className="text-xs font-semibold text-teal-900 mb-1">Notes:</p>
                      <p className="text-sm text-teal-800">{application.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewDetails(application.id)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(application.id)}
                      className="flex-1 bg-white hover:bg-gray-50 text-teal-600 font-semibold py-2 px-4 rounded-md border-2 border-teal-600 transition-colors duration-200"
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            You haven't started any applications yet.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Browse available grants to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Applications;
