export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            First Nations Grants Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            Discover, track, and manage grant opportunities across Canada
          </p>
          <div className="space-y-4">
            <a
              href="/api/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In to Get Started
            </a>
            <p className="text-sm text-gray-500">
              Sign in with your preferred account to access grant opportunities and track your applications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}