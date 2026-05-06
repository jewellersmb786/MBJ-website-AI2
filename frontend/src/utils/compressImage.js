export async function compressImage(file, options = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85, mimeType = 'image/jpeg' } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File read failed'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image load failed'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export const PRESET_PRODUCT      = { maxWidth: 1200, maxHeight: 1200, quality: 0.85 };
export const PRESET_BANNER_DESKTOP = { maxWidth: 1920, maxHeight: 600,  quality: 0.85 };
export const PRESET_BANNER_MOBILE  = { maxWidth: 800,  maxHeight: 1000, quality: 0.85 };
export const PRESET_TESTIMONIAL  = { maxWidth: 800,  maxHeight: 800,  quality: 0.85 };
export const PRESET_HERO         = { maxWidth: 1920, maxHeight: 1080, quality: 0.85 };
export const PRESET_AVATAR       = { maxWidth: 400,  maxHeight: 400,  quality: 0.85 };
export const PRESET_REFERENCE    = { maxWidth: 1200, maxHeight: 1200, quality: 0.85 };
