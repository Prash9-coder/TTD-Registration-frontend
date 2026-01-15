import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useRegistrationStore } from '../../context/RegistrationContext';
import { useToast } from '../common/ToastContainer';
import MemberTabs from './MemberTabs';
import MemberForm from './MemberForm';
import { validateAadhaar, validateEmail, validateMobile, validatePincode, calculateAge } from '../../utils/validation';

const MemberDetailsStep = ({ onNext, onPrevious }) => {
    const { teamData, currentMemberIndex, setCurrentMemberIndex } = useRegistrationStore();
    const { showToast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(currentMemberIndex);

    const validateCurrentMember = () => {
        const member = teamData.members[currentIndex];
        const errors = [];

        if (!member.name.trim()) errors.push('Name is required');
        if (!member.dob) errors.push('Date of birth is required');

        if (member.dob) {
            const age = calculateAge(member.dob);
            if (age < 5) errors.push('Member must be at least 5 years old');
        }

        if (!member.gender) errors.push('Gender is required');

        const aadhaarResult = validateAadhaar(member.id_number);
        if (!aadhaarResult.valid) errors.push(aadhaarResult.message);

        if (!validateMobile(member.mobile)) errors.push('Valid 10-digit mobile number required');
        if (!validateEmail(member.email)) errors.push('Valid email required');
        if (!member.state) errors.push('State is required');
        if (!member.district.trim()) errors.push('District is required');
        if (!member.city.trim()) errors.push('City is required');
        if (!member.street.trim()) errors.push('Street is required');
        if (!member.doorno.trim()) errors.push('Door number is required');
        if (!validatePincode(member.pincode)) errors.push('Valid 6-digit pincode required');
        if (!member.nearest_ttd_temple) errors.push('Temple selection is required');
        if (!member.photo) errors.push('Photo is required');

        return errors;
    };

    const handleTabClick = (index) => {
        setCurrentIndex(index);
        setCurrentMemberIndex(index);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setCurrentMemberIndex(currentIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        const errors = validateCurrentMember();

        if (errors.length > 0) {
            showToast(errors[0], 'error', 'Validation Error');
            return;
        }

        if (currentIndex < teamData.members_count - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentMemberIndex(currentIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast(`Member ${currentIndex + 1} details saved!`, 'success');
        }
    };

    const handleReview = () => {
        // Validate all members before proceeding
        for (let i = 0; i < teamData.members_count; i++) {
            const member = teamData.members[i];
            if (!member.photo) {
                showToast(`Photo missing for Member ${i + 1}`, 'error');
                setCurrentIndex(i);
                setCurrentMemberIndex(i);
                return;
            }

            // Quick validation
            if (!member.name || !member.dob || !member.gender || !member.id_number ||
                !member.mobile || !member.email) {
                showToast(`Please complete all fields for Member ${i + 1}`, 'error');
                setCurrentIndex(i);
                setCurrentMemberIndex(i);
                return;
            }
        }

        showToast('All members validated successfully!', 'success');
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {/* Member Tabs */}
            <MemberTabs currentIndex={currentIndex} onTabClick={handleTabClick} />

            {/* Member Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Member {currentIndex + 1} Details
                </h3>
                <MemberForm memberIndex={currentIndex} />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
                {currentIndex > 0 && (
                    <motion.button
                        onClick={handlePrevious}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Previous Member
                    </motion.button>
                )}

                {currentIndex < teamData.members_count - 1 ? (
                    <motion.button
                        onClick={handleNext}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ml-auto"
                    >
                        Next Member
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                ) : (
                    <motion.button
                        onClick={handleReview}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ml-auto"
                    >
                        Review & Submit
                        <CheckCircle className="w-5 h-5" />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default MemberDetailsStep;