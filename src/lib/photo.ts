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
    let quality = 0.72;
    let result = encoded(quality);
    while (result.length > 480000 && quality > 0.35) {
      quality -= 0.12;
      result = encoded(quality);
    }
    resolve(result);
  };
  image.onerror = () => {
    URL.revokeObjectURL(url);
    reject(new Error('photo'));
  };
  image.src = url;
});
