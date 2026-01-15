/**
 * Image URL Helper Functions
 * Fixes malformed Cloudinary URLs and provides fallbacks
 * Enhanced with better error handling and Cloudinary transformations
 */

/**
 * Get Cloudinary cloud name from environment or default
 */
const getCloudName = () => {
    return process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dnly2saob';
};

/**
 * Fix malformed Cloudinary URLs
 * @param {string|null|undefined} url - The URL to fix
 * @returns {string|null} - Fixed URL or null
 * 
 * Common issues fixed:
 * - Missing colon in https:// (https//)
 * - Base URL prepended to Cloudinary URL
 * - Relative paths
 * - Double slashes
 */
export const fixImageUrl = (url) => {
    if (!url) return null;

    // Convert to string and trim whitespace
    const urlString = String(url).trim();
    
    if (!urlString) return null;

    // If already correct full URL, return as-is
    if (urlString.match(/^https?:\/\/res\.cloudinary\.com\//)) {
        return urlString;
    }

    // Fix missing colon in https// or http//
    if (urlString.match(/^https?\/\//)) {
        return urlString.replace(/^(https?)\/{2}/, '$1://');
    }

    // ✅ FIXED: Removed unnecessary escape character
    // Fix if base URL is prepended (e.g., "ttd-registration.onrender.comhttps//...")
    const malformedMatch = urlString.match(/(?:.*?)(https?[:/]{1,3}res\.cloudinary\.com\/.+)/);
    if (malformedMatch) {
        const cloudinaryPart = malformedMatch[1];
        return cloudinaryPart.replace(/^(https?)[:\s/]+/, '$1://');
    }

    // ✅ FIXED: Removed unnecessary escape character
    // Extract Cloudinary URL if embedded in malformed string
    const embeddedMatch = urlString.match(/res\.cloudinary\.com\/([^/\s]+)\/image\/upload\/(.+)/);
    if (embeddedMatch) {
        const [, cloudName, path] = embeddedMatch;
        return `https://res.cloudinary.com/${cloudName}/image/upload/${path}`;
    }

    // If it's just a filename/path, construct full Cloudinary URL
    const cloudName = getCloudName();

    if (!urlString.includes('cloudinary.com')) {
        // Remove leading slashes
        const cleanPath = urlString.replace(/^\/+/, '');

        // If path doesn't include folder, add default folder
        if (!cleanPath.includes('/')) {
            return `https://res.cloudinary.com/${cloudName}/image/upload/ttd-registrations/${cleanPath}`;
        }

        return `https://res.cloudinary.com/${cloudName}/image/upload/${cleanPath}`;
    }

    // Last resort: return original if it looks like a URL
    return urlString.startsWith('http') ? urlString : null;
};

/**
 * Get image URL with fallback placeholder
 * @param {string|null|undefined} photoUrl - The photo URL to process
 * @param {string|null} fallback - Fallback URL or null for placeholder
 * @returns {string|null} - Fixed URL or fallback
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
 * @param {string} text - Text to display in placeholder
 * @param {string} bgColor - Background color (hex)
 * @param {string} textColor - Text color (hex)
 * @returns {string} - Data URL for SVG placeholder
 */
export const getPlaceholderImage = (text = '?', bgColor = '#f97316', textColor = '#ffffff') => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
            <rect width="128" height="128" fill="${bgColor}"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="${textColor}">
                ${text}
            </text>
        </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

/**
 * Get placeholder for member photo (first letter of name)
 * @param {string} name - Member name
 * @returns {string} - Data URL for SVG placeholder
 */
export const getMemberPlaceholder = (name) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return getPlaceholderImage(initial);
};

/**
 * Preload image to check if it exists
 * @param {string} src - Image source URL
 * @returns {Promise<string>} - Resolves with src if image loads
 */
export const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
        if (!src) {
            reject(new Error('No source provided'));
            return;
        }

        const img = new window.Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
};

/**
 * Preload multiple images
 * @param {string[]} urls - Array of image URLs
 * @returns {Promise<{loaded: string[], failed: string[]}>}
 */
export const preloadImages = async (urls) => {
    const results = await Promise.allSettled(urls.map(url => preloadImage(url)));
    
    const loaded = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
    
    const failed = results
        .filter(r => r.status === 'rejected')
        .map((_, i) => urls[i]);

    return { loaded, failed };
};

/**
 * Debug image URL
 * @param {string} url - URL to debug
 * @param {string} label - Label for console group
 */
export const debugImageUrl = (url, label = 'Image') => {
    console.group(`🖼️ ${label} URL Debug`);
    console.log('Original:', url);
    console.log('Fixed:', fixImageUrl(url));
    console.log('Type:', typeof url);
    console.log('Length:', String(url).length);
    console.log('Starts with http:', String(url).startsWith('http'));
    console.log('Includes cloudinary:', String(url).includes('cloudinary'));
    
    try {
        const fixed = fixImageUrl(url);
        if (fixed) {
            const urlObj = new URL(fixed);
            console.log('Hostname:', urlObj.hostname);
            console.log('Pathname:', urlObj.pathname);
        }
    } catch (e) {
        console.log('URL parse error:', e.message);
    }
    
    console.groupEnd();
};

