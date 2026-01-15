import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, User, MapPin, Phone, Mail, Eye, EyeOff } from 'lucide-react';
import { useRegistrationStore } from '../../context/RegistrationContext';
import { useToast } from '../common/ToastContainer';
import { submitTeam } from '../../services/api';
import { getImageUrl } from '../../utils/imageHelper';

const ReviewStep = ({ onPrevious, onSuccess }) => {
    const { teamData } = useRegistrationStore();
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showJson, setShowJson] = useState(false);

    const handleSubmit = async () => {
        if (!window.confirm('Are you sure you want to submit this team registration?')) {
            return;
        }

        setIsSubmitting(true);
        showToast('Submitting registration...', 'info', 'Processing');

        try {
            // Validate all photos are uploaded
            const missingPhotos = teamData.members.filter((m, i) => {
                const hasPhoto = m.photo && typeof m.photo === 'string' && m.photo.startsWith('http');
                if (!hasPhoto) {
                    console.error(`Member ${i + 1} (${m.name}) missing photo:`, m.photo);
                }
                return !hasPhoto;
            });

            if (missingPhotos.length > 0) {
                throw new Error(`${missingPhotos.length} member(s) are missing photos. Please upload all photos.`);
            }

            // Build payload with Cloudinary URLs
            const submitPayload = {
                team_name: teamData.team_name,
                members_count: teamData.members_count,
                consent_given: teamData.consent_given || true,
                members: teamData.members.map((member, index) => {
                    console.log(`Member ${index + 1} photo:`, member.photo);

                    return {
                        name: member.name,
                        dob: member.dob,
                        age: Number(member.age),
                        gender: member.gender,
                        id_proof_type: 'Aadhaar',
                        id_number: member.id_number,
                        mobile: member.mobile,
                        email: member.email,
                        state: member.state,
                        district: member.district,
                        city: member.city,
                        street: member.street,
                        doorno: member.doorno,
                        pincode: member.pincode,
                        nearest_ttd_temple: member.nearest_ttd_temple,
                        photo_path: member.photo  // ✅ Cloudinary URL
                    };
                })
            };

            console.log('📤 Submitting payload:', submitPayload);

            const result = await submitTeam(submitPayload);

            if (result.success) {
                showToast(
                    `Team "${teamData.team_name}" registered successfully! 🎉`,
                    'success',
                    'Registration Successful!',
                    5000
                );
                onSuccess();
            } else {
                throw new Error(result.message || 'Registration failed');
            }

        } catch (error) {
            console.error('❌ Submission error:', error);
            showToast(
                error.message || 'Failed to submit registration. Please try again.',
                'error',
                'Submission Failed',
                5000
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const jsonPayload = {
        team_name: teamData.team_name,
        members_count: teamData.members_count,
        consent_given: teamData.consent_given || true,
        members: teamData.members.map(m => ({
            name: m.name,
            dob: m.dob,
            age: m.age,
            gender: m.gender,
            id_proof_type: 'Aadhaar',
            id_number: m.id_number,
            mobile: m.mobile,
            email: m.email,
            address: {
                state: m.state,
                district: m.district,
                city: m.city,
                street: m.street,
                doorno: m.doorno,
                pincode: m.pincode
            },
            nearest_ttd_temple: m.nearest_ttd_temple,
            photo_path: m.photo
        }))
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            {/* Team Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Summary</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Team Name</p>
                        <p className="text-xl font-bold text-gray-800">{teamData.team_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Members</p>
                        <p className="text-xl font-bold text-gray-800">{teamData.members_count}</p>
                    </div>
                </div>
            </div>

            {/* Members Summary */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Team Members</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamData.members.map((member, index) => {
                        // ✅ FIXED: Use photo or photo_path
                        const photoUrl = member.photo || member.photo_path;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    {/* ✅ FIXED: Use getImageUrl with photo */}
                                    {photoUrl ? (
                                        <img
                                            src={getImageUrl(photoUrl)}
                                            alt={member.name}
                                            className="w-20 h-20 rounded-lg object-cover border-2 border-blue-200 flex-shrink-0"
                                            onError={(e) => {
                                                console.error('Image failed to load:', member.name, photoUrl);
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}

                                    {/* Fallback avatar */}
                                    <div
                                        className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-blue-300 shadow-lg flex-shrink-0"
                                        style={{ display: photoUrl ? 'none' : 'flex' }}
                                    >
                                        {(member.name || '?')[0]?.toUpperCase()}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 truncate flex items-center gap-1">
                                            <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            {member.name}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Age: {member.age} | {member.gender}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Phone className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{member.mobile}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                            <Mail className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{member.email}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                                            <MapPin className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{member.city}, {member.state}</span>
                                        </p>

                                        {/* Photo status indicator */}
                                        {photoUrl && photoUrl.startsWith('http') ? (
                                            <p className="text-xs text-green-600 mt-1">✓ Photo uploaded</p>
                                        ) : (
                                            <p className="text-xs text-red-600 mt-1">⚠ Photo missing</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* JSON Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">JSON Payload Preview</h3>
                    <button
                        onClick={() => setShowJson(!showJson)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {showJson ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showJson ? 'Hide' : 'Show'}
                    </button>
                </div>

                {showJson && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-gray-900 rounded-xl p-4 overflow-x-auto"
                    >
                        <pre className="text-green-400 text-xs">
                            {JSON.stringify(jsonPayload, null, 2)}
                        </pre>
                    </motion.div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
                <motion.button
                    onClick={onPrevious}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Edit
                </motion.button>

                <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Registration
                        </>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default ReviewStep;