import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import wishlistsJSON from '@db/wishlists.json';
import { Product } from '../products/entities/product.entity';
import productsJson from '@db/products.json';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument } from 'src/schemas/product.schema';
import { UserDocument, UserInitial } from 'src/schemas/user.schema';

const products = plainToClass(Product, productsJson);
const wishlists = plainToClass(Wishlist, wishlistsJSON);

const options = {
  keys: ['answer'],
  threshold: 0.3,
};
const fuse = new Fuse(wishlists, options);

@Injectable()
export class MyWishlistService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  @InjectModel(UserInitial.name) private readonly userModel: Model<UserDocument>
) {}
  private wishlist: Wishlist[] = wishlists;
  private products: any = products;

  findAMyWishlists({ limit, page, search }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data: Product[] = this.products.slice(1, 7);
    const results = data.slice(startIndex, endIndex);
    const url = `/my-wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findAMyWishlist(id: number) {
    return this.wishlist.find((p) => p.id === id);
  }

  create(createWishlistDto: CreateWishlistDto) {
    return this.wishlist[0];
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    return this.wishlist[0];
  }

  delete(id: number) {
    return this.wishlist[0];
  }
}
