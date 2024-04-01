import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { multerConfig } from './multer-config';

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post()
  @UseInterceptors(FilesInterceptor('attachment[]', 10, multerConfig))
  async uploadFile(@UploadedFiles() attachment: Express.Multer.File[]): Promise<any> {
    /*
    return [
      {
        id: '883',
        original:
          'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/aatik-tasneem-7omHUGhhmZ0-unsplash%402x.png',
        thumbnail:
          'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/881/conversions/aatik-tasneem-7omHUGhhmZ0-unsplash%402x-thumbnail.jpg',
      },
    ];
    */
    const uploadDto: CreateUploadDto[] = attachment.map((file) => {
      return {
        fileName: file.originalname,
        filePath: file.path, // Caminho temporário onde o arquivo foi salvo
        mimeType: file.mimetype,
        size: file.size,
      };
    });

    return this.uploadsService.uploadFile(uploadDto);
  }
}
