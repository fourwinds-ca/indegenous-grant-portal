"use client";

import React, { useState, useEffect } from 'react';
import {
  FaRobot,
  FaCheck,
  FaTimes,
  FaEye,
  FaSync,
  FaClock,
  FaArrowRight,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaBan,
} from 'react-icons/fa';
import {
  PendingGrantChange,
  ResearchRun,
  fetchPendingChanges,
  fetchResearchRuns,
  approveChange,
  rejectChange,
  triggerManualResearch,
} from '@/lib/pendingChangesService';

interface AIResearchPanelProps {
  adminEmail: string;
  onChangeApplied: () => void;
}

const AIResearchPanel: React.FC<AIResearchPanelProps> = ({ adminEmail, onChangeApplied }) => {
  const [pendingChanges, setPendingChanges] = useState<PendingGrantChange[]>([]);
  const [researchRuns, setResearchRuns] = useState<ResearchRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedChange, setSelectedChange] = useState<PendingGrantChange | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [changes, runs] = await Promise.all([
        fetchPendingChanges(),
        fetchResearchRuns(),
      ]);
      setPendingChanges(changes);
      setResearchRuns(runs);
    } catch (err) {
      console.error('Error loading AI research data:', err);
      setError('Failed to load pending changes');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerResearch = async () => {
    setResearching(true);
    setError('');
    try {
      const result = await triggerManualResearch();
      if (result.success) {
        setSuccessMessage('Research initiated! Results will appear here when ready.');
        setTimeout(() => {
          loadData();
          setSuccessMessage('');
        }, 5000);
      } else {
        setError(result.error || 'Failed to start research');
      }
    } catch (err) {
      setError('Failed to trigger research');
    } finally {
      setResearching(false);
    }
  };

  const handleApprove = async (change: PendingGrantChange) => {
    setProcessingId(change.id);
    setError('');
    try {
      const result = await approveChange(change.id, adminEmail);
      if (result.success) {
        setSuccessMessage('Change approved and applied!');
        setPendingChanges(prev => prev.filter(c => c.id !== change.id));
        onChangeApplied();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to approve change');
      }
    } catch (err) {
      setError('Failed to approve change');
    } finally {
      setProcessingId(null);
      setShowDetailModal(false);
    }
  };

  const handleReject = async (change: PendingGrantChange) => {
    setProcessingId(change.id);
    setError('');
    try {
      const result = await rejectChange(change.id, adminEmail, rejectionNotes);
      if (result.success) {
        setSuccessMessage('Change rejected');
        setPendingChanges(prev => prev.filter(c => c.id !== change.id));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.error || 'Failed to reject change');
      }
    } catch (err) {
      setError('Failed to reject change');
    } finally {
      setProcessingId(null);
      setRejectionNotes('');
      setShowDetailModal(false);
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'new':
        return <FaPlus className="text-green-600" />;
      case 'update':
        return <FaEdit className="text-blue-600" />;
      case 'deactivate':
        return <FaBan className="text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'deactivate':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const latestRun = researchRuns[0];

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
          <FaCheckCircle />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <FaTimes />
          </button>
        </div>
      )}

      {/* AI Research Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaRobot className="text-2xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-900">AI Grant Research</h2>
              <p className="text-sm text-purple-600">
                Perplexity Deep Research automatically discovers new Indigenous grants
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {latestRun && (
              <div className="text-sm text-gray-600">
                <FaClock className="inline mr-1" />
                Last run: {formatDate(latestRun.started_at)}
                {latestRun.status === 'running' && (
                  <span className="ml-2 text-yellow-600">
                    <FaSpinner className="inline animate-spin mr-1" />
                    Running...
                  </span>
                )}
              </div>
            )}
            <button
              onClick={handleTriggerResearch}
              disabled={researching}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {researching ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <FaSync />
                  Run Research Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        {latestRun && latestRun.status === 'completed' && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{latestRun.grants_analyzed}</p>
              <p className="text-xs text-gray-600">Grants Analyzed</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{latestRun.new_grants_found}</p>
              <p className="text-xs text-gray-600">New Found</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{latestRun.updates_found}</p>
              <p className="text-xs text-gray-600">Updates</p>
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{latestRun.deactivations_found}</p>
              <p className="text-xs text-gray-600">Deactivations</p>
            </div>
          </div>
        )}
      </div>

      {/* Pending Changes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Changes for Review
            {pendingChanges.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                {pendingChanges.length}
              </span>
            )}
          </h3>
          <button
            onClick={loadData}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <FaSpinner className="animate-spin inline mr-2" />
            Loading pending changes...
          </div>
        ) : pendingChanges.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaCheckCircle className="text-4xl text-green-400 mx-auto mb-3" />
            <p>No pending changes to review</p>
            <p className="text-sm mt-1">All AI-discovered grants have been processed</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingChanges.map((change) => (
              <div key={change.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getChangeTypeIcon(change.change_type)}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getChangeTypeBadge(change.change_type)}`}>
                        {change.change_type === 'new' ? 'New Grant' : change.change_type === 'update' ? 'Update' : 'Deactivate'}
                      </span>
                      {change.ai_confidence_score && (
                        <span className="text-xs text-gray-500">
                          {Math.round(change.ai_confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">
                      {(change.proposed_data as Record<string, unknown>).title as string}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {(change.proposed_data as Record<string, unknown>).agency as string}
                    </p>
                    {change.change_type === 'update' && change.changed_fields && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium">Changed:</span>{' '}
                        {Object.keys(change.changed_fields).join(', ')}
                      </div>
                    )}
                    {change.ai_reasoning && (
                      <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                        {change.ai_reasoning}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedChange(change);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleApprove(change)}
                      disabled={processingId === change.id}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50"
                      title="Approve"
                    >
                      {processingId === change.id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedChange(change);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Reject"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getChangeTypeIcon(selectedChange.change_type)}
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedChange.change_type === 'new' ? 'New Grant Discovered' :
                     selectedChange.change_type === 'update' ? 'Grant Update Detected' :
                     'Grant Deactivation'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedChange(null);
                    setRejectionNotes('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Grant Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {(selectedChange.proposed_data as Record<string, unknown>).title as string}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Agency:</span>
                    <p className="text-gray-900">{(selectedChange.proposed_data as Record<string, unknown>).agency as string}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="text-gray-900">{(selectedChange.proposed_data as Record<string, unknown>).category as string}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Province:</span>
                    <p className="text-gray-900">{(selectedChange.proposed_data as Record<string, unknown>).province as string || 'Federal'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="text-gray-900">{(selectedChange.proposed_data as Record<string, unknown>).amount as string || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <p className="text-gray-900">{(selectedChange.proposed_data as Record<string, unknown>).deadline as string || 'Ongoing'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="text-gray-900">{(selectedChange.proposed_data as Record<string, unknown>).status as string || 'active'}</p>
                  </div>
                </div>
                {(selectedChange.proposed_data as Record<string, string>).description ? (
                  <div className="mt-3">
                    <span className="text-gray-500 text-sm">Description:</span>
                    <p className="text-gray-900 text-sm mt-1">
                      {(selectedChange.proposed_data as Record<string, string>).description}
                    </p>
                  </div>
                ) : null}
                {(selectedChange.proposed_data as Record<string, string>).eligibility ? (
                  <div className="mt-3">
                    <span className="text-gray-500 text-sm">Eligibility:</span>
                    <p className="text-gray-900 text-sm mt-1">
                      {(selectedChange.proposed_data as Record<string, string>).eligibility}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Changed Fields for Updates */}
              {selectedChange.change_type === 'update' && selectedChange.changed_fields && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Changes Detected</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedChange.changed_fields).map(([field, values]) => (
                      <div key={field} className="text-sm">
                        <span className="font-medium text-blue-800">{field}:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs line-through">
                            {String((values as { old: unknown; new: unknown }).old) || '(empty)'}
                          </span>
                          <FaArrowRight className="text-gray-400 text-xs" />
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                            {String((values as { old: unknown; new: unknown }).new)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {selectedChange.ai_reasoning && (
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-900 mb-1">AI Reasoning</h4>
                  <p className="text-sm text-purple-800">{selectedChange.ai_reasoning}</p>
                  {selectedChange.ai_confidence_score && (
                    <p className="text-xs text-purple-600 mt-2">
                      Confidence: {Math.round(selectedChange.ai_confidence_score * 100)}%
                    </p>
                  )}
                </div>
              )}

              {/* Source URLs */}
              {selectedChange.source_urls && selectedChange.source_urls.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-1 text-sm">Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChange.source_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-xs"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Notes */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Notes (optional)
                </label>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Add notes if rejecting this change..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => handleReject(selectedChange)}
                  disabled={processingId === selectedChange.id}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                >
                  {processingId === selectedChange.id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTimes />
                  )}
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedChange)}
                  disabled={processingId === selectedChange.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === selectedChange.id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheck />
                  )}
                  Approve & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResearchPanel;
