// frontend/src/utils/constants.js

// ✅ Single API URL - Production
export const API_URL = process.env.REACT_APP_API_URL?.split(',')[0]?.trim() 
    || 'https://ttd-registration.onrender.com';

console.log('🌐 API URL:', API_URL);

export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const TTD_TEMPLES = [
    "Sri Venkateswara Temple, Tirupati",
    "SV Temple, Jubilee Hills, Hyderabad",
    "Other"
];

export const APP_NAME = process.env.REACT_APP_NAME || 'TTD Team Registration';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';