/**
 * Get Cloudinary transformation URL
 * @param {string} photoUrl - Original photo URL
 * @param {object} transformations - Cloudinary transformation options
 * @returns {string|null} - Transformed URL or null
 */
export const getCloudinaryTransformedUrl = (photoUrl, transformations = {}) => {
    try {
        const fixedUrl = fixImageUrl(photoUrl);
        if (!fixedUrl || !fixedUrl.includes('res.cloudinary.com')) {
            return fixedUrl;
        }

        // Parse the URL
        const urlParts = fixedUrl.split('/upload/');
        if (urlParts.length !== 2) {
            return fixedUrl;
        }

        const [baseUrl, imagePath] = urlParts;

        // Build transformation string
        const transforms = [];
        
        if (transformations.width) transforms.push(`w_${transformations.width}`);
        if (transformations.height) transforms.push(`h_${transformations.height}`);
        if (transformations.crop) transforms.push(`c_${transformations.crop}`);
        if (transformations.gravity) transforms.push(`g_${transformations.gravity}`);
        if (transformations.quality) transforms.push(`q_${transformations.quality}`);
        if (transformations.fetch_format) transforms.push(`f_${transformations.fetch_format}`);
        if (transformations.effect) transforms.push(`e_${transformations.effect}`);
        if (transformations.radius) transforms.push(`r_${transformations.radius}`);

        if (transforms.length === 0) {
            return fixedUrl;
        }

        const transformString = transforms.join(',');
        return `${baseUrl}/upload/${transformString}/${imagePath}`;

    } catch (error) {
        console.error('Cloudinary transformation error:', error, 'Original:', photoUrl);
        return fixImageUrl(photoUrl);
    }
};

/**
 * Get thumbnail URL (150x150, face detection, optimized)
 * @param {string} photoUrl - Original photo URL
 * @returns {string|null} - Thumbnail URL or null
 */
export const getThumbnailUrl = (photoUrl) => {
    return getCloudinaryTransformedUrl(photoUrl, {
        width: 150,
        height: 150,
        crop: 'fill',
        gravity: 'face',
        quality: 'auto',
        fetch_format: 'auto'
    });
};

/**
 * Get transparent background version of image URL
 * Uses Cloudinary's AI background removal
 * @param {string} photoUrl - Original photo URL
 * @returns {string|null} - URL with background removal or null
 */
export const getTransparentImageUrl = (photoUrl) => {
    return getCloudinaryTransformedUrl(photoUrl, {
        effect: 'background_removal'
    });
};

/**
 * Get optimized image URL for web display
 * @param {string} photoUrl - Original photo URL
 * @param {number} maxWidth - Maximum width (default: 800)
 * @returns {string|null} - Optimized URL or null
 */
export const getOptimizedImageUrl = (photoUrl, maxWidth = 800) => {
    return getCloudinaryTransformedUrl(photoUrl, {
        width: maxWidth,
        quality: 'auto',
        fetch_format: 'auto'
    });
};

/**
 * Get circular avatar URL
 * @param {string} photoUrl - Original photo URL
 * @param {number} size - Size in pixels (default: 128)
 * @returns {string|null} - Avatar URL or null
 */
export const getAvatarUrl = (photoUrl, size = 128) => {
    return getCloudinaryTransformedUrl(photoUrl, {
        width: size,
        height: size,
        crop: 'fill',
        gravity: 'face',
        radius: 'max',
        quality: 'auto',
        fetch_format: 'auto'
    });
};

/**
 * Validate if URL is a valid Cloudinary URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Cloudinary URL
 */
export const isValidCloudinaryUrl = (url) => {
    if (!url) return false;
    const fixed = fixImageUrl(url);
    if (!fixed) return false;
    
    try {
        const urlObj = new URL(fixed);
        return urlObj.hostname === 'res.cloudinary.com' && 
               urlObj.pathname.includes('/image/upload/');
    } catch {
        return false;
    }
};

/**
 * Extract Cloudinary public ID from URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
export const getCloudinaryPublicId = (url) => {
    try {
        const fixed = fixImageUrl(url);
        if (!fixed || !fixed.includes('res.cloudinary.com')) {
            return null;
        }

        const match = fixed.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
};

// ✅ FIXED: Assign object to a variable before exporting
const imageHelpers = {
    fixImageUrl,
    getImageUrl,
    getPlaceholderImage,
    getMemberPlaceholder,
    preloadImage,
    preloadImages,
    debugImageUrl,
    getCloudinaryTransformedUrl,
    getThumbnailUrl,
    getTransparentImageUrl,
    getOptimizedImageUrl,
    getAvatarUrl,
    isValidCloudinaryUrl,
    getCloudinaryPublicId
};

export default imageHelpers;