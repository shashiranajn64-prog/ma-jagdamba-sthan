/**
 * Utility for converting and compressing image files to base64 Data URLs
 * for ID cards, profiles, and receipts without needing external image hosting URLs.
 */

export const processImageFile = (
  file: File,
  maxDimension = 400,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('कृपया केवल वैध इमेज फाइल (JPG, PNG, WEBP) चुनें।'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('फोटो पढ़ने में त्रुटि हुई। कृपया पुनः प्रयास करें।'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('फोटो लोड करने में असमर्थ।'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize maintaining aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};
