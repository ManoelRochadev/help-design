import { Injectable } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import * as AWS from 'aws-sdk';
import { InjectModel } from '@nestjs/mongoose';
import { Upload } from 'src/schemas/upload.schema';
import { Model } from 'mongoose';
import { CreateUploadDto } from './dto/create-upload.dto';

@Injectable()
export class UploadsService {
  constructor(@InjectModel(Upload.name) private uploadModel: Model<Upload>) { }

  async uploadFile(uploadDto: CreateUploadDto[]) {
 //   console.log(uploadDto)

    /*
    const folderName = file[0].location.split('/')[3];
    const fileName = file[0].location.split('/')[4];

    return [
      {
        id: folderName,
        original: file[0].location,
        thumbnail: file[0].location,
      }
    ]
    */
    const dataReturn = await Promise.all(uploadDto.map(async (file) => {
      const createdUpload = new this.uploadModel(file);
      const upload = await createdUpload.save();

      // ultimo item do split
      // Split na string
      const splitPath = file.filePath.split('/');
      const filename = splitPath[splitPath.length - 1];

      const dataWithId = {
        id: upload.id,
        original: `${process.env.URL_BASE}/uploads/${filename}`,
        thumbnail: `${process.env.URL_BASE}/uploads/${filename}`,
      }

      return dataWithId;
    }));

    return dataReturn;
  }
  findAll() {
    return `This action returns all uploads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}
