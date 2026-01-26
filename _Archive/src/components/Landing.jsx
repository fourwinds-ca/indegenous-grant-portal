import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import GrantsList from './GrantsList';
import {
  FaSearch,
  FaChartLine,
  FaBell,
  FaUsers,
  FaCheckCircle,
  FaDollarSign,
  FaCalendarAlt,
  FaHandshake,
  FaArrowRight,
  FaTimes
} from 'react-icons/fa';

export default function Landing() {
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail({ email, password });
      } else {
        await signInWithEmail({ email, password });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err.message || 'OAuth login failed');
    }
  };

  const features = [
    {
      icon: FaSearch,
      title: "Discover Opportunities",
      description: "Access a comprehensive database of federal, provincial, and territorial grant programs tailored for Indigenous communities."
    },
    {
      icon: FaChartLine,
      title: "Track Progress",
      description: "Monitor your applications from submission to approval with real-time status updates and detailed analytics."
    },
    {
      icon: FaBell,
      title: "Smart Notifications",
      description: "Never miss a deadline with intelligent reminders and alerts for upcoming opportunities and application dates."
    },
    {
      icon: FaUsers,
      title: "Community Focused",
      description: "Built specifically for Indigenous, Inuit, and Métis communities, organizations, and their unique funding needs."
    }
  ];

  const stats = [
    { value: "500+", label: "Active Grant Programs" },
    { value: "$2.5B", label: "Total Funding Available" },
    { value: "1,200+", label: "Communities Served" },
    { value: "85%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <FaHandshake className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Indigenous Grant Tracker</h1>
                <p className="text-xs text-gray-500">Empowering Communities</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Simplify Your Path to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Indigenous Funding
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Navigate federal, provincial, and territorial grant programs with ease.
              Discover funding opportunities, track applications, and empower your community's growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Start Exploring Grants
                <FaArrowRight className="ml-2" />
              </button>
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setShowAuthModal(true);
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-700 bg-white border-2 border-teal-600 hover:bg-teal-50 rounded-lg transition-all"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for Indigenous communities to streamline grant discovery and management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-teal-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-white text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600">
              Three simple steps to access funding opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-teal-600 text-2xl" />
              </div>
              <div className="w-8 h-1 bg-teal-600 mx-auto mb-4"></div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">1. Search & Discover</h4>
              <p className="text-gray-600">
                Browse through hundreds of grant programs filtered by category, funding amount, and eligibility criteria.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCalendarAlt className="text-emerald-600 text-2xl" />
              </div>
              <div className="w-8 h-1 bg-emerald-600 mx-auto mb-4"></div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">2. Track & Manage</h4>
              <p className="text-gray-600">
                Keep all your applications organized with deadline reminders and progress tracking in one central dashboard.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-teal-600 text-2xl" />
              </div>
              <div className="w-8 h-1 bg-teal-600 mx-auto mb-4"></div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">3. Secure Funding</h4>
              <p className="text-gray-600">
                Monitor approvals, manage funding, and access analytics to maximize your community's success rate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Grants Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Available Grants
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse through hundreds of grant opportunities for Indigenous communities. Sign in to track your applications and save favorites.
            </p>
          </div>

          <GrantsList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Funding Journey?
          </h3>
          <p className="text-xl text-teal-50 mb-8">
            Join hundreds of Indigenous communities already using our platform to secure funding and build brighter futures.
          </p>
          <button
            onClick={() => {
              setIsSignUp(true);
              setShowAuthModal(true);
            }}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-teal-600 bg-white hover:bg-gray-50 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Create Your Free Account
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <FaHandshake className="text-white text-sm" />
                </div>
                <h4 className="text-white font-semibold">Indigenous Grant Tracker</h4>
              </div>
              <p className="text-sm text-gray-400">
                Empowering Indigenous communities through accessible funding opportunities.
              </p>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Resources</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Grant Database</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Application Guides</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Community Forum</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Webinars</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Accessibility</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Data Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Indigenous Grant Tracker. All rights reserved. Built with respect for Indigenous communities across Canada.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600">
                {isSignUp
                  ? 'Start discovering grant opportunities today'
                  : 'Sign in to access your grant dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Google
                </button>
                <button
                  onClick={() => handleOAuthLogin('github')}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  GitHub
                </button>
                <button
                  onClick={() => handleOAuthLogin('azure')}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Azure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}