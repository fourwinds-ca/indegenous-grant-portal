"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaFileAlt, FaChartBar, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import Applications from './Applications';
import Metrics from './Metrics';

type TabType = 'applications' | 'metrics';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('applications');
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const tabs = [
    {
      id: 'applications' as TabType,
      label: 'My Applications',
      icon: <FaFileAlt className="text-lg" />,
    },
    {
      id: 'metrics' as TabType,
      label: 'Metrics',
      icon: <FaChartBar className="text-lg" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/greenbuffalo_logo.png"
                alt="Green Buffalo Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold text-teal-700">
                Green Buffalo Indigenous Grant Portal
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* User Profile */}
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg">
                <FaUser className="text-teal-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.email || 'User'}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 rounded-md transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-4 border-teal-600 text-teal-700 bg-teal-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'applications' && <Applications />}
          {activeTab === 'metrics' && <Metrics />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
