import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Phone, Mail, MapPin, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useRegistrationStore } from '../../context/RegistrationContext';
import { validateAadhaar, calculateAge } from '../../utils/validation';
import { INDIAN_STATES, TTD_TEMPLES } from '../../utils/constants';

const MemberForm = ({ memberIndex }) => {
    const { teamData, updateMember } = useRegistrationStore();
    const member = teamData.members[memberIndex];

    const [formData, setFormData] = useState(member || {});
    const [errors, setErrors] = useState({});
    const [aadhaarStatus, setAadhaarStatus] = useState({ valid: false, message: '' });

    useEffect(() => {
        setFormData(member || {});
    }, [memberIndex, member]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            if (field === 'dob' && value) {
                newData.age = calculateAge(value);
            }

            // Persist to global store
            updateMember(memberIndex, newData);
            return newData;
        });

        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleAadhaarValidation = (aadhaar) => {
        const result = validateAadhaar(aadhaar);
        setAadhaarStatus(result);

        setErrors(prev => ({ ...prev, id_number: result.valid ? '' : result.message }));
    };

    // ✅ Robust photo upload + save URL as photoUrl (and photo for backward compat)
    const handlePhotoUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // Validate MIME and size
        if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
            setErrors(prev => ({ ...prev, photo: 'Only JPG/JPEG files are allowed' }));
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, photo: 'File size must be less than 2MB' }));
            return;
        }

        // Show temporary preview & uploading state
        const tempPreview = URL.createObjectURL(file);
        setFormData(prev => {
            const newData = { ...prev, photoUploading: true, photoPreview: tempPreview };
            updateMember(memberIndex, newData);
            return newData;
        });
        setErrors(prev => ({ ...prev, photo: '' }));

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'https://ttd-registration.onrender.com';
            const fd = new FormData();
            fd.append('photo', file);

            console.log(`📤 Uploading photo for Member ${memberIndex + 1}...`);

            const response = await fetch(`${API_URL}/api/upload/photo`, {
                method: 'POST',
                body: fd
            });

            const fetchMemberByAadhaar = async (aadhaar) => {
                try {
                    const API_URL = process.env.REACT_APP_API_URL || 'https://ttd-registration.onrender.com';

                    const res = await fetch(`${API_URL}/api/member/by-aadhaar/${aadhaar}`);
                    const result = await res.json();

                    if (result.success && result.exists) {
                        const m = result.data;

                        const autoData = {
                            ...formData,
                            name: m.name,
                            dob: m.dob,
                            age: calculateAge(m.dob),
                            gender: m.gender,
                            id_number: m.id_number,
                            mobile: m.mobile,
                            email: m.email,
                            state: m.state,
                            district: m.district,
                            city: m.city,
                            street: m.street,
                            doorno: m.doorno,
                            pincode: m.pincode,
                            nearest_ttd_temple: m.nearest_ttd_temple,
                            photoUrl: m.photo_path,
                            photoPreview: m.photo_path
                        };

                        setFormData(autoData);
                        updateMember(memberIndex, autoData);

                        showToast("Existing member found. Auto-filled details!", "success");
                    }

                } catch (err) {
                    console.log("Autofill error", err);
                }
            };


            // try parse JSON safely
            const result = await response.json().catch(() => null);

            if (!response.ok) {
                // If backend gave json error message, prefer it
                const msg = (result && (result.message || JSON.stringify(result))) || `Upload failed with status ${response.status}`;
                throw new Error(msg);
            }

            if (!result || !result.success || !result.data) {
                const msg = (result && (result.message || 'Invalid upload response')) || 'Upload failed';
                throw new Error(msg);
            }

            console.log('✅ Upload successful:', result.data);

            // Prefer secure_url if present, else url
            const finalUrl = result.data.secure_url || result.data.url || result.data.public_url || null;
            const cloudinaryId = result.data.public_id || result.data.cloudinary_id || null;

            if (!finalUrl) {
                throw new Error('Upload succeeded but no URL returned by server');
            }

            const uploadedData = {
                ...formData,
                photo: finalUrl,         // backward compatibility
                photoUrl: finalUrl,      // explicit field other components should use
                cloudinary_id: cloudinaryId,
                photoPreview: finalUrl,
                photoUploading: false
            };

            setFormData(uploadedData);
            updateMember(memberIndex, uploadedData);
            setErrors(prev => ({ ...prev, photo: '' }));

            console.log('✅ Photo URL saved:', finalUrl);

            // revoke temp preview
            URL.revokeObjectURL(tempPreview);
        } catch (error) {
            console.error('❌ Upload error:', error);
            setErrors(prev => ({ ...prev, photo: error.message || 'Upload failed. Please try again.' }));

            setFormData(prev => {
                const newData = { ...prev, photoUploading: false, photoPreview: null };
                // do NOT wipe existing photoUrl if it was present previously; only clear if upload replaced it
                if (!prev.photo) newData.photo = null;
                updateMember(memberIndex, newData);
                return newData;
            });

            try { URL.revokeObjectURL(tempPreview); } catch (_) { /* ignore */ }
        }
    };

    const fetchMemberByAadhaar = async (aadhaar) => {
        try {
            if (!aadhaar || aadhaar.length !== 12) return;

            const API_URL = process.env.REACT_APP_API_URL || 'https://ttd-registration.onrender.com';

            const res = await fetch(`${API_URL}/api/member/by-aadhaar/${aadhaar}`);
            const result = await res.json();

            if (result.success && result.exists) {
                const m = result.data;

                const autoData = {
                    ...formData,
                    name: m.name,
                    dob: m.dob,
                    age: calculateAge(m.dob),
                    gender: m.gender,
                    id_number: m.id_number,
                    mobile: m.mobile,
                    email: m.email,
                    state: m.state,
                    district: m.district,
                    city: m.city,
                    street: m.street,
                    doorno: m.doorno,
                    pincode: m.pincode,
                    nearest_ttd_temple: m.nearest_ttd_temple,
                    photoUrl: m.photo_path,
                    photoPreview: m.photo_path,
                    photo: m.photo_path
                };

                setFormData(autoData);
                updateMember(memberIndex, autoData);

                showToast('Existing member found! Auto-filled details.', 'success');
            }

        } catch (error) {
            console.error("Aadhaar autofill error:", error);
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date of Birth *
                    </label>
                    <input
                        type="date"
                        value={formData.dob || ''}
                        onChange={(e) => handleChange('dob', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>

                {/* Age */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                    <input
                        type="number"
                        value={formData.age || ''}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                        placeholder="Auto-calculated"
                    />
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                    <select
                        value={formData.gender || ''}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>

                {/* ID Proof Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID Proof Type</label>
                    <input
                        type="text"
                        value="Aadhaar"
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                    />
                </div>

                {/* Aadhaar Number */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhaar Number *</label>
                    <input
                        type="text"
                        value={formData.id_number || ''}
                        onChange={(e) => handleChange('id_number', e.target.value)}
                        onBlur={() => {
                            handleAadhaarValidation(formData.id_number);
                            fetchMemberByAadhaar(formData.id_number);
                        }}
                        maxLength="12"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.id_number ? 'border-red-500' : aadhaarStatus.valid ? 'border-green-500' : 'border-gray-300'}`}
                        placeholder="Enter 12-digit Aadhaar"
                    />
                    {errors.id_number && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            {errors.id_number}
                        </p>
                    )}
                    {aadhaarStatus.valid && !errors.id_number && (
                        <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Valid Aadhaar
                        </p>
                    )}
                </div>

                {/* Mobile */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Mobile Number *
                    </label>
                    <input
                        type="tel"
                        value={formData.mobile || ''}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        maxLength="10"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="10-digit mobile number"
                    />
                    {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email *
                    </label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* State */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        State *
                    </label>
                    <select
                        value={formData.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                {/* District */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">District *</label>
                    <input
                        type="text"
                        value={formData.district || ''}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.district ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter district"
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* Street */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street *</label>
                    <input
                        type="text"
                        value={formData.street || ''}
                        onChange={(e) => handleChange('street', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter street name"
                    />
                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                </div>

                {/* Door No */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Door/House Number *</label>
                    <input
                        type="text"
                        value={formData.doorno || ''}
                        onChange={(e) => handleChange('doorno', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.doorno ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter door/house number"
                    />
                    {errors.doorno && <p className="text-red-500 text-sm mt-1">{errors.doorno}</p>}
                </div>

                {/* Pincode */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                    <input
                        type="text"
                        value={formData.pincode || ''}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        maxLength="6"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="6-digit pincode"
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>

                {/* Nearest TTD Temple */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nearest TTD Temple *</label>
                    <select
                        value={formData.nearest_ttd_temple || ''}
                        onChange={(e) => handleChange('nearest_ttd_temple', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.nearest_ttd_temple ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Select temple</option>
                        {TTD_TEMPLES.map(temple => (
                            <option key={temple} value={temple}>{temple}</option>
                        ))}
                    </select>
                    {errors.nearest_ttd_temple && <p className="text-red-500 text-sm mt-1">{errors.nearest_ttd_temple}</p>}
                </div>

                {/* Photo Upload */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Upload className="w-4 h-4 inline mr-1" />
                        Passport Size Photo * (JPG/JPEG, max 2MB)
                    </label>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg"
                                onChange={handlePhotoUpload}
                                disabled={formData.photoUploading}
                                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${formData.photoUploading ? 'opacity-50 cursor-not-allowed' : ''} ${errors.photo ? 'border-red-500' : 'border-gray-300'}`}
                            />

                            {errors.photo && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    {errors.photo}
                                </p>
                            )}

                            {formData.photoUploading && (
                                <p className="text-blue-600 text-sm mt-1 flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Uploading to cloud storage...
                                </p>
                            )}

                            {formData.photoUrl && !formData.photoUploading && (
                                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Photo uploaded successfully
                                </p>
                            )}
                        </div>

                        {/* Photo Preview */}
                        {formData.photoPreview && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                                <img
                                    src={formData.photoPreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover border-4 border-blue-200 rounded-xl shadow-lg"
                                    onError={(e) => {
                                        console.error('Image preview failed:', formData.photoPreview);
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                                {formData.photoUploading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                                        <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MemberForm;
