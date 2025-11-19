import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRegistrationStore } from '../../context/RegistrationContext';

const SuccessPage = ({ onReset }) => {
    const { teamData } = useRegistrationStore();

    React.useEffect(() => {
        // Confetti animation on success
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl mx-auto"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
                <CheckCircle className="w-16 h-16 text-green-600" />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-800 mb-4"
            >
                Registration Successful! 🎉
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-2"
            >
                Your team <strong className="text-blue-600">"{teamData.team_name}"</strong> with{' '}
                <strong>{teamData.members_count} members</strong> has been registered successfully!
            </motion.p>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500 mb-8"
            >
                You will receive a confirmation email shortly with all the details.
            </motion.p>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
            >
                <button
                    onClick={onReset}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                    <Home className="w-5 h-5" />
                    Register Another Team
                </button>

                <button
                    onClick={() => window.print()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download Receipt
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
                <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong> Please check your email for verification and further instructions.
                </p>
            </motion.div>
        </motion.div>
    );
};

export default SuccessPage;