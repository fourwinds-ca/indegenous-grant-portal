export default function GrantCard({ grant, onApply }) {
  const formatAmount = (amount) => {
    if (!amount) return "Amount not specified";
    return `${amount} CAD`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Housing': 'bg-blue-100 text-blue-800',
      'Economic Development': 'bg-green-100 text-green-800',
      'Education': 'bg-purple-100 text-purple-800',
      'Health': 'bg-red-100 text-red-800',
      'Culture and Language': 'bg-yellow-100 text-yellow-800',
      'Environment': 'bg-emerald-100 text-emerald-800',
      'Community': 'bg-pink-100 text-pink-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {grant.title}
          </h3>
          <div className="flex items-center space-x-4 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(grant.category)}`}>
              {grant.category}
            </span>
            <span className="text-sm text-gray-600">
              {grant.agency}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">
        {grant.description || "No description available."}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-gray-600">Funding Amount:</span>
          <p className="text-lg font-semibold text-green-600">
            {formatAmount(grant.amount)}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Deadline:</span>
          <p className="text-gray-900">
            {formatDate(grant.deadline)}
          </p>
        </div>
      </div>

      {grant.eligibility && (
        <div className="mb-4">
          <span className="font-medium text-gray-600">Eligibility:</span>
          <p className="text-sm text-gray-700 mt-1 line-clamp-2">
            {grant.eligibility}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-2">
          {grant.applicationLink && (
            <a
              href={grant.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </a>
          )}
        </div>
        <button
          onClick={() => onApply(grant)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Track Application
        </button>
      </div>
    </div>
  );
}