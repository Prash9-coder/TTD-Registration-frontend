import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useRegistrationStore } from '../../context/RegistrationContext';

const MemberTabs = ({ currentIndex, onTabClick }) => {
    const { teamData } = useRegistrationStore();

    const isMemberComplete = (index) => {
        const member = teamData.members[index];
        return member.name && member.dob && member.gender && member.id_number &&
            member.mobile && member.email && member.photo;
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-3 mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
                {teamData.members.map((_, index) => (
                    <motion.button
                        key={index}
                        onClick={() => onTabClick(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${currentIndex === index
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : isMemberComplete(index)
                                ? 'bg-green-50 text-green-700 border-2 border-green-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            Member {index + 1}
                            {isMemberComplete(index) && currentIndex !== index && (
                                <CheckCircle className="w-4 h-4" />
                            )}
                        </span>
                        {currentIndex === index && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default MemberTabs;