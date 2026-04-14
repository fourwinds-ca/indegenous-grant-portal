"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileImport,
  FaDownload,
  FaSignOutAlt,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaSpinner,
  FaRobot,
  FaTable,
  FaEnvelope,
  FaEye,
  FaReply,
  FaArchive,
  FaBell,
  FaToggleOn,
  FaToggleOff,
  FaPaperPlane,
  FaBook,
  FaFilePdf,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import AIResearchPanel from './AIResearchPanel';
import { Grant, PROVINCES, GRANT_CATEGORIES, GRANT_STATUSES } from '@/lib/types';
import {
  fetchGrants,
  createGrant,
  updateGrant,
  deleteGrant,
  bulkCreateGrants,
} from '@/lib/grantsService';
import {
  ContactSubmission,
  fetchContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
} from '@/lib/contactService';
import {
  EmailSubscription,
  fetchSubscriptions,
  deleteSubscription,
  toggleSubscriptionStatus,
  getSubscriptionStats,
} from '@/lib/subscriptionService';

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

  // Tab state
  const [activeTab, setActiveTab] = useState<'grants' | 'ai-research' | 'contacts' | 'subscriptions' | 'training'>('grants');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionStats, setSubscriptionStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [selectedSubscription, setSelectedSubscription] = useState<EmailSubscription | null>(null);
  const [showDeleteSubscriptionModal, setShowDeleteSubscriptionModal] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  // Contact submissions state
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDeleteContactModal, setShowDeleteContactModal] = useState(false);

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

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvError, setCsvError] = useState('');
  const [csvPreview, setCsvPreview] = useState<Partial<Grant>[]>([]);

  useEffect(() => {
    loadGrants();
    loadContactSubmissions();
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true);
      const [subs, stats] = await Promise.all([
        fetchSubscriptions(),
        getSubscriptionStats(),
      ]);
      setSubscriptions(subs);
      setSubscriptionStats(stats);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const handleToggleSubscription = async (id: string, currentStatus: boolean) => {
    try {
      await toggleSubscriptionStatus(id, !currentStatus);
      setSuccessMessage(`Subscription ${!currentStatus ? 'activated' : 'deactivated'}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadSubscriptions();
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!selectedSubscription) return;
    try {
      await deleteSubscription(selectedSubscription.id);
      setShowDeleteSubscriptionModal(false);
      setSelectedSubscription(null);
      setSuccessMessage('Subscription deleted');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  const handleSendReminders = async (type: 'deadline_reminders' | 'new_grants') => {
    setSendingReminders(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ type }),
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setSuccessMessage(`Sent ${data.emailsSent} reminder emails`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error sending reminders:', error);
      setSuccessMessage('Failed to send reminders. Check console for details.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setSendingReminders(false);
    }
  };

  useEffect(() => {
    filterGrants();
  }, [grants, searchTerm, categoryFilter, provinceFilter]);

  const loadContactSubmissions = async () => {
    try {
      setContactsLoading(true);
      const data = await fetchContactSubmissions();
      setContactSubmissions(data);
    } catch (error) {
      console.error('Error loading contact submissions:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleUpdateContactStatus = async (id: string, status: ContactSubmission['status']) => {
    try {
      await updateContactStatus(id, status);
      setSuccessMessage(`Contact marked as ${status}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadContactSubmissions();
      if (showContactModal) {
        setShowContactModal(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    try {
      await deleteContactSubmission(selectedContact.id);
      setShowDeleteContactModal(false);
      setSelectedContact(null);
      setSuccessMessage('Contact submission deleted');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadContactSubmissions();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  // CSV Template columns
  const csvColumns = [
    'title',
    'agency',
    'category',
    'province',
    'program',
    'amount',
    'deadline',
    'status',
    'description',
    'eligibility',
    'applicationLink',
    'sourceUrl',
    'notes',
  ];

  // Generate and download CSV template
  const downloadCsvTemplate = () => {
    const header = csvColumns.join(',');
    const exampleRow = [
      'Example Grant Title',
      'Natural Resources Canada',
      'Environment',
      'Federal',
      'Clean Energy Program',
      'Up to $500000',
      '2025-12-31',
      'active',
      'Description of the grant program',
      'Indigenous communities and organizations',
      'https://example.com/apply',
      'https://example.com/info',
      'Internal notes',
    ].join(',');

    const csvContent = `${header}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'grants_import_template.csv';
    link.click();
  };

  // Parse CSV file
  const parseCsv = (text: string): Partial<Grant>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const grants: Partial<Grant>[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Handle quoted values with commas
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const grant: Partial<Grant> = {
        currency: 'CAD',
        isPubliclyAvailable: true,
        addedBy: user?.email || 'admin',
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'title':
            grant.title = value;
            break;
          case 'agency':
            grant.agency = value;
            break;
          case 'category':
            grant.category = value;
            break;
          case 'province':
            grant.province = value || 'Federal';
            break;
          case 'program':
            grant.program = value;
            break;
          case 'amount':
            grant.amount = value;
            break;
          case 'deadline':
            grant.deadline = value;
            break;
          case 'status':
            grant.status = (value as 'active' | 'inactive' | 'closed') || 'active';
            break;
          case 'description':
            grant.description = value;
            break;
          case 'eligibility':
            grant.eligibility = value;
            break;
          case 'applicationlink':
            grant.applicationLink = value;
            break;
          case 'sourceurl':
            grant.sourceUrl = value;
            break;
          case 'notes':
            grant.notes = value;
            break;
        }
      });

      // Only add if has required fields
      if (grant.title && grant.agency && grant.category) {
        grants.push(grant);
      }
    }

    return grants;
  };

  // Handle CSV file selection
  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCsvError('');
    setCsvPreview([]);

    if (!file) {
      setCsvFile(null);
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setCsvError('Please select a CSV file');
      return;
    }

    setCsvFile(file);

    // Parse and preview
    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.length === 0) {
      setCsvError('No valid grants found in CSV. Make sure required fields (title, agency, category) are filled.');
      return;
    }

    setCsvPreview(parsed);
  };

  // Import grants from CSV
  const handleCsvImport = async () => {
    if (csvPreview.length === 0) {
      setCsvError('No grants to import');
      return;
    }

    setCsvImporting(true);
    setCsvError('');

    try {
      await bulkCreateGrants(csvPreview);
      setShowImportModal(false);
      setCsvFile(null);
      setCsvPreview([]);
      setSuccessMessage(`Successfully imported ${csvPreview.length} grants!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      loadGrants();
    } catch (error) {
      setCsvError('Failed to import grants. Please check your data and try again.');
      console.error('CSV import error:', error);
    } finally {
      setCsvImporting(false);
    }
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
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('grants')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'grants'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaTable />
            Grants Database
          </button>
          <button
            onClick={() => setActiveTab('ai-research')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'ai-research'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaRobot />
            AI Research
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'contacts'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaEnvelope />
            Contact Messages
            {contactSubmissions.filter(c => c.status === 'new').length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {contactSubmissions.filter(c => c.status === 'new').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaBell />
            Subscriptions
            <span className="bg-teal-100 text-teal-700 text-xs rounded-full px-2 py-0.5">
              {subscriptionStats.active}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'training'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaBook />
            Training
          </button>
        </div>

        {/* AI Research Tab */}
        {activeTab === 'ai-research' && (
          <AIResearchPanel
            adminEmail={user?.email || 'admin'}
            onChangeApplied={loadGrants}
          />
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-orange-600">{contactSubmissions.length}</p>
                <p className="text-gray-600">Total Messages</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-blue-600">
                  {contactSubmissions.filter(c => c.status === 'new').length}
                </p>
                <p className="text-gray-600">New</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-yellow-600">
                  {contactSubmissions.filter(c => c.status === 'read').length}
                </p>
                <p className="text-gray-600">Read</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-green-600">
                  {contactSubmissions.filter(c => c.status === 'responded').length}
                </p>
                <p className="text-gray-600">Responded</p>
              </div>
            </div>

            {/* Contact Messages Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contact Form Submissions</h2>
              </div>
              {contactsLoading ? (
                <div className="p-8 text-center text-gray-500">Loading messages...</div>
              ) : contactSubmissions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No contact submissions yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        From
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contactSubmissions.map((contact) => (
                      <tr key={contact.id} className={`hover:bg-gray-50 ${contact.status === 'new' ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          <span className="line-clamp-1">{contact.subject || '(No subject)'}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                          {formatDate(contact.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getContactStatusColor(contact.status)}`}>
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowContactModal(true);
                              if (contact.status === 'new') {
                                handleUpdateContactStatus(contact.id, 'read');
                              }
                            }}
                            className="text-teal-600 hover:text-teal-800 p-1.5 hover:bg-teal-50 rounded"
                            title="View"
                          >
                            <FaEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowDeleteContactModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded ml-1"
                            title="Delete"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-teal-600">{subscriptionStats.total}</p>
                <p className="text-gray-600">Total Subscribers</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-green-600">{subscriptionStats.active}</p>
                <p className="text-gray-600">Active</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-3xl font-bold text-gray-400">{subscriptionStats.inactive}</p>
                <p className="text-gray-600">Inactive</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center">
                <p className="text-sm text-gray-500 mb-2">Send Reminders</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendReminders('deadline_reminders')}
                    disabled={sendingReminders}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                  >
                    {sendingReminders ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    Deadlines
                  </button>
                  <button
                    onClick={() => handleSendReminders('new_grants')}
                    disabled={sendingReminders}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {sendingReminders ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                    New Grants
                  </button>
                </div>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Email Subscribers</h2>
                <p className="text-sm text-gray-500">Manage email subscriptions for grant reminders and updates</p>
              </div>
              {subscriptionsLoading ? (
                <div className="p-8 text-center text-gray-500">Loading subscriptions...</div>
              ) : subscriptions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No subscribers yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Subscriber
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">
                        Subscribed
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{sub.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">{sub.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {sub.subscriptionType === 'all' ? 'All Updates' :
                             sub.subscriptionType === 'deadline_reminders' ? 'Deadlines' :
                             sub.subscriptionType === 'new_grants' ? 'New Grants' : sub.subscriptionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                          {formatDate(sub.subscribedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                            sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleToggleSubscription(sub.id, sub.isActive)}
                            className={`p-1.5 rounded ${
                              sub.isActive
                                ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                            title={sub.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {sub.isActive ? <FaToggleOn className="w-4 h-4" /> : <FaToggleOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSubscription(sub);
                              setShowDeleteSubscriptionModal(true);
                            }}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded ml-1"
                            title="Delete"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <FaBook className="text-2xl text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-green-900">Training Documentation</h2>
                  <p className="text-sm text-green-700">
                    Branded PDF guides for admins and for Indigenous communities using the portal
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Training Guide */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-teal-500">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-teal-100 rounded-lg flex-shrink-0">
                      <FaFilePdf className="text-3xl text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Admin Training Guide</h3>
                      <p className="text-sm text-gray-500 mb-2">For portal administrators</p>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-800 rounded-full">
                        7 pages &bull; ~48 KB
                      </span>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 mb-5 list-disc list-inside">
                    <li>Dashboard layout and tab walkthrough</li>
                    <li>5-step AI research pipeline explained</li>
                    <li>Reviewing and approving pending changes</li>
                    <li>Common tasks: adding grants, responding to support</li>
                    <li>Trusted sources and FAQ</li>
                  </ul>
                  <div className="flex gap-2">
                    <a
                      href="/training/Admin-Training-Guide.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 font-medium text-sm"
                    >
                      <FaEye />
                      View in Browser
                    </a>
                    <a
                      href="/training/Admin-Training-Guide.pdf"
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-teal-600 text-teal-700 rounded-md hover:bg-teal-50 font-medium text-sm"
                    >
                      <FaDownload />
                      Download
                    </a>
                  </div>
                </div>
              </div>

              {/* User Quick Start Guide */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-green-500">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                      <FaFilePdf className="text-3xl text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">User Quick Start Guide</h3>
                      <p className="text-sm text-gray-500 mb-2">For Indigenous communities</p>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        3 pages &bull; ~41 KB
                      </span>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 mb-5 list-disc list-inside">
                    <li>How to browse available grants</li>
                    <li>Understanding grant cards (amount, deadline, category)</li>
                    <li>Finding the right grant for your community</li>
                    <li>Grant status meanings (active, recurring, closed)</li>
                    <li>Subscribing to notifications and getting help</li>
                  </ul>
                  <div className="flex gap-2">
                    <a
                      href="/training/User-Quick-Start-Guide.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium text-sm"
                    >
                      <FaEye />
                      View in Browser
                    </a>
                    <a
                      href="/training/User-Quick-Start-Guide.pdf"
                      download
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-700 rounded-md hover:bg-green-50 font-medium text-sm"
                    >
                      <FaDownload />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <strong>Share with your community:</strong> The User Quick Start Guide is designed to be shared with community members.
              Download and email it, print copies, or link to it directly: <code className="bg-white px-1.5 py-0.5 rounded text-xs">/training/User-Quick-Start-Guide.pdf</code>
            </div>
          </div>
        )}

        {/* Grants Tab */}
        {activeTab === 'grants' && (
          <>
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
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Grant
                  </th>
                  <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">
                    Province
                  </th>
                  <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">
                    Status
                  </th>
                  <th className="px-2 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGrants.map((grant) => (
                  <tr key={grant.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900 line-clamp-1" title={grant.title}>
                        {grant.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1" title={grant.agency}>
                        {grant.agency}
                      </div>
                      <div className="md:hidden text-xs text-gray-400 mt-0.5">
                        {grant.category} • {grant.province || 'Federal'}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-gray-600 hidden md:table-cell">
                      <span className="line-clamp-1">{grant.category}</span>
                    </td>
                    <td className="px-2 py-2 text-gray-600 hidden lg:table-cell">
                      {grant.province || 'Federal'}
                    </td>
                    <td className="px-2 py-2 hidden sm:table-cell">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(grant.status)}`}>
                        {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => openEditModal(grant)}
                        className="text-teal-600 hover:text-teal-800 p-1.5 hover:bg-teal-50 rounded"
                        title="Edit"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(grant)}
                        className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded ml-1"
                        title="Delete"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
          </>
        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Import Grants from CSV</h2>

              {/* Template Download */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-teal-800">Download CSV Template</h3>
                    <p className="text-sm text-teal-600 mt-1">
                      Get a pre-formatted template with the correct column headers and an example row.
                    </p>
                  </div>
                  <button
                    onClick={downloadCsvTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    <FaDownload />
                    Download Template
                  </button>
                </div>
              </div>

              {/* Required Fields Notice */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Required columns:</strong> title, agency, category
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Optional columns:</strong> province, program, amount, deadline, status, description, eligibility, applicationLink, sourceUrl, notes
                </p>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Error Message */}
              {csvError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
                  {csvError}
                </div>
              )}

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Preview ({csvPreview.length} grants to import)
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">#</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Title</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Agency</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Category</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Province</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvPreview.slice(0, 10).map((grant, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                            <td className="px-4 py-2 text-gray-900 max-w-xs truncate">{grant.title}</td>
                            <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{grant.agency}</td>
                            <td className="px-4 py-2 text-gray-600">{grant.category}</td>
                            <td className="px-4 py-2 text-gray-600">{grant.province || 'Federal'}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                grant.status === 'active' ? 'bg-green-100 text-green-800' :
                                grant.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {grant.status || 'active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvPreview.length > 10 && (
                      <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 text-center">
                        ... and {csvPreview.length - 10} more grants
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setCsvFile(null);
                    setCsvPreview([]);
                    setCsvError('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={csvImporting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCsvImport}
                  disabled={csvPreview.length === 0 || csvImporting}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {csvImporting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FaFileImport />
                      Import {csvPreview.length > 0 ? `${csvPreview.length} Grants` : 'Grants'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Contact Message</h2>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedContact(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">From</label>
                  <p className="text-gray-900 font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <a href={`mailto:${selectedContact.email}`} className="text-teal-600 hover:underline">
                    {selectedContact.email}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <p className="text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getContactStatusColor(selectedContact.status)}`}>
                    {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                  </span>
                </div>
              </div>

              {selectedContact.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Subject</label>
                  <p className="text-gray-900">{selectedContact.subject}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Message</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <span className="text-sm text-gray-500 mr-2">Mark as:</span>
                <button
                  onClick={() => handleUpdateContactStatus(selectedContact.id, 'read')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md ${
                    selectedContact.status === 'read'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaEye className="w-3 h-3" />
                  Read
                </button>
                <button
                  onClick={() => handleUpdateContactStatus(selectedContact.id, 'responded')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md ${
                    selectedContact.status === 'responded'
                      ? 'bg-green-100 text-green-800'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaReply className="w-3 h-3" />
                  Responded
                </button>
                <button
                  onClick={() => handleUpdateContactStatus(selectedContact.id, 'archived')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md ${
                    selectedContact.status === 'archived'
                      ? 'bg-gray-200 text-gray-800'
                      : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FaArchive className="w-3 h-3" />
                  Archived
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <a
                href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your inquiry to Green Buffalo'}`}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <FaReply />
                Reply via Email
              </a>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSelectedContact(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      {showDeleteContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FaExclamationTriangle className="text-2xl" />
              <h2 className="text-xl font-bold">Delete Contact</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the message from <strong>{selectedContact.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteContactModal(false);
                  setSelectedContact(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContact}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscription Confirmation Modal */}
      {showDeleteSubscriptionModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <FaExclamationTriangle className="text-2xl" />
              <h2 className="text-xl font-bold">Delete Subscription</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the subscription for <strong>{selectedSubscription.email}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteSubscriptionModal(false);
                  setSelectedSubscription(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
