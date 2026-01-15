import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegistrationStore } from '../context/RegistrationContext';
import ProgressIndicator from '../components/registration/ProgressIndicator';
import TeamInfoStep from '../components/registration/TeamInfoStep';
import MemberDetailsStep from '../components/registration/MemberDetailsStep';
import ReviewStep from '../components/registration/ReviewStep';
import SuccessPage from '../components/registration/SuccessPage';

const Registration = () => {
    const { currentStep, setCurrentStep, resetRegistration } = useRegistrationStore();

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSuccess = () => {
        setCurrentStep(4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        resetRegistration();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <motion.header
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 px-6 rounded-2xl shadow-2xl mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-center">
                        TTD Team Registration
                    </h1>
                    <p className="text-center mt-3 text-orange-100 text-lg">
                        Register your team (10-15 members)
                    </p>
                </motion.header>

                {/* Progress Indicator */}
                {currentStep < 4 && <ProgressIndicator currentStep={currentStep} />}

                {/* Steps */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <TeamInfoStep key="step1" onNext={handleNext} />
                    )}

                    {currentStep === 2 && (
                        <MemberDetailsStep key="step2" onNext={handleNext} onPrevious={handlePrevious} />
                    )}

                    {currentStep === 3 && (
                        <ReviewStep key="step3" onPrevious={handlePrevious} onSuccess={handleSuccess} />
                    )}

                    {currentStep === 4 && (
                        <SuccessPage key="success" onReset={handleReset} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Registration;