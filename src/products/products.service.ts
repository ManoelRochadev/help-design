import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { paginate } from 'src/common/pagination/paginate';
import productsJson from '@db/products.json';
import popularProductsJson from '@db/popular-products.json';
import bestSellingProductsJson from '@db/best-selling-products.json';
import Fuse from 'fuse.js';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { GetFollowedShopsProducts } from './dto/get-followed-shops-products.dto';
import { GetBestSellingProductsDto } from './dto/get-best-selling-products.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProductDocument } from 'src/schemas/product.schema';
import { Model } from 'mongoose';

const products = plainToClass(Product, productsJson);
const popularProducts = plainToClass(Product, popularProductsJson);
const bestSellingProducts = plainToClass(Product, bestSellingProductsJson);

const options = {
  keys: [
    'name',
    'type.slug',
    'categories.slug',
    'status',
    'shop_id',
    'price',
    'author.slug',
    'tags.slug',
    'manufacturer.slug',
  ],
  threshold: 0.3,
};
const fuse = new Fuse(products, options);

@Injectable()
export class ProductsService {
  private products: any = products;
  private popularProducts: any = popularProducts;
  private bestSellingProducts: any = bestSellingProducts;
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) { }

  create(createProductDto: CreateProductDto) {
    const createdProduct = new this.productModel({
      ...createProductDto,
      in_wishlist: false,
      total_reviews: 0,
      ratings: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
    try {
      return createdProduct.save();
    } catch (error) {
      return error;
    }
  }

  async getProducts({ limit, page, search }: GetProductsDto): Promise<ProductPaginator> { 
    if (!page) page = 1;
    if (!limit) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data = await this.productModel.find();
    //console.log('data', data);
    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      let priceFilter;
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // For price
        if (key === 'price') priceFilter = value;
        if (key !== 'slug' && key !== 'price') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = await this.productModel.find({}).where({ $and: searchText })

      // Filter data throw price
      if (priceFilter) {
        const splitPrice = priceFilter.split(',');
        let min = 0;
        let max = 0;
        if (splitPrice.length === 2) {
          [min, max] = splitPrice;
        } else {
          max = splitPrice[0];
        }

        data = data.filter(
          (singleProduct) =>
            singleProduct.sale_price !== null &&
            singleProduct.sale_price >= min &&
            singleProduct.sale_price <= max,
        );
      }
    }

    // remover o _id e colocar id no lugar

    const results = data.slice(startIndex, endIndex);
    
    const url = `/products?search=${search}&limit=${limit}`;
    return {
      data: results.map((item) => {
        return {
          ...item.toObject(),
          id: item._id,
        };
      }),
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getProductBySlug(slug: string): Promise<Product> {
   const product = await this.productModel.findOne({
      slug: slug,
    });

    return {
      ...product.toObject(),
      id: product._id,
    }
  }

  async getPopularProducts({ limit, type_slug }: GetPopularProductsDto): Promise<Product[]> {
    // listar os produtos mais populares
    let data = []
    data = await this.productModel.find({
      ratings: { $gte: 4 },
    });

    data = data.map((item) => {
      return {
        ...item.toObject(),
        id: item._id,
      };
    });
    

    if (type_slug) {
      const results = data.filter((item) => item.type.slug === type_slug);
      return results.slice(0, limit);
    }

    return data?.slice(0, limit);
  }
  async getBestSellingProducts({ limit, type_slug }: GetBestSellingProductsDto): Promise<Product[]> {
    // listar os produtos mais vendidos
    let data = []
    data = await this.productModel.find({
      orders_count: { $gte: 4 },
    });

    data = data.map((item) => {
      return {
        ...item.toObject(),
        id: item._id,
      };
    });

    if (type_slug) {
      const results = data.filter((item) => item.type.slug === type_slug);
      return results.slice(0, limit);
    }
    return data?.slice(0, limit);
  }

  async followedShopsPopularProducts({
    limit,
    language,
  }: GetFollowedShopsProducts): Promise<Product[]> {
    try {
      let data = []
      data = await this.productModel.find({
        ratings: { $gte: 2 },
      });

      data = data.map((item) => {
        return {
          ...item.toObject(),
          id: item._id,
        };
      });
  
      return data?.slice(0, limit);
    } catch (error) {
      return error;
    }
  }
  async getProductsStock({ limit, page, search }: GetProductsDto): Promise<ProductPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data = []
    data = await this.productModel.find({
      in_stock: true,
    });

    const searchText: any = [];
    data = data.map((item) => {
      return {
        ...item.toObject(),
        id: item._id,
      };
    });

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      const results = data.filter((item) => {
        return searchText.every((searchItem) => {
          const [key, value] = Object.entries(searchItem)[0];
          return item[key] === value;
        });
      });

      const url = `/products-stock?search=${search}&limit=${limit}`;
      return {
        data: results.slice(startIndex, endIndex),
        ...paginate(data.length, page, limit, results.length, url),
      };
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/products-stock?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getDraftProducts({ limit, page, search }: GetProductsDto): Promise<ProductPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data = []
    data = await this.productModel.find({
      status: 'draft',
    });

    data = data.map((item) => {
      return {
        ...item.toObject(),
        id: item._id,
      };
    });

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      const results = data.filter((item) => {
        return searchText.every((searchItem) => {
          const [key, value] = Object.entries(searchItem)[0];
          return item[key] === value;
        });
      });

      const url = `/draft-products?search=${search}&limit=${limit}`;
      return {
        data: results.slice(startIndex, endIndex),
        ...paginate(data.length, page, limit, results.length, url),
      };
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/draft-products?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // atualizar um produto
    try {
      const updatedProduct = await this.productModel.findOneAndUpdate(
        { id: id },
        updateProductDto,
        { new: true },
      );

      return updatedProduct;
    } catch (error) {
      return error;
    }
  }

  async remove(id: number) {
    // remover um produto
    try {
      const removedProduct = await this.productModel.findOne()
        .deleteOne({ id: id })
        .exec();
  
        return `This action removes a #${id} product`;
    } catch (error) {
      return error;
    }
  }
}
