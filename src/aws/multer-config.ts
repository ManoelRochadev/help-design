import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3Config = new S3Client({
  region: "sa-east-1",
  credentials: {
    accessKeyId: "AKIAYS2NV3VTQDLSTHYP",
    secretAccessKey: "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",
  },
});

const generateNumericId = () => {
  return Math.floor(Math.random() * 1000); // Altere conforme necessário para gerar o ID desejado
};

export const multerConfig = {
  storage: multerS3({
    s3: s3Config,
    bucket: 'pixer-s3-dev',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      const fileName =
        path.parse(file.originalname).name.replace(/\s/g, '') + '-' + uuidv4();

      const extension = path.parse(file.originalname).ext;
      // gerar id unico númerico para nome da pasta
      const folderId = generateNumericId();

      const filePath = `${folderId}/${fileName}${extension}`;
      cb(null, filePath);
    },
  }),
}