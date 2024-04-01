import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadSchema } from 'src/schemas/upload.schema';

@Module({
  imports: [
    MulterModule.register({
      dest: '../uploadsuser', // Diretório de destino para salvar os arquivos
      
    }),
    MongooseModule.forFeature([{ name: 'Upload', schema: UploadSchema }]),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
