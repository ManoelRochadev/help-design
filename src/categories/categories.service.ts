import { HttpException, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import Fuse from 'fuse.js';
import categoriesJson from '@db/categories.json';
import { paginate } from 'src/common/pagination/paginate';
import { Model } from 'mongoose';
import { Categorie } from 'src/schemas/categorie.schema';
import { InjectModel } from '@nestjs/mongoose';

const categories = plainToClass(Category, categoriesJson);
const options = {
  keys: ['name', 'type.slug'],
  threshold: 0.3,
};
const fuse = new Fuse(categories, options);

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Categorie.name) private readonly categoryModel: Model<Categorie>) { }
  private categories: Category[] = categories;

  async create(createCategoryDto: CreateCategoryDto) {
    // verificar se o slug já existe se sim retornar erro

    const category = await this.categoryModel.findOne({ slug: createCategoryDto.slug }).lean().exec();

    if (category) {
      throw new HttpException('Category already exists', 409);
    }

    const parent = createCategoryDto.parent ? await this.categoryModel.findById(createCategoryDto.parent).lean().exec() : null;

    const parentWithId = parent ? {
      ...parent,
      id: parent._id.toString()
    } : null;

    const createdCategory = new this.categoryModel({
      ...createCategoryDto,
      created_at: new Date(),
      updated_at: new Date(),
      translated_languages: [createCategoryDto.language],
      parent: parentWithId,
      parent_id: parentWithId?._id
    });

    const data = await createdCategory.save();

    const dataWithId = {
      ...data.toObject(),
      id: data._id.toString()
    }

    // update do children no parent
    if (parentWithId) {
      await this.categoryModel.findByIdAndUpdate(parentWithId.id, {
        $push: { children: dataWithId }
      }, { new: true });
    }
    return dataWithId
  }

  async getCategories({ limit, page, search, parent }: GetCategoriesDto) {
    if (!page) page = 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let query = {};

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        query[key] = value;
      }
    }

    if (parent === 'null') {
      query['parent'] = null;
    } else if (parent) {
      const parentObj = await this.categoryModel.findOne({ slug: parent }).lean().exec();
      query['parent'] = parentObj?._id;
    }

    const totalCategories = await this.categoryModel.countDocuments(query);
    const data = await this.categoryModel.find(query).skip(startIndex).limit(limit).lean().exec();

    const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`;
    return {
      data: data.map((category) => ({
        ...category,
        id: category._id.toString()
      })),
      ...paginate(totalCategories, page, limit, data.length, url),
    };
  }

  async getCategory(param: string, language: string): Promise<Category> {
    /*
    return this.categories.find(
      (p) => p.id === Number(param) || p.slug === param,
    );
    */

    const category = await this.categoryModel.findOne({ slug: param }).lean().exec();

    if (!category) {
      throw new HttpException('Category not found', 404);
    }

    const categoryWithId = {
      ...category,
      id: category._id.toString()
    }

    return categoryWithId;
  }

  async update(id: number | string, updateCategoryDto: UpdateCategoryDto) {
    // verificar se o slug já existe se sim retornar erro
    const categorySlug = await this.categoryModel.findOne({ slug: updateCategoryDto.slug }).lean().exec();

    if (categorySlug && categorySlug._id.toString() !== id.toString()) {
      throw new HttpException('Category already exists', 409);
    }

    const category = await this.categoryModel.findById(id).lean().exec();

    if (!category) {
      throw new HttpException('Category not found', 404);
    }

    const parent = updateCategoryDto.parent ? await this.categoryModel.findById(updateCategoryDto.parent).lean().exec() : null;

    const parentWithId = parent ? {
      ...parent,
      id: parent._id.toString()
    } : null;

    const data = {
      name: updateCategoryDto.name,
      slug: updateCategoryDto.slug,
      details: updateCategoryDto.details,
      icon: updateCategoryDto.icon,
      language: updateCategoryDto.language,
      updated_at: new Date(),
      translated_languages: [updateCategoryDto.language],
      parent: parentWithId,
      parent_id: updateCategoryDto.parent
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, data, { new: true });

    const updatedCategoryWithId = {
      ...updatedCategory.toObject(),
      id: updatedCategory._id.toString()
    }


    // update do children no parent
    if (parentWithId) {
      await this.categoryModel.findByIdAndUpdate(parentWithId.id, {
        $push: { children: updatedCategoryWithId }
      }, { new: true });
    }

    return updatedCategoryWithId;
  }

  async remove(id: number | string) {
    const deleteCategory = this.categoryModel.findByIdAndDelete(id).lean().exec();

    if (!deleteCategory) {
      throw new HttpException('Category not found', 404);
    }

    // procuro se existe alguma categoria que tenha o id do pai igual ao id da categoria que foi deletada
    const children = await this.categoryModel.find({ parent_id: id }).lean().exec();

    // se existir, eu removo o id do pai e o campo parent
    if (children.length) {
      for (const child of children) {
        await this.categoryModel.findByIdAndUpdate(child._id, {
          parent_id: null,
          parent: null
        }, { new: true });
      }
    }

    // procuro se existe alguma categoria que tenha o id do pai igual ao id da categoria que foi deletada
    const parent = await this.categoryModel.findOne({ 'children.id': id }).lean().exec();

    // se existir, eu removo o id do pai e o campo parent
    if (parent) {
      parent.children = parent.children.filter(child => child.id.toString() !== id.toString());
      await this.categoryModel.findByIdAndUpdate(parent._id, { children: parent.children }, { new: true });
    }
      return deleteCategory;
    }
  }
