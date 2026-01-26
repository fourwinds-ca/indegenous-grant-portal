import { useState } from "react";
import GrantCard from "./GrantCard";
import { mockGrants } from "../lib/mockData";

export default function GrantsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("lastUpdated");

  // Use mock data instead of API call
  const grants = mockGrants;
  const isLoading = false;
  const error = null;

  const categories = [
    "All Categories",
    "Housing",
    "Economic Development", 
    "Education",
    "Health",
    "Culture and Language",
    "Environment",
    "Community"
  ];

  const filteredGrants = grants
    .filter(grant => {
      const matchesSearch = !searchTerm || 
        grant.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grant.agency?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        selectedCategory === "All Categories" || 
        grant.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case "amount":
          const amountA = parseFloat((a.amount || "0").replace(/[^\d.]/g, "")) || 0;
          const amountB = parseFloat((b.amount || "0").replace(/[^\d.]/g, "")) || 0;
          return amountB - amountA;
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        default:
          return new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt);
      }
    });

  const handleApply = (grant) => {
    // TODO: Implement application tracking
    alert(`Application tracking for "${grant.title}" will be implemented in the next phase.`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading grants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading grants
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Unable to fetch grants. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Grants
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by title, description, or agency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category === "All Categories" ? "" : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastUpdated">Recently Updated</option>
              <option value="deadline">Deadline (Soonest First)</option>
              <option value="amount">Funding Amount (Highest First)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredGrants.length} of {grants.length} grants
        </p>
      </div>

      {/* Grants Grid */}
      {filteredGrants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No grants found</h3>
          <p className="text-gray-500">
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGrants.map((grant) => (
            <GrantCard 
              key={grant.id} 
              grant={grant} 
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </div>
  );
}