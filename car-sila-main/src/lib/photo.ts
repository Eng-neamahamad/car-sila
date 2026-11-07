export const compressPhoto = (file: File) => new Promise<string>((resolve, reject) => {
  const image = new Image();
  const url = URL.createObjectURL(file);
  image.onload = () => {
    const maxSide = 1280;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) {
      URL.revokeObjectURL(url);
      reject(new Error('photo'));
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const encoded = (quality: number) => canvas.toDataURL('image/jpeg', quality);
    const first = encoded(0.72);
    resolve(first.length > 500000 ? encoded(0.5) : first);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('photo'));
  };
  image.src = url;
});
