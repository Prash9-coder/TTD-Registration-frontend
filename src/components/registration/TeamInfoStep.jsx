import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Shield, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useRegistrationStore } from '../../context/RegistrationContext';
import { API_URL } from '../../utils/constants';

const TeamInfoStep = ({ onNext }) => {
    const { teamData, setTeamInfo } = useRegistrationStore();

    const [formData, setFormData] = useState({
        teamName: teamData.team_name || '',
        membersCount: teamData.members_count || '',
        consent: teamData.consent_given || false
    });

    const [errors, setErrors] = useState({});

    // Team name validation states
    const [nameCheckStatus, setNameCheckStatus] = useState('idle'); // 'idle', 'checking', 'available', 'taken'
    const [nameCheckMessage, setNameCheckMessage] = useState('');

    // Debounced team name check
    useEffect(() => {
        if (!formData.teamName || formData.teamName.trim().length < 3) {
            setNameCheckStatus('idle');
            setNameCheckMessage('');
            return;
        }

        setNameCheckStatus('checking');
        setNameCheckMessage('Checking availability...');

        const timeoutId = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/teams/check-name/${encodeURIComponent(formData.teamName.trim())}`
                );
                const data = await response.json();

                if (data.success) {
                    if (data.exists) {
                        setNameCheckStatus('taken');
                        setNameCheckMessage('⚠️ Team name already exists. Please choose another.');
                        setErrors(prev => ({ ...prev, teamName: 'Team name already exists' }));
                    } else {
                        setNameCheckStatus('available');
                        setNameCheckMessage('✓ Team name is available!');
                        setErrors(prev => ({ ...prev, teamName: '' }));
                    }
                }
            } catch (error) {
                console.error('Team name check failed:', error);
                setNameCheckStatus('idle');
                setNameCheckMessage('');
            }
        }, 800); // Wait 800ms after user stops typing

        return () => clearTimeout(timeoutId);
    }, [formData.teamName]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        // Validate team name
        if (!formData.teamName.trim()) {
            newErrors.teamName = 'Team name is required';
        } else if (formData.teamName.trim().length < 3) {
            newErrors.teamName = 'Team name must be at least 3 characters';
        } else if (nameCheckStatus === 'taken') {
            newErrors.teamName = 'Team name already exists. Please choose another.';
        }

        // Validate members count
        if (!formData.membersCount) {
            newErrors.membersCount = 'Please select number of members';
        }

        // Validate consent
        if (!formData.consent) {
            newErrors.consent = 'You must provide consent to proceed';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Final check: ensure name is available
        if (nameCheckStatus !== 'available') {
            setErrors({ teamName: 'Please wait for team name validation' });
            return;
        }

        setTeamInfo(formData.teamName, parseInt(formData.membersCount), formData.consent);
        onNext();
    };

    const getNameInputClasses = () => {
        const baseClasses = "w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12";

        if (nameCheckStatus === 'available') {
            return `${baseClasses} border-green-500`;
        } else if (nameCheckStatus === 'taken' || errors.teamName) {
            return `${baseClasses} border-red-500`;
        }
        return `${baseClasses} border-gray-300`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    Step 1: Team Information
                </h2>
                <p className="text-gray-600 mt-2">Let's start by setting up your team details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Team Name with Real-time Validation */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Team Name *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={formData.teamName}
                            onChange={(e) => {
                                setFormData({ ...formData, teamName: e.target.value });
                            }}
                            className={getNameInputClasses()}
                            placeholder="Enter unique team name"
                            minLength={3}
                        />

                        {/* Status Icon */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            {nameCheckStatus === 'checking' && (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            )}
                            {nameCheckStatus === 'available' && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {nameCheckStatus === 'taken' && (
                                <XCircle className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    </div>

                    {/* Validation Messages */}
                    {nameCheckMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-sm mt-2 flex items-center gap-1 ${nameCheckStatus === 'available'
                                ? 'text-green-600'
                                : nameCheckStatus === 'taken'
                                    ? 'text-red-500'
                                    : 'text-blue-500'
                                }`}
                        >
                            {nameCheckMessage}
                        </motion.p>
                    )}

                    {errors.teamName && !nameCheckMessage && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        >
                            {errors.teamName}
                        </motion.p>
                    )}

                    {formData.teamName.trim().length > 0 && formData.teamName.trim().length < 3 && (
                        <p className="text-gray-500 text-sm mt-1">
                            {3 - formData.teamName.trim().length} more character(s) needed
                        </p>
                    )}
                </div>

                {/* Members Count */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Number of Members *
                    </label>
                    <select
                        value={formData.membersCount}
                        onChange={(e) => {
                            setFormData({ ...formData, membersCount: e.target.value });
                            setErrors({ ...errors, membersCount: '' });
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.membersCount ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <option value="">Select number of members</option>
                        {[10, 11, 12, 13, 14, 15].map(num => (
                            <option key={num} value={num}>{num} Members</option>
                        ))}
                    </select>
                    {errors.membersCount && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-1"
                        >
                            {errors.membersCount}
                        </motion.p>
                    )}
                </div>

                {/* Privacy Consent */}
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 rounded-xl ${errors.consent ? 'border-red-500' : 'border-yellow-200'
                        }`}
                >
                    <label className="flex items-start cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.consent}
                            onChange={(e) => {
                                setFormData({ ...formData, consent: e.target.checked });
                                setErrors({ ...errors, consent: '' });
                            }}
                            className="mt-1 mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">
                            <Shield className="w-5 h-5 inline text-yellow-600 mr-1" />
                            I hereby consent to the collection and processing of Aadhaar and personal data for verification purposes.
                            I have read and agree to the{' '}
                            <button type="button" className="text-blue-600 underline hover:text-blue-700">
                                Terms & Conditions
                            </button>{' '}
                            and{' '}
                            <button type="button" className="text-blue-600 underline hover:text-blue-700">
                                Privacy Policy
                            </button>.
                        </span>
                    </label>
                    {errors.consent && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-2"
                        >
                            {errors.consent}
                        </motion.p>
                    )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                    type="submit"
                    whileHover={{ scale: nameCheckStatus === 'available' ? 1.02 : 1 }}
                    whileTap={{ scale: nameCheckStatus === 'available' ? 0.98 : 1 }}
                    disabled={nameCheckStatus === 'checking' || nameCheckStatus === 'taken'}
                    className={`w-full px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${nameCheckStatus === 'checking' || nameCheckStatus === 'taken'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                        }`}
                >
                    {nameCheckStatus === 'checking' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Checking availability...
                        </>
                    ) : nameCheckStatus === 'taken' ? (
                        <>
                            <XCircle className="w-5 h-5" />
                            Team name not available
                        </>
                    ) : (
                        <>
                            Proceed to Member Details
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default TeamInfoStep;