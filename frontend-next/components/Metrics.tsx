"use client";

import React from 'react';
import {
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaDollarSign,
  FaPercentage,
} from 'react-icons/fa';
import { mockMetrics } from '@/lib/mockData';

const Metrics: React.FC = () => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Analytics Dashboard - Green Buffalo Indigenous Grant Portal
        </h2>
        <p className="text-gray-600 text-sm">
          Track your grant application performance and insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Applications */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaFileAlt className="text-blue-600 text-2xl" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900">{mockMetrics.overview.totalApplications}</p>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaCheckCircle className="text-green-600 text-2xl" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-600">{mockMetrics.overview.approved}</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaClock className="text-yellow-600 text-2xl" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{mockMetrics.overview.pending}</p>
        </div>

        {/* Total Approved */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <FaDollarSign className="text-emerald-600 text-2xl" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total Approved</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(mockMetrics.overview.totalApproved)}
          </p>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-teal-100 p-3 rounded-lg">
              <FaPercentage className="text-teal-600 text-2xl" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Success Rate</p>
          <p className="text-3xl font-bold text-teal-600">{mockMetrics.overview.successRate}%</p>
        </div>
      </div>

      {/* Funding Overview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Funding Overview</h3>

        <div className="space-y-4">
          {/* Total Requested */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total Requested</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency(mockMetrics.overview.totalRequested)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {/* Total Approved */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total Approved</span>
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(mockMetrics.overview.totalApproved)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(mockMetrics.overview.totalApproved / mockMetrics.overview.totalRequested) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Approval Rate Visual */}
          <div className="pt-2">
            <p className="text-xs text-gray-500">
              Approval Rate:{' '}
              <span className="font-semibold text-teal-700">
                {formatPercent((mockMetrics.overview.totalApproved / mockMetrics.overview.totalRequested) * 100)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications by Status */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Applications by Status</h3>

          <div className="space-y-3">
            {mockMetrics.byStatus.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${item.color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Timeline */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Application Timeline</h3>

          <div className="space-y-4">
            {mockMetrics.timeline.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.month}</p>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">
                        {item.applications} Applications
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">
                        {item.approvals} Approvals
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Applications</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Approved</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount Requested</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {mockMetrics.byCategory.map((item, index) => {
                const successRate = item.applications > 0 ? (item.approved / item.applications) * 100 : 0;

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.category}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 text-center">{item.applications}</td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span className={`font-semibold ${item.approved > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.approved}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-emerald-700 text-right">
                      {formatCurrency(item.amountRequested)}
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          successRate === 100
                            ? 'bg-green-100 text-green-800'
                            : successRate > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {formatPercent(successRate)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
