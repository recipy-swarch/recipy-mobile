import Constants from 'expo-constants';

export const buildImageUrl = (imagePath: string): string => {
  const apiUrl = Constants.expoConfig?.extra?.API_GATEWAY_URL || '';
  
  // Si la imagen ya tiene una URL completa, la devolvemos tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si la imagen empieza con /api/image/, removemos esa parte y construimos la URL completa
  if (imagePath.startsWith('/api/image/')) {
    const cleanPath = imagePath.replace('/api/image/', '');
    return `${apiUrl}/${cleanPath}`;
  }
  
  // Si la imagen empieza con /, la agregamos directamente a la URL base
  if (imagePath.startsWith('/')) {
    return `${apiUrl}${imagePath}`;
  }
  
  // Si no tiene prefijo, asumimos que es una ruta relativa
  return `${apiUrl}/${imagePath}`;
};

export const buildImageUrls = (images: string[]): string[] => {
  return images.map(image => buildImageUrl(image));
}; 