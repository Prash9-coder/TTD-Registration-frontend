import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', title, onClose, duration = 4000 }) => {
    const icons = {
        success: <CheckCircle className="w-6 h-6" />,
        error: <XCircle className="w-6 h-6" />,
        info: <Info className="w-6 h-6" />,
        warning: <AlertTriangle className="w-6 h-6" />
    };

    const colors = {
        success: 'from-green-500 to-green-600',
        error: 'from-red-500 to-red-600',
        info: 'from-blue-500 to-blue-600',
        warning: 'from-yellow-500 to-yellow-600'
    };

    const titles = {
        success: title || 'Success!',
        error: title || 'Error!',
        info: title || 'Info',
        warning: title || 'Warning!'
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className={`fixed top-20 right-4 z-50 min-w-[300px] max-w-md bg-gradient-to-r ${colors[type]} text-white rounded-lg shadow-2xl overflow-hidden`}
        >
            <div className="p-4 flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {icons[type]}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-lg">{titles[type]}</h4>
                    <p className="text-sm text-white/90 mt-1">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="h-1 bg-white/30"
            />
        </motion.div>
    );
};

export default Toast;