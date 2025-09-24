import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import GrantsList from "./GrantsList";

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("grants");

  const tabs = [
    { id: "grants", name: "Available Grants", icon: "📋" },
    { id: "applications", name: "My Applications", icon: "📝" },
    { id: "metrics", name: "Metrics", icon: "📊" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                First Nations Grants Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full"
                  style={{objectFit: 'cover'}}
                />
              )}
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName || user?.email}
              </span>
              <a
                href="/api/logout"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {activeTab === "grants" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Available Grants</h2>
                <p className="text-gray-600 mt-1">
                  Discover grant opportunities for First Nations communities across Canada.
                </p>
              </div>
              <GrantsList />
            </div>
          )}
          
          {activeTab === "applications" && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Tracking</h3>
              <p className="text-gray-500 mb-4">
                Track your grant applications, deadlines, and reporting requirements.
              </p>
              <p className="text-sm text-blue-600">
                This feature will be available in the next development phase.
              </p>
            </div>
          )}
          
          {activeTab === "metrics" && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-500 mb-4">
                View approval rates, funding analytics, and success metrics.
              </p>
              <p className="text-sm text-blue-600">
                This feature will be available in the next development phase.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}