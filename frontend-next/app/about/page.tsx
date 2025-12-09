"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaArrowLeft,
  FaArrowRight,
  FaHandshake,
  FaLeaf,
  FaHeart,
  FaShieldAlt,
  FaPencilAlt,
  FaProjectDiagram,
  FaDatabase,
  FaSync,
  FaExternalLinkAlt,
  FaUsers,
  FaCheckCircle,
  FaBell,
} from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-teal-700 font-semibold hover:bg-teal-50 rounded-md transition-colors"
            >
              <FaArrowLeft />
              Back to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                About Four Winds & Associates
              </h2>
              <p className="text-xl text-teal-50 max-w-2xl">
                An Indigenous-led organization dedicated to empowering First Nations, Metis, and Inuit
                communities through technology, sustainable development, and economic opportunities.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <Image
                  src="/greenbuffalo_logo.png"
                  alt="Four Winds Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h3>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 md:p-12 border border-teal-100">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Four Winds & Associates is committed to <strong>bridging the gap between Indigenous communities
                and the funding resources they need to thrive</strong>. We believe in building tools that respect
                traditional values while embracing modern solutions for community development.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our work is guided by the principle that Indigenous communities should have equal access to
                economic opportunities, and that technology can be a powerful tool for self-determination
                when developed with cultural awareness and community input.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Indigenous Grant Portal Purpose */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Indigenous Grant Portal Purpose & Goals
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The Green Buffalo Indigenous Grant Portal was created with a clear mission: to simplify
              and democratize access to funding opportunities for Indigenous communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FaDatabase className="text-2xl text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Centralized Information</h4>
              <p className="text-gray-600">
                Aggregate grant opportunities from federal, provincial, and private sources into one
                easy-to-navigate platform, eliminating the need to search multiple websites.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FaUsers className="text-2xl text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Community Empowerment</h4>
              <p className="text-gray-600">
                Enable Indigenous communities to independently discover and pursue funding opportunities
                that align with their development priorities and cultural values.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FaCheckCircle className="text-2xl text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Increase Success Rates</h4>
              <p className="text-gray-600">
                Provide timely deadline reminders, eligibility information, and expert support services
                to help communities submit stronger, more competitive applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grant Sourcing & Updates */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Grant Update Frequency & Sourcing
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaSync className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Regular Updates</h4>
                    <p className="text-gray-600">
                      Our database is updated regularly to ensure you have access to the latest grant
                      opportunities. New grants are added as soon as they become available.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaDatabase className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Verified Sources</h4>
                    <p className="text-gray-600">
                      We source grant information directly from official government websites, funding
                      agencies, and verified private foundation announcements to ensure accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaBell className="text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI-Assisted Research</h4>
                    <p className="text-gray-600">
                      We use advanced AI tools to continuously scan for new Indigenous-focused funding
                      opportunities, which are then verified by our team before being added to the portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Our Grant Sources Include:</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-600 flex-shrink-0" />
                  <span>Indigenous Services Canada (ISC)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-600 flex-shrink-0" />
                  <span>Crown-Indigenous Relations and Northern Affairs</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-600 flex-shrink-0" />
                  <span>Natural Resources Canada (NRCan)</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-600 flex-shrink-0" />
                  <span>Environment and Climate Change Canada</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-600 flex-shrink-0" />
                  <span>Provincial Indigenous Affairs Ministries</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="text-teal-600 flex-shrink-0" />
                  <span>Private Foundations & Corporate Programs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OCAP Principles Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full mb-4">
              <FaShieldAlt className="text-3xl" />
            </div>
            <h3 className="text-3xl font-bold mb-4">
              Indigenous Data Sovereignty & OCAP Principles
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We are deeply committed to respecting and upholding Indigenous data sovereignty through
              adherence to the OCAP principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-teal-400 mb-3">O</div>
              <h4 className="text-xl font-bold mb-2">Ownership</h4>
              <p className="text-gray-300 text-sm">
                Indigenous communities own their cultural knowledge, data, and information collectively.
                We recognize that communities have the right to own information about themselves.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-teal-400 mb-3">C</div>
              <h4 className="text-xl font-bold mb-2">Control</h4>
              <p className="text-gray-300 text-sm">
                Indigenous peoples have the right to control all aspects of data management and research
                processes affecting them. We ensure communities maintain control over their information.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-teal-400 mb-3">A</div>
              <h4 className="text-xl font-bold mb-2">Access</h4>
              <p className="text-gray-300 text-sm">
                Indigenous peoples have the right to access data about themselves and their communities.
                Our portal provides transparent, barrier-free access to funding information.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-teal-400 mb-3">P</div>
              <h4 className="text-xl font-bold mb-2">Possession</h4>
              <p className="text-gray-300 text-sm">
                Physical control of data is essential for ownership and control. User data remains
                protected, and communities determine how their information is stored and shared.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white/5 rounded-xl p-6 border border-white/10 max-w-4xl mx-auto">
            <p className="text-gray-300 text-center">
              <strong className="text-white">Our Commitment:</strong> Any data collected through this portal
              is handled with the utmost respect for Indigenous data sovereignty. We do not share, sell,
              or use community data for purposes other than providing grant services. Communities retain
              full control over their application information and can request data deletion at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Support Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Four Winds Support Services
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond the grant portal, Four Winds offers comprehensive support services to help
              Indigenous communities achieve their development goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <FaPencilAlt className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Grant Writing Services</h4>
              <p className="text-gray-600 mb-4">
                Our experienced grant writers work directly with communities to develop compelling
                proposals that effectively communicate your vision and needs.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Proposal development and editing</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Budget preparation and justification</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Application review and feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Letters of support coordination</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <FaProjectDiagram className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Project Planning</h4>
              <p className="text-gray-600 mb-4">
                We help communities transform ideas into actionable project plans with clear
                objectives, timelines, and measurable outcomes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Strategic planning sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Project scope and feasibility analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Timeline and milestone development</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Risk assessment and mitigation</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 border border-teal-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <FaHandshake className="text-2xl text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Project Development</h4>
              <p className="text-gray-600 mb-4">
                From concept to completion, we provide ongoing support to help communities
                successfully implement and manage funded projects.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Implementation guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Progress monitoring and reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Stakeholder engagement support</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Capacity building workshops</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-700 transition-colors"
            >
              Request Support Services
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHandshake className="text-3xl text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Community Partnerships</h4>
              <p className="text-gray-600">
                We work alongside communities as partners, not providers, ensuring solutions are
                developed collaboratively and meet real needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-3xl text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Sustainable Growth</h4>
              <p className="text-gray-600">
                We prioritize long-term, sustainable solutions that build community capacity and
                support environmental stewardship.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart className="text-3xl text-teal-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Indigenous Values</h4>
              <p className="text-gray-600">
                Every aspect of our work honors Indigenous worldviews, traditional knowledge, and
                the right to self-determination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Funding Journey?
          </h3>
          <p className="text-xl mb-8 text-teal-50">
            Explore our grant database or reach out to learn more about our support services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-teal-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-teal-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              Explore Grants
              <FaArrowRight />
            </Link>
            <a
              href="https://fourwinds.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              Visit Four Winds
              <FaExternalLinkAlt />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Image
                src="/greenbuffalo_logo.png"
                alt="Green Buffalo Logo"
                width={30}
                height={30}
                className="object-contain"
              />
              <span>&copy; {new Date().getFullYear()} Green Buffalo Indigenous Grant Portal. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://fourwinds.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                fourwinds.ca
              </a>
              <Link href="/" className="text-gray-400 hover:text-teal-400 transition-colors">
                Back to Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
