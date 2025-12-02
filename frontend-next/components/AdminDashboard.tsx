"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileImport,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { Grant, PROVINCES, GRANT_CATEGORIES, GRANT_STATUSES } from '@/lib/types';
import {
  fetchGrants,
  createGrant,
  updateGrant,
  deleteGrant,
} from '@/lib/grantsService';

interface GrantFormData {
  title: string;
  description: string;
  agency: string;
  program: string;
  category: string;
  eligibility: string;
  applicationLink: string;
  deadline: string;
  amount: string;
  currency: string;
  status: 'active' | 'inactive' | 'closed';
  sourceUrl: string;
  province: string;
  isPubliclyAvailable: boolean;
  notes: string;
}

const emptyForm: GrantFormData = {
  title: '',
  description: '',
  agency: '',
  program: '',
  category: '',
  eligibility: '',
  applicationLink: '',
  deadline: '',
  amount: '',
  currency: 'CAD',
  status: 'active',
  sourceUrl: '',
  province: 'Federal',
  isPubliclyAvailable: true,
  notes: '',
};

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [provinceFilter, setProvinceFilter] = useState('All');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);

  // Form state
  const [formData, setFormData] = useState<GrantFormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadGrants();
  }, []);

  useEffect(() => {
    filterGrants();
  }, [grants, searchTerm, categoryFilter, provinceFilter]);

  const loadGrants = async () => {
    try {
      setLoading(true);
      const data = await fetchGrants();
      setGrants(data);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGrants = () => {
    let filtered = [...grants];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        g =>
          g.title.toLowerCase().includes(term) ||
          g.agency.toLowerCase().includes(term) ||
          g.description.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }

    if (provinceFilter !== 'All') {
      filtered = filtered.filter(g => g.province === provinceFilter);
    }

    setFilteredGrants(filtered);
  };

  const handleAddGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || !formData.agency || !formData.category) {
      setFormError('Please fill in all required fields (Title, Agency, Category)');
      return;
    }

    try {
      await createGrant({
        ...formData,
        addedBy: user?.email || 'admin',
      });
      setShowAddModal(false);
      setFormData(emptyForm);
      setSuccessMessage('Grant added successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadGrants();
    } catch (error) {
      setFormError('Failed to add grant. Please try again.');
    }
  };

  const handleEditGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedGrant) return;

    try {
      await updateGrant(selectedGrant.id, formData);
      setShowEditModal(false);
      setSelectedGrant(null);
      setFormData(emptyForm);
      setSuccessMessage('Grant updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadGrants();
    } catch (error) {
      setFormError('Failed to update grant. Please try again.');
    }
  };

  const handleDeleteGrant = async () => {
    if (!selectedGrant) return;

    try {
      await deleteGrant(selectedGrant.id);
      setShowDeleteModal(false);
      setSelectedGrant(null);
      setSuccessMessage('Grant deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      loadGrants();
    } catch (error) {
      console.error('Failed to delete grant:', error);
    }
  };

  const openEditModal = (grant: Grant) => {
    setSelectedGrant(grant);
    setFormData({
      title: grant.title,
      description: grant.description,
      agency: grant.agency,
      program: grant.program,
      category: grant.category,
      eligibility: grant.eligibility,
      applicationLink: grant.applicationLink,
      deadline: grant.deadline,
      amount: grant.amount,
      currency: grant.currency,
      status: grant.status,
      sourceUrl: grant.sourceUrl,
      province: grant.province || 'Federal',
      isPubliclyAvailable: grant.isPubliclyAvailable ?? true,
      notes: grant.notes || '',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (grant: Grant) => {
    setSelectedGrant(grant);
    setShowDeleteModal(true);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const GrantForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agency <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.agency}
            onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            required
          >
            <option value="">Select Category</option>
            {GRANT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Province/Level</label>
          <select
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {PROVINCES.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
          <input
            type="text"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="text"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="e.g., 500000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {GRANT_STATUSES.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Eligibility</label>
          <textarea
            value={formData.eligibility}
            onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Application Link</label>
          <input
            type="url"
            value={formData.applicationLink}
            onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
          <input
            type="url"
            value={formData.sourceUrl}
            onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            placeholder="Notes for internal reference (not shown to users)"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPubliclyAvailable}
              onChange={(e) => setFormData({ ...formData, isPubliclyAvailable: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">Publicly available online (uncheck for private grants)</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setFormData(emptyForm);
            setFormError('');
          }}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-600 text-xl" />
              <p className="font-medium">{successMessage}</p>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/greenbuffalo_logo.png"
                alt="Green Buffalo Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-teal-700">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Grant Management Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                <FaSignOutAlt />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-3xl font-bold text-teal-600">{grants.length}</p>
            <p className="text-gray-600">Total Grants</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-3xl font-bold text-green-600">
              {grants.filter(g => g.status === 'active').length}
            </p>
            <p className="text-gray-600">Active</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-3xl font-bold text-yellow-600">
              {grants.filter(g => g.status === 'inactive').length}
            </p>
            <p className="text-gray-600">Inactive</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-3xl font-bold text-red-600">
              {grants.filter(g => g.status === 'closed').length}
            </p>
            <p className="text-gray-600">Closed</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search grants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="All">All Categories</option>
                {GRANT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Province Filter */}
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="All">All Provinces</option>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50"
              >
                <FaFileImport />
                Import CSV
              </button>
              <button
                onClick={() => {
                  setFormData(emptyForm);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <FaPlus />
                Add Grant
              </button>
            </div>
          </div>
        </div>

        {/* Grants Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading grants...</div>
          ) : filteredGrants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No grants found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Province
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrants.map((grant) => (
                    <tr key={grant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{grant.title}</div>
                        <div className="text-sm text-gray-500">{grant.agency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{grant.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{grant.province || 'Federal'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{formatCurrency(grant.amount)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{grant.deadline}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(grant.status)}`}>
                          {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(grant)}
                          className="text-teal-600 hover:text-teal-900 mr-4"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(grant)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Grant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Grant</h2>
              <GrantForm onSubmit={handleAddGrant} submitLabel="Add Grant" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Grant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Grant</h2>
              <GrantForm onSubmit={handleEditGrant} submitLabel="Save Changes" />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedGrant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FaExclamationTriangle className="text-2xl" />
              <h2 className="text-xl font-bold">Delete Grant</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedGrant.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedGrant(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGrant}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Import Grants from CSV</h2>
            <p className="text-gray-600 mb-4">
              Upload a CSV file with the following columns:
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-4 text-sm font-mono">
              title, agency, category, province, program, amount, deadline, description, eligibility, applicationLink, sourceUrl
            </div>
            <input
              type="file"
              accept=".csv"
              className="w-full mb-4"
              onChange={(e) => {
                // TODO: Implement CSV import
                console.log('File selected:', e.target.files?.[0]);
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Process CSV import
                  setShowImportModal(false);
                  setSuccessMessage('CSV import feature coming soon!');
                  setTimeout(() => setSuccessMessage(''), 5000);
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
