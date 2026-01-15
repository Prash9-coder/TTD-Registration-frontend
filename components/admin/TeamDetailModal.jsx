import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Home } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';

const TeamDetailModal = ({ team, onClose }) => {
    if (!team) return null;

    // ✅ FIXED: Format date properly
    const formatDate = (date) => {
        if (!date) return 'N/A';

        // If already formatted as DD-MM-YYYY, return as is
        if (typeof date === 'string' && date.match(/^\d{2}-\d{2}-\d{4}$/)) {
            return date;
        }

        // Otherwise, format the date
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';

        return d.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{team.team_name}</h2>
                            <p className="text-orange-100">
                                {team.members_count} Members •
                                Status: {team.submission_status} •
                                Registered: {formatDate(team.submittedAt)}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
                        <div className="space-y-6">
                            {team.members.map((member, index) => {
                                const photoUrl = member.photo_path || member.photo;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all"
                                    >
                                        <div className="flex gap-6 items-start">
                                            {/* Photo */}
                                            <div className="flex-shrink-0">
                                                {photoUrl ? (
                                                    <img
                                                        src={getImageUrl(photoUrl)}
                                                        alt={member.name}
                                                        className="w-32 h-40 rounded-lg object-cover border-4 border-white shadow-lg"
                                                        onError={(e) => {
                                                            console.error('Image load failed:', member.name, photoUrl);
                                                            e.target.style.display = 'none';
                                                            const fallback = e.target.nextElementSibling;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}

                                                <div
                                                    className="w-32 h-40 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-lg"
                                                    style={{ display: photoUrl ? 'none' : 'flex' }}
                                                >
                                                    {(member.name || '')[0] || '?'}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                    {member.name}
                                                </h3>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {/* Personal Info */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Calendar className="w-4 h-4 text-orange-600" />
                                                            <span className="font-semibold">DOB:</span>
                                                            <span>{member.dob || 'N/A'}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <User className="w-4 h-4 text-orange-600" />
                                                            <span className="font-semibold">Age:</span>
                                                            <span>{member.age || 'N/A'} years</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <User className="w-4 h-4 text-orange-600" />
                                                            <span className="font-semibold">Gender:</span>
                                                            <span>{member.gender || 'N/A'}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <CreditCard className="w-4 h-4 text-orange-600" />
                                                            <span className="font-semibold">Aadhaar:</span>
                                                            <span className="font-mono">{member.id_number || 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Contact Info */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Phone className="w-4 h-4 text-green-600" />
                                                            <span className="font-semibold">Mobile:</span>
                                                            <span>{member.mobile || 'N/A'}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <Mail className="w-4 h-4 text-blue-600" />
                                                            <span className="font-semibold">Email:</span>
                                                            <span className="truncate text-sm">{member.email || 'N/A'}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-gray-700">
                                                            <MapPin className="w-4 h-4 text-red-600" />
                                                            <span className="font-semibold">Temple:</span>
                                                            <span className="text-sm">{member.nearest_ttd_temple || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Address */}
                                                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                                        <Home className="w-4 h-4 text-purple-600" />
                                                        Address
                                                    </h4>
                                                    <p className="text-gray-700 text-sm">
                                                        {member.doorno && `${member.doorno}, `}
                                                        {member.street && `${member.street}, `}
                                                        {member.city && `${member.city}, `}
                                                        {member.district && `${member.district}, `}
                                                        {member.state && `${member.state} - `}
                                                        {member.pincode || ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TeamDetailModal;