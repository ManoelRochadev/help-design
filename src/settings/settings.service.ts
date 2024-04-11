import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import settingsJson from '@db/settings.json';
import { Settings } from 'src/schemas/product.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingsDocument } from 'src/schemas/settings.schema';

const settings = plainToClass(Setting, settingsJson);

@Injectable()
export class SettingsService {
  private settings: Setting = settings;
  constructor(@InjectModel(Settings.name) private readonly productModel: Model<SettingsDocument>) { }

  async create(createSettingDto: CreateSettingDto) {
    const create = await this.productModel.create({
      ...createSettingDto,
      translated_languages: [createSettingDto.language],
      created_at: new Date(),
      updated_at: new Date(),
    });

    return create
  }

  async findAll(): Promise<Setting> {
    try {
      const data = await this.productModel.find().exec();

      const dataWithId: Setting[] = data.map((item) => {
        return {
          ...item.toObject(),
          id: item._id.toString(),
        }
      });

      return dataWithId[0];
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  async update(id: number | string, updateSettingDto: UpdateSettingDto) {
    try {

      const settings = await this.productModel.find().lean().exec();
      const idbd = settings[0]._id.toString();
      
      const update = await this.productModel.findByIdAndUpdate(idbd, {
        ...updateSettingDto,
        updated_at: new Date(),
      },
        { new: true }
      );

      const dataWithId: Setting = {
        ...update.toObject(),
        id: update._id.toString(),
      }

      return dataWithId;
    } catch (error) {
      return error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
