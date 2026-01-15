import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const ProgressIndicator = ({ currentStep }) => {
    const steps = [
        { number: 1, label: 'Team Info' },
        { number: 2, label: 'Member Details' },
        { number: 3, label: 'Review & Submit' }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step Circle */}
                        <div className="flex flex-col items-center flex-1">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: currentStep >= step.number ? 1 : 0.8 }}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${currentStep > step.number
                                    ? 'bg-green-500 text-white'
                                    : currentStep === step.number
                                        ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                                        : 'bg-gray-300 text-gray-600'
                                    }`}
                            >
                                {currentStep > step.number ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    step.number
                                )}
                            </motion.div>
                            <span
                                className={`mt-2 text-sm font-semibold transition-colors ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 mx-2 -mt-10 relative">
                                <div className="absolute inset-0 bg-gray-300 rounded"></div>
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 bg-blue-600 rounded"
                                ></motion.div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ProgressIndicator;