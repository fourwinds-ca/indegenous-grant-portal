import { mockApplications } from "../lib/mockData";
import { FaCheckCircle, FaClock, FaHourglassHalf, FaPencilAlt, FaSpinner } from "react-icons/fa";

export default function Applications() {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-600" />;
      case 'submitted':
        return <FaClock className="text-blue-600" />;
      case 'under_review':
        return <FaSpinner className="text-yellow-600" />;
      case 'in_progress':
        return <FaHourglassHalf className="text-purple-600" />;
      case 'planning':
        return <FaPencilAlt className="text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'planning':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCurrency = (amount) => {
    return `$${Number(amount).toLocaleString('en-CA')} CAD`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
          <p className="text-gray-600 mt-1">
            Track and manage your grant applications
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Total Applications: <span className="font-semibold">{mockApplications.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockApplications.map((application) => (
          <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {application.grantTitle}
                </h3>
                <p className="text-sm text-gray-600">{application.agency}</p>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 ${getStatusColor(application.applicationStatus)}`}>
                {getStatusIcon(application.applicationStatus)}
                <span className="font-medium text-sm">{getStatusLabel(application.applicationStatus)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600 block mb-1">Amount Requested</span>
                <p className="font-semibold text-green-600">{formatCurrency(application.amountRequested)}</p>
              </div>

              {application.amountApproved && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Amount Approved</span>
                  <p className="font-semibold text-green-700">{formatCurrency(application.amountApproved)}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-600 block mb-1">Application Date</span>
                <p className="font-medium text-gray-900">{formatDate(application.applicationDate)}</p>
              </div>

              {application.submissionDate && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Submission Date</span>
                  <p className="font-medium text-gray-900">{formatDate(application.submissionDate)}</p>
                </div>
              )}

              {application.responseDate && (
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Response Date</span>
                  <p className="font-medium text-gray-900">{formatDate(application.responseDate)}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-600 block mb-1">Deadline</span>
                <p className="font-medium text-gray-900">{formatDate(application.deadline)}</p>
              </div>
            </div>

            {application.notes && (
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <span className="text-sm font-medium text-gray-700 block mb-2">Notes:</span>
                <p className="text-sm text-gray-600">{application.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                View Details
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                Update Status
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
