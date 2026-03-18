/**
 * Utility for optimizing media URLs for performance.
 * Leverages Supabase Image Transformation if available.
 */

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'origin';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Appends optimization parameters to a storage URL.
 * Works with Supabase Storage and many CDNs.
 */
export const getOptimizedImageUrl = (url: string | null | undefined, options: ImageOptions = {}) => {
  if (!url) return "/placeholder.svg";
  
  // Skip if it's already a placeholder or data URI
  if (url.startsWith('data:') || url.includes('placeholder.svg')) return url;
  
  // Skip if it is not a Supabase URL (e.g. Synology/External)
  // But we can still try to append params as many NAS/Servers support them
  // or just return as is if we want to be safe.
  
  try {
    const urlObj = new URL(url);
    
    // Supabase Image Transformation parameters
    if (options.width) urlObj.searchParams.set('width', options.width.toString());
    if (options.height) urlObj.searchParams.set('height', options.height.toString());
    if (options.quality) urlObj.searchParams.set('quality', options.quality.toString());
    if (options.resize) urlObj.searchParams.set('resize', options.resize);
    
    // Default to webp for better compression if not specified
    if (options.format) {
        urlObj.searchParams.set('format', options.format);
    } else if (!url.includes('gif')) {
        // urlObj.searchParams.set('format', 'webp'); // Enable when certain Supabase project supports it
    }

    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

/**
 * Standard sizes for different UI contexts
 */
export const MEDIA_SIZES = {
  THUMBNAIL: { width: 600, quality: 75, resize: 'cover' as const },
  AVATAR: { width: 100, height: 100, quality: 80, resize: 'cover' as const },
  LIGHTBOX: { width: 1200, quality: 85, resize: 'contain' as const },
  GALLERY: { width: 400, quality: 70, resize: 'cover' as const }
};
