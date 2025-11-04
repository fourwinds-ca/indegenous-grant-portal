"use client";

import React, { useState, useMemo } from 'react';
import GrantCard from './GrantCard';
import { mockGrants } from '@/lib/mockData';

type SortOption = 'recent' | 'deadline' | 'amount' | 'title';

const GrantsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const categories = [
    'All Categories',
    'Housing',
    'Economic Development',
    'Education',
    'Health',
    'Culture and Language',
    'Environment',
    'Community',
  ];

  const handleApply = (grantId: string) => {
    console.log('Tracking application for grant:', grantId);
    // This would typically navigate to an application form or modal
    alert(`Tracking application for grant ID: ${grantId}`);
  };

  const filteredAndSortedGrants = useMemo(() => {
    let filtered = mockGrants.filter((grant) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        grant.title.toLowerCase().includes(searchLower) ||
        grant.description.toLowerCase().includes(searchLower) ||
        grant.agency.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory =
        categoryFilter === 'All Categories' || grant.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          // Sort by ID (assuming higher ID = more recent)
          return parseInt(b.id) - parseInt(a.id);

        case 'deadline':
          // Sort by deadline (soonest first)
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

        case 'amount':
          // Sort by amount (highest first)
          return parseFloat(b.amount) - parseFloat(a.amount);

        case 'title':
          // Sort alphabetically by title
          return a.title.localeCompare(b.title);

        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, categoryFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Grants - Green Buffalo Indigenous Grant Portal
        </h2>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="md:col-span-3 lg:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title, description, or agency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white"
            >
              <option value="recent">Recently Updated</option>
              <option value="deadline">Deadline Soonest First</option>
              <option value="amount">Funding Amount Highest First</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-teal-700">{filteredAndSortedGrants.length}</span> of{' '}
          <span className="font-semibold">{mockGrants.length}</span> grants
        </div>
      </div>

      {/* Grants Grid */}
      {filteredAndSortedGrants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedGrants.map((grant) => (
            <GrantCard key={grant.id} grant={grant} onApply={handleApply} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            No grants found matching your criteria.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default GrantsList;
