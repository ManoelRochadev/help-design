import { HttpException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';
import { ConflictException } from '@nestjs/common';

import typesJson from '@db/types.json';
import Fuse from 'fuse.js';
import { GetTypesDto } from './dto/get-types.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Types} from 'src/schemas/type.schema';
import { Model } from 'mongoose';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  constructor(@InjectModel(Types.name) private readonly typeModel: Model<Types>) { }
  private types: Type[] = types;

  async getTypes({ text, search }: GetTypesDto) {
    let query = {};
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        query[key] = value;
      }
    }

    if (text?.replace(/%/g, '')) {
      query['name'] = { $regex: text, $options: 'i' };
    }

    const types = await this.typeModel.find(query).lean().exec();
    return types.map((type) => ({
      ...type,
      id: type._id.toString(),
    }));
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const types = await this.typeModel.findOne({ slug }).lean().exec();
    if (!types) {
      throw new HttpException('Type not found', 404);
    }
    return {
      ...types,
      id: types._id.toString(),
    };
  }

  async create(createTypeDto: CreateTypeDto) {
    // verify if the type already exists
    const type = await this.typeModel.findOne({ slug: createTypeDto.slug }).lean().exec();

    if (type) {
      throw new ConflictException('Type already exists');
    }
      const createdType = new this.typeModel({
        ...createTypeDto,
        created_at: new Date(),
        updated_at: new Date(),
        translated_languages: [createTypeDto.language]
      });
      const create = await createdType.save();

      const createsTypeWithId = {
        ...create,
        id: create._id
      }
      return createsTypeWithId
  }

  findAll() {
    return `This action returns all types`;
  }

  findOne(id: number) {
    return `This action returns a #${id} type`;
  }

  async update(id: number | string, updateTypeDto: UpdateTypeDto) {
    const updatedType = await this.typeModel.findByIdAndUpdate(id, {
      ...updateTypeDto,
      updated_at: new Date()
    }, { new: true }).lean().exec();

    if (!updatedType) {
      throw new HttpException('Type not found', 404);
    }

    return {
      ...updatedType,
      id: updatedType._id.toString()
    }
  }

  remove(id: number | string) {
    const deleteType = this.typeModel.findByIdAndDelete(id).lean().exec();

    if (!deleteType) {
      throw new HttpException('Type not found', 404);
    }
    
    return `This action removes a #${id} type`;
  }
}
