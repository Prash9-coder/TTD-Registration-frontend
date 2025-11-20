/**
 * Image URL Helper Functions
 * Fixes malformed Cloudinary URLs and provides fallbacks
 */

/**
 * Fix malformed Cloudinary URLs
 * Common issues:
 * - Missing colon in https:// (https//)
 * - Base URL prepended to Cloudinary URL
 * - Relative paths
 */
export const fixImageUrl = (url) => {
    if (!url) return null;

    // Convert to string if needed
    const urlString = String(url);

    // If already correct full URL, return as-is
    if (urlString.match(/^https?:\/\//)) {
        return urlString;
    }

    // Fix missing colon in https// or http//
    if (urlString.startsWith('https//')) {
        return urlString.replace('https//', 'https://');
    }
    if (urlString.startsWith('http//')) {
        return urlString.replace('http//', 'http://');
    }

    // Fix if base URL is prepended (e.g., "ttd-registration.onrender.comhttps//...")
    const cloudinaryMatch = urlString.match(/(https?\/\/res\.cloudinary\.com\/.+)/);
    if (cloudinaryMatch) {
        const cloudinaryPart = cloudinaryMatch[1];
        return cloudinaryPart.replace(/^https?\/\//, 'https://');
    }

    // Extract Cloudinary URL if embedded in malformed string
    const embeddedMatch = urlString.match(/res\.cloudinary\.com\/([^\/]+)\/image\/upload\/(.+)/);
    if (embeddedMatch) {
        return `https://res.cloudinary.com/${embeddedMatch[1]}/image/upload/${embeddedMatch[2]}`;
    }

    // If it's just a filename/path, construct full Cloudinary URL
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dnly2saob';

    if (!urlString.includes('cloudinary.com')) {
        // Remove leading slashes
        const cleanPath = urlString.replace(/^\/+/, '');

        // If path doesn't include folder, add default folder
        if (!cleanPath.includes('/')) {
            return `https://res.cloudinary.com/${cloudName}/image/upload/ttd-registrations/${cleanPath}`;
        }

        return `https://res.cloudinary.com/${cloudName}/image/upload/${cleanPath}`;
    }

    // Last resort: return original
    return urlString;
};

/**
 * Get image URL with fallback placeholder
 */
export const getImageUrl = (photoUrl, fallback = null) => {
    try {
        const fixed = fixImageUrl(photoUrl);

        if (!fixed) return fallback;

        // Validate that it's a proper URL
        try {
            new URL(fixed);
            return fixed;
        } catch {
            console.warn('Invalid URL after fixing:', fixed, 'Original:', photoUrl);
            return fallback;
        }
    } catch (error) {
        console.error('Image URL error:', error, 'Original:', photoUrl);
        return fallback;
    }
};

/**
 * Generate placeholder SVG data URL
 */
export const getPlaceholderImage = (text = '?', bgColor = '#f97316', textColor = '#ffffff') => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
            <rect width="128" height="128" fill="${bgColor}"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="${textColor}">
                ${text}
            </text>
        </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Preload image to check if it exists
 */
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * Debug image URL
 */
export const debugImageUrl = (url, label = 'Image') => {
    console.group(`🖼️ ${label} URL Debug`);
    console.log('Original:', url);
    console.log('Fixed:', fixImageUrl(url));
    console.log('Type:', typeof url);
    console.log('Starts with http:', String(url).startsWith('http'));
    console.log('Includes cloudinary:', String(url).includes('cloudinary'));
    console.groupEnd();
};