// Verhoeff Algorithm for Aadhaar
const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const verhoeffValidate = (num) => {
    let c = 0;
    const myArray = num.split('').reverse();

    for (let i = 0; i < myArray.length; i++) {
        c = d[c][p[(i % 8)][parseInt(myArray[i])]];
    }

    return c === 0;
};

export const validateAadhaar = (aadhaar) => {
    aadhaar = aadhaar.replace(/\s/g, '');

    if (aadhaar.length !== 12) {
        return { valid: false, message: 'Aadhaar must be exactly 12 digits' };
    }

    if (!/^\d{12}$/.test(aadhaar)) {
        return { valid: false, message: 'Aadhaar must contain only digits' };
    }

    if (/^(\d)\1{11}$/.test(aadhaar)) {
        return { valid: false, message: 'Invalid Aadhaar pattern' };
    }

    if (!verhoeffValidate(aadhaar)) {
        return { valid: false, message: 'Invalid Aadhaar checksum' };
    }

    return { valid: true, message: 'Valid Aadhaar' };
};

export const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
};

export const validatePincode = (pincode) => {
    return /^\d{6}$/.test(pincode);
};