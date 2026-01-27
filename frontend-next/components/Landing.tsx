"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaSearch,
  FaChartLine,
  FaBell,
  FaUsers,
  FaCheckCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaTimes,
  FaExternalLinkAlt,
  FaHandshake,
  FaLeaf,
  FaHeart,
  FaEnvelope,
  FaShieldAlt,
  FaPencilAlt,
  FaProjectDiagram,
  FaDatabase,
  FaSync,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import GrantsList from './GrantsList';
import { addTrackedGrant } from '@/lib/trackedGrants';
import ContactForm from './ContactForm';
import { subscribe } from '@/lib/subscriptionService';

const Landing: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingGrantId, setPendingGrantId] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Subscription form state
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { signInWithEmail, signUpWithEmail, resetPasswordRequest, user } = useAuth();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let userData;
      if (authMode === 'forgot') {
        await resetPasswordRequest({ email });
        setSuccessMessage('Password reset email sent! Check your inbox.');
        setEmail('');
        setTimeout(() => {
          setAuthMode('signin');
          setSuccessMessage('');
        }, 3000);
        setIsLoading(false);
        return;
      } else if (authMode === 'signin') {
        userData = await signInWithEmail({ email, password });
      } else {
        userData = await signUpWithEmail({ email, password });
      }

      // If there's a pending grant, track it
      if (pendingGrantId && userData?.user?.id) {
        addTrackedGrant(userData.user.id, pendingGrantId);
        setSuccessMessage('Grant successfully added to your tracking list!');
        setPendingGrantId(null);
        setAuthMessage('');

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
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

  const handleTrackApplication = (grantId: string) => {
    if (user) {
      // User is already authenticated, track immediately
      addTrackedGrant(user.id, grantId);
      setSuccessMessage('Grant successfully added to your tracking list!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } else {
      // User not authenticated, show auth modal
      setPendingGrantId(grantId);
      setAuthMode('signup');
      setAuthMessage('Please sign in to track this grant application');
      setShowAuthModal(true);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeLoading(true);
    setSubscribeMessage(null);

    try {
      const result = await subscribe(subscribeEmail, subscribeName || undefined);
      if (result.success) {
        setSubscribeMessage({ type: 'success', text: result.message });
        setSubscribeEmail('');
        setSubscribeName('');
      } else {
        setSubscribeMessage({ type: 'error', text: result.message });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setSubscribeMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubscribeLoading(false);
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
      {/* Success Message Banner */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-600 text-xl" />
              <p className="font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-green-600 hover:text-green-800"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-3">
              <Link
                href="/about"
                className="px-4 py-2 text-gray-600 font-medium hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors hidden sm:block"
              >
                About
              </Link>
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

          <GrantsList onTrackApplication={handleTrackApplication} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
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
      <section className="py-20 bg-gray-50">
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

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Four Winds
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Green Buffalo is proudly developed by <strong>Four Winds & Associates</strong>, an Indigenous-led organization
                dedicated to empowering First Nations, Metis, and Inuit communities across Canada through
                technology, sustainable development, and economic opportunities.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our mission is to bridge the gap between Indigenous communities and the funding resources
                they need to thrive. We are committed to Indigenous data sovereignty, adhering to OCAP
                principles, and offering comprehensive support services including grant writing, project
                planning, and development assistance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center text-center p-4 bg-teal-50 rounded-lg">
                  <FaHandshake className="text-3xl text-teal-600 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Community Partnerships</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-teal-50 rounded-lg">
                  <FaLeaf className="text-3xl text-teal-600 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Sustainable Growth</span>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-teal-50 rounded-lg">
                  <FaHeart className="text-3xl text-teal-600 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Indigenous Values</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Learn More About Us
                  <FaArrowRight className="text-sm" />
                </Link>
                <a
                  href="https://fourwinds.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-teal-600 text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                >
                  Visit Four Winds
                  <FaExternalLinkAlt className="text-sm" />
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl p-8 lg:p-12">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">Our Commitment</h4>
                  <p className="text-gray-600 text-sm">
                    We are committed to providing transparent, accessible, and culturally respectful
                    services that honor the sovereignty and self-determination of Indigenous peoples.
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">OCAP Principles</h4>
                  <p className="text-gray-600 text-sm">
                    We uphold Indigenous data sovereignty through Ownership, Control, Access, and
                    Possession principles in all our data handling practices.
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-2">Built by Indigenous, for Indigenous</h4>
                  <p className="text-gray-600 text-sm">
                    Every feature of Green Buffalo is designed with input from Indigenous community
                    members to ensure it meets real needs and respects cultural protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Contact Us
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Have questions about finding the right grants for your community? Need help navigating
                the application process? Our team is here to support you every step of the way.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUsers className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Community Support</h4>
                    <p className="text-gray-600 text-sm">Get personalized guidance for your community&apos;s unique funding needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaSearch className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Grant Research</h4>
                    <p className="text-gray-600 text-sm">We can help identify grants that match your project goals</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaHandshake className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Partnership Inquiries</h4>
                    <p className="text-gray-600 text-sm">Interested in collaborating? Let&apos;s discuss how we can work together</p>
                  </div>
                </div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section id="subscribe" className="py-20 bg-teal-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <FaEnvelope className="text-3xl text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Subscribe to Reminders & Updates
              </h3>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Stay informed about new grant opportunities, upcoming deadlines, and important updates
                for Indigenous communities across Canada.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="subscribe-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    id="subscribe-name"
                    type="text"
                    value={subscribeName}
                    onChange={(e) => setSubscribeName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="subscribe-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subscribe-email"
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {subscribeMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    subscribeMessage.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {subscribeMessage.type === 'success' ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaTimes className="text-red-600" />
                    )}
                    <span>{subscribeMessage.text}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={subscribeLoading}
                className="w-full bg-teal-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {subscribeLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <FaBell />
                    Subscribe to Updates
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                We respect your privacy. Unsubscribe at any time with one click.
              </p>
            </form>
          </div>
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
              <p className="text-sm mb-4">
                Empowering Indigenous communities through accessible funding opportunities
              </p>
              <p className="text-xs text-gray-400">
                A product of{' '}
                <a
                  href="https://fourwinds.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300"
                >
                  Four Winds
                </a>
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-teal-400 transition-colors"
                  >
                    About Four Winds
                  </Link>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-teal-400 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="https://fourwinds.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                  >
                    Privacy Policy
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://fourwinds.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                  >
                    Terms of Service
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-teal-400 transition-colors">
                    About Green Buffalo
                  </Link>
                </li>
                <li>
                  <a
                    href="https://fourwinds.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                  >
                    Resources
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://fourwinds.ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-400 transition-colors inline-flex items-center gap-1"
                  >
                    Get Help
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Green Buffalo Indigenous Grant Portal. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a
                href="https://fourwinds.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                fourwinds.ca
              </a>
              <a href="/admin" className="text-gray-500 hover:text-gray-400 transition-colors">
                Admin
              </a>
            </div>
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
                setAuthMessage('');
                setPendingGrantId(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-2xl" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {authMode === 'signin' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h3>
              <p className="text-gray-600">
                {authMessage || (authMode === 'signin'
                  ? 'Sign in to access your dashboard'
                  : authMode === 'signup'
                  ? 'Start your funding journey today'
                  : 'Enter your email to receive a password reset link')}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 text-sm">
                {successMessage}
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

              {authMode !== 'forgot' && (
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
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 text-white py-3 rounded-md font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Please wait...' : authMode === 'signin' ? 'Sign In' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center text-sm text-gray-600 mt-6 space-y-2">
              {authMode === 'signin' ? (
                <>
                  <p>
                    <button
                      onClick={() => {
                        setAuthMode('forgot');
                        setError('');
                        setAuthMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-teal-600 hover:text-teal-700 underline"
                    >
                      Forgot Password?
                    </button>
                  </p>
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setError('');
                        setAuthMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-teal-600 font-semibold hover:text-teal-700"
                    >
                      Sign Up
                    </button>
                  </p>
                </>
              ) : authMode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setError('');
                      setAuthMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-teal-600 font-semibold hover:text-teal-700"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Remember your password?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('signin');
                      setError('');
                      setAuthMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-teal-600 font-semibold hover:text-teal-700"
                  >
                    Back to Sign In
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
