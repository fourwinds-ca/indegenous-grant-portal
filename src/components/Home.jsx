import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

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
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Grants Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Your personalized space to discover, track, and manage grant opportunities across Canada.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Discover Grants
                  </h3>
                  <p className="text-gray-600">
                    Browse available grants and funding opportunities
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Track Applications
                  </h3>
                  <p className="text-gray-600">
                    Monitor your application status and deadlines
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    View Metrics
                  </h3>
                  <p className="text-gray-600">
                    Analyze success rates and funding patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}