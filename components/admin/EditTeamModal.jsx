import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Edit2, Save, User, Home, AlertTriangle, 
    Camera, Upload, Trash2, Image, RefreshCw 
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageHelper';
import { API_URL } from '../../utils/constants';

// ✅ DATE FORMAT HELPERS
const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Convert DD-MM-YYYY to YYYY-MM-DD
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
    }
    
    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date string
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {
        console.warn('Could not parse date:', dateStr);
    }
    
    return '';
};

const formatDateForStorage = (dateStr) => {
    if (!dateStr) return '';
    
    // Convert YYYY-MM-DD to DD-MM-YYYY for storage
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    }
    
    return dateStr;
};

const EditTeamModal = ({ team, onClose, onSave }) => {
    const [editedTeam, setEditedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingPhoto, setUploadingPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState({});
    const fileInputRefs = useRef({});

    // ✅ Initialize with proper date formatting
    useEffect(() => {
        if (team) {
            console.log('📥 Loading team for edit:', team._id);
            console.log('📅 Original member DOBs:', team.members?.map(m => m.dob));
            
            // Deep copy and format dates
            const deepCopy = JSON.parse(JSON.stringify(team));
            
            // Format dates for each member
            if (deepCopy.members && Array.isArray(deepCopy.members)) {
                deepCopy.members = deepCopy.members.map(member => ({
                    ...member,
                    dob: formatDateForInput(member.dob)
                }));
            }
            
            console.log('📅 Formatted member DOBs:', deepCopy.members?.map(m => m.dob));
            
            setEditedTeam(deepCopy);
            setLoading(false);
        }
    }, [team]);

    if (!editedTeam || loading) return null;

    const handleInputChange = (memberIndex, field, value) => {
        const updatedMembers = [...editedTeam.members];
        updatedMembers[memberIndex] = {
            ...updatedMembers[memberIndex],
            [field]: value
        };
        setEditedTeam({ ...editedTeam, members: updatedMembers });
    };

    const handleTeamNameChange = (e) => {
        setEditedTeam({ ...editedTeam, team_name: e.target.value });
    };

    const handleAdminNotesChange = (e) => {
        setEditedTeam({ ...editedTeam, admin_notes: e.target.value });
    };

    // ✅ Handle Photo Click
    const handlePhotoClick = (memberIndex) => {
        if (fileInputRefs.current[memberIndex]) {
            fileInputRefs.current[memberIndex].click();
        }
    };

    // ✅ Handle Photo Selection
    const handlePhotoChange = async (memberIndex, event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPG, PNG, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(prev => ({
                ...prev,
                [memberIndex]: reader.result
            }));
        };
        reader.readAsDataURL(file);

        await uploadPhotoToCloudinary(memberIndex, file);
    };

    // ✅ Upload Photo to Cloudinary
    const uploadPhotoToCloudinary = async (memberIndex, file) => {
        setUploadingPhoto(memberIndex);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'ttd_unsigned');
            formData.append('folder', 'ttd-registrations');

            const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dnly2saob';
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            
            const updatedMembers = [...editedTeam.members];
            updatedMembers[memberIndex].photo_path = data.secure_url;
            updatedMembers[memberIndex].photo = data.secure_url;
            updatedMembers[memberIndex].photo_public_id = data.public_id;
            setEditedTeam({ ...editedTeam, members: updatedMembers });

            console.log('✅ Photo uploaded:', data.secure_url);

        } catch (error) {
            console.error('❌ Photo upload error:', error);
            alert('Failed to upload photo. Please try again.');
            setPhotoPreview(prev => {
                const newPreview = { ...prev };
                delete newPreview[memberIndex];
                return newPreview;
            });
        } finally {
            setUploadingPhoto(null);
        }
    };

    // ✅ Remove Photo
    const handleRemovePhoto = (memberIndex) => {
        const updatedMembers = [...editedTeam.members];
        updatedMembers[memberIndex].photo_path = null;
        updatedMembers[memberIndex].photo = null;
        setEditedTeam({ ...editedTeam, members: updatedMembers });
        
        setPhotoPreview(prev => {
            const newPreview = { ...prev };
            delete newPreview[memberIndex];
            return newPreview;
        });
    };

    // ✅ Get Photo Source
    const getPhotoSrc = (member, memberIndex) => {
        if (photoPreview[memberIndex]) {
            return photoPreview[memberIndex];
        }
        return getImageUrl(member.photo_path || member.photo);
    };

    // ✅ Validate Form
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!editedTeam.team_name || editedTeam.team_name.trim().length < 3) {
            newErrors.team_name = 'Team name must be at least 3 characters';
            isValid = false;
        }

        editedTeam.members.forEach((member, index) => {
            const memberErrors = {};

            if (!member.name || member.name.trim().length < 2) {
                memberErrors.name = 'Name is required';
                isValid = false;
            }

            if (Object.keys(memberErrors).length > 0) {
                newErrors[`member_${index}`] = memberErrors;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    // ✅ SAVE HANDLER - Uses API_URL from constants
    const handleSave = async () => {
        if (uploadingPhoto !== null) {
            alert('Please wait for photo upload to complete');
            return;
        }
        
        if (!validateForm()) {
            alert('Please fix validation errors before saving');
            return;
        }

        setSaving(true);

        try {
            const teamId = editedTeam._id;
            
            // ✅ Convert dates back to storage format (DD-MM-YYYY)
            const membersForSave = editedTeam.members.map(member => ({
                ...member,
                dob: formatDateForStorage(member.dob),
                // Map field names for backend
                id_number: member.id_number_full || member.id_number,
                mobile: member.mobile_full || member.mobile
            }));
            
            const saveData = {
                team_name: editedTeam.team_name,
                admin_notes: editedTeam.admin_notes,
                members: membersForSave,
                submission_status: editedTeam.submission_status
            };

            console.log('📤 Saving team:', teamId);
            console.log('🌐 API URL:', `${API_URL}/api/teams/${teamId}`);
            console.log('📦 Save data:', saveData);

            const response = await fetch(`${API_URL}/api/teams/${teamId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData)
            });

            const data = await response.json();
            console.log('📥 Response:', data);

            if (data.success) {
                alert('✅ Team updated successfully!');
                onSave(data.team || editedTeam);
                onClose();
            } else {
                alert('❌ Error: ' + (data.message || 'Update failed'));
            }
        } catch (error) {
            console.error('❌ Update error:', error);
            alert('Failed to update team: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                <Edit2 className="w-8 h-8" />
                                Edit Team: {editedTeam.team_name}
                            </h2>
                            <p className="text-blue-100">
                                {editedTeam.members_count || editedTeam.members?.length} Members •
                                Status: {editedTeam.submission_status} •
                                ID: {editedTeam._id?.slice(-8)}
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
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="space-y-6">
                            {/* Team Info Section */}
                            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <User className="w-6 h-6 text-blue-600" />
                                    Team Information
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Team Name *</label>
                                            <input
                                                type="text"
                                                value={editedTeam.team_name}
                                                onChange={handleTeamNameChange}
                                                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.team_name ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="Enter team name"
                                            />
                                            {errors.team_name && (
                                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    {errors.team_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Notes</label>
                                            <textarea
                                                value={editedTeam.admin_notes || ''}
                                                onChange={handleAdminNotesChange}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows="3"
                                                placeholder="Add admin notes (optional)"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Team Status */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Submission Status</label>
                                            <select
                                                value={editedTeam.submission_status || 'pending'}
                                                onChange={(e) => setEditedTeam({ ...editedTeam, submission_status: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="verified">Verified</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Team ID</label>
                                            <input
                                                type="text"
                                                value={editedTeam._id}
                                                disabled
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">API Endpoint</label>
                                            <input
                                                type="text"
                                                value={`${API_URL}/api/teams/${editedTeam._id}`}
                                                disabled
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Members Section */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Members ({editedTeam.members?.length || 0})
                                </h3>
                                
                                {editedTeam.members?.map((member, memberIndex) => {
                                    const memberErrorKey = `member_${memberIndex}`;
                                    const memberErrors = errors[memberErrorKey] || {};
                                    const photoSrc = getPhotoSrc(member, memberIndex);
                                    const isUploading = uploadingPhoto === memberIndex;

                                    return (
                                        <motion.div
                                            key={memberIndex}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: memberIndex * 0.05 }}
                                            className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200"
                                        >
                                            <div className="flex gap-6 items-start flex-wrap lg:flex-nowrap">
                                                {/* Photo Section */}
                                                <div className="flex-shrink-0">
                                                    <div className="relative group">
                                                        <div 
                                                            className={`w-32 h-40 rounded-xl overflow-hidden border-3 
                                                                ${isUploading ? 'border-blue-500 animate-pulse' : 'border-gray-300'} 
                                                                shadow-lg cursor-pointer transition-all duration-300
                                                                group-hover:border-blue-500 group-hover:shadow-xl`}
                                                            onClick={() => !isUploading && handlePhotoClick(memberIndex)}
                                                        >
                                                            {photoSrc ? (
                                                                <img
                                                                    src={photoSrc}
                                                                    alt={member.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        if (e.target.nextSibling) {
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                            ) : null}
                                                            
                                                            <div 
                                                                className={`w-full h-full bg-gradient-to-br from-orange-400 to-red-500 
                                                                    flex items-center justify-center text-white text-4xl font-bold
                                                                    ${photoSrc ? 'hidden' : 'flex'}`}
                                                            >
                                                                {(member.name || '?')[0]?.toUpperCase()}
                                                            </div>

                                                            {isUploading && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                                                                </div>
                                                            )}

                                                            {!isUploading && (
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                                                    transition-opacity duration-300 flex items-center justify-center">
                                                                    <div className="text-center text-white">
                                                                        <Camera className="w-6 h-6 mx-auto mb-1" />
                                                                        <span className="text-xs font-medium">Change</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <input
                                                            type="file"
                                                            ref={(el) => fileInputRefs.current[memberIndex] = el}
                                                            onChange={(e) => handlePhotoChange(memberIndex, e)}
                                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                                            className="hidden"
                                                        />

                                                        <div className="flex gap-1 mt-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handlePhotoClick(memberIndex)}
                                                                disabled={isUploading}
                                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white 
                                                                    py-1.5 px-2 rounded-lg text-xs font-medium 
                                                                    flex items-center justify-center gap-1
                                                                    disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <Upload className="w-3 h-3" />
                                                                Upload
                                                            </motion.button>
                                                            
                                                            {(photoSrc || photoPreview[memberIndex]) && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleRemovePhoto(memberIndex)}
                                                                    disabled={isUploading}
                                                                    className="bg-red-500 hover:bg-red-600 text-white 
                                                                        py-1.5 px-2 rounded-lg text-xs font-medium
                                                                        disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </motion.button>
                                                            )}
                                                        </div>

                                                        <p className="text-xs text-center mt-1 text-gray-500">
                                                            {isUploading ? (
                                                                <span className="text-blue-600">Uploading...</span>
                                                            ) : photoSrc ? (
                                                                <span className="text-green-600">✓ Photo</span>
                                                            ) : (
                                                                <span className="text-orange-600">No Photo</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Member Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                                            #{memberIndex + 1}
                                                        </span>
                                                        {member.name || 'New Member'}
                                                    </h4>

                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {/* Name */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                                                            <input
                                                                type="text"
                                                                value={member.name || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'name', e.target.value)}
                                                                className={`w-full px-3 py-2 border-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${memberErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                                                placeholder="Full name"
                                                            />
                                                        </div>

                                                        {/* DOB */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                                                            <input
                                                                type="date"
                                                                value={member.dob || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'dob', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>

                                                        {/* Age */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Age</label>
                                                            <input
                                                                type="number"
                                                                value={member.age || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'age', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Age"
                                                            />
                                                        </div>

                                                        {/* Gender */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                                                            <select
                                                                value={member.gender || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'gender', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>

                                                        {/* Aadhaar */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Aadhaar Number</label>
                                                            <input
                                                                type="text"
                                                                value={member.id_number_full || member.id_number || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'id_number_full', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="12-digit Aadhaar"
                                                                maxLength="12"
                                                            />
                                                        </div>

                                                        {/* Mobile */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile</label>
                                                            <input
                                                                type="text"
                                                                value={member.mobile_full || member.mobile || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'mobile_full', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="10-digit mobile"
                                                                maxLength="10"
                                                            />
                                                        </div>

                                                        {/* Email */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                                                            <input
                                                                type="email"
                                                                value={member.email || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'email', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="email@example.com"
                                                            />
                                                        </div>

                                                        {/* Temple */}
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-600 mb-1">Nearest TTD Temple</label>
                                                            <input
                                                                type="text"
                                                                value={member.nearest_ttd_temple || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'nearest_ttd_temple', e.target.value)}
                                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Temple name"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Address */}
                                                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                            <Home className="w-4 h-4 text-purple-600" />
                                                            Address
                                                        </h5>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                                            <input
                                                                type="text"
                                                                value={member.doorno || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'doorno', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                placeholder="Door No"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={member.street || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'street', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                placeholder="Street"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={member.city || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'city', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                placeholder="City"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={member.district || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'district', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                placeholder="District"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={member.state || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'state', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                placeholder="State"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={member.pincode || ''}
                                                                onChange={(e) => handleInputChange(memberIndex, 'pincode', e.target.value)}
                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                placeholder="Pincode"
                                                                maxLength="6"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-100 p-4 flex justify-between items-center border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            <Image className="w-4 h-4 inline mr-1" />
                            Click on photo to change | Max 5MB
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                disabled={saving}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSave}
                                disabled={uploadingPhoto !== null || saving}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : uploadingPhoto !== null ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditTeamModal;