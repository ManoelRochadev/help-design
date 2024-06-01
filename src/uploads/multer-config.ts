// multer-config.ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { join } from 'path'

export const multerConfig = {
  storage: diskStorage({
    destination: join(__dirname, '/../../', 'uploadsuser'), // Diretório de destino para salvar os arquivos
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
};
