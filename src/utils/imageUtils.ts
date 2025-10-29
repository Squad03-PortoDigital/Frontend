/**
 * Redimensiona e comprime uma imagem mantendo a proporção
 * @param file - Arquivo de imagem original
 * @param maxWidth - Largura máxima (padrão: 800px)
 * @param maxHeight - Altura máxima (padrão: 800px)
 * @param quality - Qualidade JPEG 0-1 (padrão: 0.8)
 * @param maxSizeMB - Tamanho máximo em MB (padrão: 5)
 * @returns Promise com string base64 da imagem comprimida
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8,
  maxSizeMB: number = 5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validar tamanho do arquivo
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      reject(new Error(`Imagem muito grande! Máximo ${maxSizeMB}MB.`));
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      reject(new Error('Arquivo deve ser uma imagem!'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Criar canvas e redimensionar
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Erro ao criar contexto do canvas'));
          return;
        }

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        resolve(compressedBase64);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Valida se uma string é uma imagem base64 válida
 */
export const isValidBase64Image = (str: string): boolean => {
  if (!str) return false;
  return str.startsWith('data:image/');
};