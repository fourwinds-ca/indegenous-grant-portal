"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
  FaDollarSign,
  FaCalendarAlt,
  FaBuilding,
  FaExternalLinkAlt,
  FaBookmark,
  FaCheck,
  FaShareAlt,
  FaEnvelope,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaTimes,
  FaHandsHelping,
} from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { isGrantTracked } from '@/lib/trackedGrants';
import ContactForm from './ContactForm';

interface GrantCardProps {
  grant: {
    id: string;
    title: string;
    description: string;
    agency: string;
    category: string;
    eligibility: string;
    applicationLink: string;
    deadline: string;
    amount: string;
    currency: string;
    status: string;
  };
  onApply?: (grantId: string) => void;
}

const categoryColors: Record<string, string> = {
  'Environment': 'bg-green-100 text-green-800 border-green-300',
  'Infrastructure': 'bg-slate-100 text-slate-800 border-slate-300',
  'Electric Vehicles': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Economic Development': 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const GrantCard: React.FC<GrantCardProps> = ({ grant, onApply }) => {
  const { user } = useAuth();
  const tracked = user ? isGrantTracked(user.id, grant.id) : false;
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://greenbuffalo.ca';

  const getShareText = () => {
    return `Check out this Indigenous grant opportunity: ${grant.title} from ${grant.agency}. Apply before ${formatDate(grant.deadline)}!`;
  };

  const getShareUrl = () => {
    return `${portalUrl}?grant=${grant.id}`;
  };

  const shareOptions = [
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'text-gray-600 hover:text-gray-800',
      onClick: () => {
        const subject = encodeURIComponent(`Indigenous Grant Opportunity: ${grant.title}`);
        const body = encodeURIComponent(`${getShareText()}\n\nLearn more at: ${getShareUrl()}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        setShowShareMenu(false);
      },
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: 'text-sky-500 hover:text-sky-600',
      onClick: () => {
        const text = encodeURIComponent(getShareText());
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        setShowShareMenu(false);
      },
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'text-blue-600 hover:text-blue-700',
      onClick: () => {
        const url = encodeURIComponent(getShareUrl());
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        setShowShareMenu(false);
      },
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'text-blue-700 hover:text-blue-800',
      onClick: () => {
        const url = encodeURIComponent(getShareUrl());
        const title = encodeURIComponent(grant.title);
        const summary = encodeURIComponent(getShareText());
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`, '_blank');
        setShowShareMenu(false);
      },
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'text-green-500 hover:text-green-600',
      onClick: () => {
        const text = encodeURIComponent(`${getShareText()}\n\n${getShareUrl()}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setShowShareMenu(false);
      },
    },
  ];

  const formatCurrency = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleApply = () => {
    if (onApply) {
      onApply(grant.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative">
      <div className="p-6 flex-1 flex flex-col">
        {/* Header with Category Badge and Share Button */}
        <div className="flex items-start justify-between mb-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
              categoryColors[grant.category] || 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          >
            {grant.category}
          </span>

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
              title="Share this grant"
            >
              <FaShareAlt className="w-4 h-4" />
            </button>

            {/* Share Dropdown Menu */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[160px]">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Share via</span>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${option.color}`}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {grant.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {grant.description}
        </p>

        {/* Grant Details */}
        <div className="space-y-3 mb-4">
          {/* Agency */}
          <div className="flex items-start gap-2 text-sm">
            <FaBuilding className="text-teal-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-700">Agency:</span>
              <span className="text-gray-600 ml-1">{grant.agency}</span>
            </div>
          </div>

          {/* Funding Amount - Hidden */}
          {/* <div className="flex items-start gap-2 text-sm">
            <FaDollarSign className="text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-700">Funding:</span>
              <span className="text-emerald-700 font-bold ml-1">
                {formatCurrency(grant.amount)}
              </span>
            </div>
          </div> */}

          {/* Deadline */}
          <div className="flex items-start gap-2 text-sm">
            <FaCalendarAlt className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-gray-700">Deadline:</span>
              <span className="text-gray-600 ml-1">{formatDate(grant.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-teal-50 border border-teal-200 rounded-md p-3 mb-4">
          <p className="text-xs font-semibold text-teal-900 mb-1">Eligibility:</p>
          <p className="text-xs text-teal-800">{grant.eligibility}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-auto">
          {/* Primary Actions Row */}
          <div className="flex gap-3">
            {tracked ? (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-md cursor-default text-sm border border-green-300"
              >
                <FaCheck />
                Tracked
              </button>
            ) : (
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm"
              >
                <FaBookmark />
                Track Grant
              </button>
            )}
            <a
              href={grant.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-teal-600 font-semibold py-2 px-4 rounded-md border-2 border-teal-600 transition-colors duration-200 text-sm"
            >
              Apply
              <FaExternalLinkAlt className="text-xs" />
            </a>
          </div>

          {/* Request Support Button */}
          <button
            onClick={() => setShowSupportModal(true)}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 font-medium py-2.5 px-4 rounded-md border border-amber-200 transition-all duration-200 text-sm group"
          >
            <Image
              src="/greenbuffalo_logo.png"
              alt="Four Winds"
              width={40}
              height={40}
              className="object-contain"
            />
            <span>Request Support</span>
            <FaHandsHelping className="text-amber-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowShareMenu(false)}
        />
      )}

      {/* Request Support Modal */}
      {showSupportModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowSupportModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/greenbuffalo_logo.png"
                      alt="Green Buffalo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">Request Support</h3>
                      <p className="text-teal-100 text-sm">Get help with your grant application</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSupportModal(false)}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Grant Info */}
              <div className="px-6 py-4 bg-teal-50 border-b border-teal-100">
                <p className="text-sm text-teal-700 font-medium mb-1">Regarding Grant:</p>
                <p className="text-teal-900 font-semibold">{grant.title}</p>
                <p className="text-sm text-teal-600">{grant.agency}</p>
              </div>

              {/* Contact Form */}
              <div className="p-6">
                <ContactForm
                  initialSubject={`Grant Support Request: ${grant.title}`}
                  initialMessage={`I would like to request support for the following grant:\n\nGrant: ${grant.title}\nAgency: ${grant.agency}\nDeadline: ${formatDate(grant.deadline)}\n\nPlease describe your needs:\n`}
                  onSuccess={() => {
                    setTimeout(() => setShowSupportModal(false), 2000);
                  }}
                  compact
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GrantCard;
