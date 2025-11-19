import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Phone, Mail, MapPin, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useRegistrationStore } from '../../context/RegistrationContext';
import { validateAadhaar, calculateAge, validateEmail, validateMobile, validatePincode } from '../../utils/validation';
import { INDIAN_STATES, TTD_TEMPLES } from '../../utils/constants';

const MemberForm = ({ memberIndex }) => {
    const { teamData, updateMember } = useRegistrationStore();
    const member = teamData.members[memberIndex];

    const [formData, setFormData] = useState(member);
    const [errors, setErrors] = useState({});
    const [aadhaarStatus, setAadhaarStatus] = useState({ valid: false, message: '' });

    useEffect(() => {
        setFormData(member);
    }, [memberIndex, member]);

    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };

        // Auto-calculate age when DOB changes
        if (field === 'dob' && value) {
            const age = calculateAge(value);
            newData.age = age;
        }

        setFormData(newData);
        updateMember(memberIndex, newData);

        // Clear error for this field
        setErrors({ ...errors, [field]: '' });
    };

    const handleAadhaarValidation = (aadhaar) => {
        const result = validateAadhaar(aadhaar);
        setAadhaarStatus(result);

        if (!result.valid) {
            setErrors({ ...errors, id_number: result.message });
        } else {
            setErrors({ ...errors, id_number: '' });
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
            setErrors({ ...errors, photo: 'Only JPG/JPEG files are allowed' });
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            setErrors({ ...errors, photo: 'File size must be less than 1MB' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const newData = {
                ...formData,
                photo: file,
                photoPreview: e.target.result
            };
            setFormData(newData);
            updateMember(memberIndex, newData);
            setErrors({ ...errors, photo: '' });
        };
        reader.readAsDataURL(file);
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
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                        value={formData.dob}
                        onChange={(e) => handleChange('dob', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.dob ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>

                {/* Age (Auto-calculated) */}
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
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.gender ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                        value={formData.id_number}
                        onChange={(e) => handleChange('id_number', e.target.value)}
                        onBlur={() => handleAadhaarValidation(formData.id_number)}
                        maxLength="12"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.id_number ? 'border-red-500' : aadhaarStatus.valid ? 'border-green-500' : 'border-gray-300'
                            }`}
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
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        maxLength="10"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.mobile ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.district ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter district"
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                </div>

                {/* City */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                {/* Street */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street *</label>
                    <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.street ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter street name"
                    />
                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                </div>

                {/* Door No */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Door/House Number *</label>
                    <input
                        type="text"
                        value={formData.doorno}
                        onChange={(e) => handleChange('doorno', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.doorno ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter door/house number"
                    />
                    {errors.doorno && <p className="text-red-500 text-sm mt-1">{errors.doorno}</p>}
                </div>

                {/* Pincode */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                    <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        maxLength="6"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.pincode ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="6-digit pincode"
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>

                {/* Nearest TTD Temple */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nearest TTD Temple *</label>
                    <select
                        value={formData.nearest_ttd_temple}
                        onChange={(e) => handleChange('nearest_ttd_temple', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.nearest_ttd_temple ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                        Passport Size Photo * (JPG/JPEG, max 1MB)
                    </label>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg"
                                onChange={handlePhotoUpload}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
                        </div>
                        {formData.photoPreview && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="relative"
                            >
                                <img
                                    src={formData.photoPreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover border-4 border-blue-200 rounded-xl shadow-lg"
                                />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MemberForm;