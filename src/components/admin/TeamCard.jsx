import React from 'react';
import { motion } from 'framer-motion';
import { Eye, FileDown, Printer, Download, CheckCircle, Trash2, Image, Edit2 } from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';

const TeamCard = ({ team, index, onViewDetails, onExportPDF, onPrint, onExportJSON, onDownloadPhotos, onVerify, onDelete, onEdit, onPrintTransparent }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{team.team_name}</h2>
                        <p className="text-orange-100">
                            <span className="font-semibold">{team.members_count} Members</span> •
                            Registered on {formatDate(team.submittedAt)}
                        </p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusColor(team.submission_status)}`}>
                        {team.submission_status.charAt(0).toUpperCase() + team.submission_status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(team)}
                    className="flex-1 min-w-[100px] bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewDetails(team)}
                    className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onExportPDF(team)}
                    className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <FileDown className="w-4 h-4" />
                    PDF
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPrint(team)}
                    className="flex-1 min-w-[100px] bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Printer className="w-4 h-4" />
                    Print
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPrintTransparent(team)}
                    className="flex-1 min-w-[100px] bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Printer className="w-4 h-4" />
                    Transparent
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onExportJSON(team)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    JSON
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDownloadPhotos(team)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Image className="w-4 h-4" />
                    Photos
                </motion.button>

                {team.submission_status !== 'verified' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onVerify(team._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(team)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </motion.button>
            </div>

            {/* Members Preview */}
            <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Team Members ({team.members.length})</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {team.members.map((member, idx) => {
                        // ✅ FIXED: Use photo_path or photo
                        const photoUrl = member.photo_path || member.photo;

                        return (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                className="border-2 border-gray-200 rounded-xl p-3 flex gap-3 items-center hover:border-blue-300 transition-all"
                            >
                                {/* ✅ FIXED: Use getImageUrl with photo_path */}
                                {photoUrl ? (
                                    <img
                                        src={getImageUrl(photoUrl)}
                                        alt={member.name}
                                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-300"
                                        onError={(e) => {
                                            console.error('Image load failed:', member.name, photoUrl);
                                            e.target.style.display = 'none';
                                            const fallback = e.target.nextElementSibling;
                                            if (fallback && fallback.classList.contains('fallback-avatar')) {
                                                fallback.style.display = 'flex';
                                            }
                                        }}
                                    />
                                ) : null}

                                {/* Fallback Avatar */}
                                <div
                                    className="fallback-avatar w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-2xl border-2 border-orange-300 shadow-lg"
                                    style={{ display: photoUrl ? 'none' : 'flex' }}
                                >
                                    {(member.name || '?')[0]?.toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate">{member.name}</h4>
                                    <p className="text-sm text-gray-600">{member.age} years • {member.gender}</p>
                                    <p className="text-xs text-gray-500 truncate">{member.city || member.state}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default TeamCard;