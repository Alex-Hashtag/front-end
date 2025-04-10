/**
 * Determines the appropriate layout class based on image dimensions
 * @param width Image width
 * @param height Image height
 * @returns CSS class name for layout
 */
export const getImageLayoutClass = (width: number, height: number): string => {
  const aspectRatio = width / height;
  
  // If wider than tall (landscape/banner)
  if (aspectRatio > 1.2) {
    return 'banner-layout';
  }
  
  // If taller than wide (portrait/sidebar)
  if (aspectRatio < 0.8) {
    return 'sidebar-layout';
  }
  
  // Otherwise roughly square
  return 'square-layout';
};

/**
 * Preloads an image and returns its natural dimensions
 * @param src Image URL
 * @returns Promise resolving to {width, height}
 */
export const getImageDimensions = (src: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    img.onerror = reject;
    img.src = src;
  });
};
