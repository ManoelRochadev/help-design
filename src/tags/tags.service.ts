import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import tagsJson from '@db/tags.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { Type } from '../types/entities/type.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tags } from 'src/schemas/tag.schema';
import { Product } from 'src/products/entities/product.entity';
import { ProductDocument } from 'src/schemas/product.schema';

const tags = plainToClass(Tag, tagsJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(tags, options);

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tags.name) private readonly tagModel: Model<Tags>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>
  ) { }
  private tags: Tag[] = tags;

  async create(createTagDto: CreateTagDto) {
    const createdTag = new this.tagModel({
      ...createTagDto,
      created_at: new Date(),
      updated_at: new Date(),
      translated_languages: [
        createTagDto.language
      ]
    });

    const data = await createdTag.save();

    const dataWithId = {
      ...data.toObject(),
      id: data._id.toString(),
    };

    return dataWithId;
  }

  async findAll({ page, limit, search }: GetTagsDto) {
    let query = {};

    // Verifica se há parâmetros de pesquisa
    if (search) {
      const parseSearchParams = search.split(';');
      const searchText = {};

      // Monta os critérios de pesquisa
      parseSearchParams.forEach(searchParam => {
        const [key, value] = searchParam.split(':');
        searchText[key] = value;
      });

      // Adiciona os critérios de pesquisa à consulta
      query = { ...searchText };
    }

    // Executa a consulta com paginação
    const tags = await this.tagModel
      .find(query)
      .lean()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const count = await this.tagModel.countDocuments(query);

    const url = `/tags?limit=${limit}&search=${search || ''}`;

    // procurar produtos com as tags; as tags contêm array com os objetos de tags
    //const products = await this.productModel.find({ 'tags._id': { $in: tags.map(tag => tag._id) } }).lean().exec();


    return {
      data: tags.map(tag => ({
        ...tag,
        id: tag._id.toString(),
      })),
      ...paginate(count, page, limit, tags.length, url),
    };
  }

  async findOne(param: number | string, language: string) {
    // verifica se o parâmetro é um id do mongodb ou um slug
    const tag = await this.tagModel.findOne({slug: param}).lean().exec();
    const products = await this.productModel.find({ 'tags._id': tag._id }).lean().exec();
    if (!tag) {
      throw new NotFoundException(`Tag #${param} not found`);
    }

    return {
      ...tag,
      id: tag._id.toString(),
      products: products.map(product => ({
        ...product,
        id: product._id.toString(),
      })),
    };
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const tagUpdate = await this.tagModel.findByIdAndUpdate
      (id, { ...updateTagDto, updated_at: new Date() }, { new: true });

    if (!tagUpdate) {
      throw new NotFoundException(`Tag #${id} not found`);
    }

    return {
      ...tagUpdate.toObject(),
      id: tagUpdate._id.toString(),
    };
  }

  remove(id: number) {
    const deleteTag = this.tagModel.findByIdAndDelete(id);

    if (!deleteTag) {
      throw new NotFoundException(`Tag #${id} not found`);
    }
    
    return `This action removes a #${id} tag`;
  }
}
