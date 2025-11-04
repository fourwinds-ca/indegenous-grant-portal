"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
  FaSearch,
  FaChartLine,
  FaBell,
  FaUsers,
  FaCheckCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaTimes,
  FaGoogle,
  FaGithub,
  FaMicrosoft,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import GrantsList from './GrantsList';

const Landing: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmail({ email, password });
      } else {
        await signUpWithEmail({ email, password });
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'azure') => {
    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      setError(err.message || 'OAuth sign-in failed. Please try again.');
    }
  };

  const stats = [
    { value: '500+', label: 'Active Grant Programs' },
    { value: '$2.5B', label: 'Total Funding' },
    { value: '1,200+', label: 'Communities Served' },
    { value: '85%', label: 'Success Rate' },
  ];

  const features = [
    {
      icon: <FaSearch className="text-4xl" />,
      title: 'Discover Opportunities',
      description: 'Search through hundreds of grant programs tailored for Indigenous communities and organizations.',
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: 'Track Progress',
      description: 'Monitor your applications from submission to approval with real-time status updates.',
    },
    {
      icon: <FaBell className="text-4xl" />,
      title: 'Smart Notifications',
      description: 'Never miss a deadline with intelligent reminders and personalized grant recommendations.',
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: 'Community Focused',
      description: 'Built specifically for Indigenous peoples, by people who understand your unique needs.',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Search & Discover',
      description: 'Browse through our comprehensive database of grants. Filter by category, deadline, and funding amount to find the perfect match.',
      icon: <FaSearch className="text-3xl" />,
    },
    {
      step: '2',
      title: 'Track & Manage',
      description: 'Keep all your applications organized in one place. Track deadlines, requirements, and submission status effortlessly.',
      icon: <FaCalendarAlt className="text-3xl" />,
    },
    {
      step: '3',
      title: 'Secure Funding',
      description: 'Stay informed with real-time updates. Receive notifications when agencies review your applications and make decisions.',
      icon: <FaCheckCircle className="text-3xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Image
                src="/greenbuffalo_logo.png"
                alt="Green Buffalo Logo"
                width={50}
                height={50}
                className="object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold text-teal-700">
                Green Buffalo Indigenous Grant Portal
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-teal-700 font-semibold hover:bg-teal-50 rounded-md transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 bg-teal-600 text-white font-semibold hover:bg-teal-700 rounded-md transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simplify Your Path to Indigenous Funding
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-teal-50 max-w-3xl mx-auto">
              Discover, track, and manage grant opportunities designed for Indigenous communities across Canada
            </p>
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-2"
            >
              Start Your Journey
              <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-12 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-teal-700 mb-2">{stat.value}</p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your grant application process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200"
              >
                <div className="text-teal-600 mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your funding journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-teal-100 text-teal-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {item.step}
                </div>
                <div className="text-teal-600 flex justify-center mb-4">{item.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 text-center">{item.title}</h4>
                <p className="text-gray-600 text-center">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grants Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Available Grants
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse our comprehensive database of funding opportunities
            </p>
          </div>

          <GrantsList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Funding Journey?
          </h3>
          <p className="text-xl mb-8 text-teal-50">
            Join hundreds of Indigenous communities already using Green Buffalo to secure funding for their projects
          </p>
          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-2"
          >
            Get Started Today
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/greenbuffalo_logo.png"
                  alt="Green Buffalo Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <h3 className="text-white font-bold text-lg">Green Buffalo</h3>
              </div>
              <p className="text-sm">
                Empowering Indigenous communities through accessible funding opportunities
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Green Buffalo Indigenous Grant Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-2xl" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-gray-600">
                {authMode === 'signin'
                  ? 'Sign in to access your dashboard'
                  : 'Start your funding journey today'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => handleOAuthSignIn('google')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FaGoogle className="text-red-500" />
              </button>
              <button
                onClick={() => handleOAuthSignIn('github')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FaGithub className="text-gray-800" />
              </button>
              <button
                onClick={() => handleOAuthSignIn('azure')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FaMicrosoft className="text-blue-600" />
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              {authMode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setError('');
                    }}
                    className="text-teal-600 font-semibold hover:text-teal-700"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setError('');
                    }}
                    className="text-teal-600 font-semibold hover:text-teal-700"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
