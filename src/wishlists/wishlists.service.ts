import { Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import wishlistsJSON from '@db/wishlists.json';
import productsJson from '@db/products.json';
import { Product } from '../products/entities/product.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument } from 'src/schemas/product.schema';
import { UserDocument, UserInitial } from 'src/schemas/user.schema';
import jwt from 'jsonwebtoken';

const wishlists = plainToClass(Wishlist, wishlistsJSON);
const products = plainToClass(Product, productsJson);
const options = {
  keys: ['answer'],
  threshold: 0.3,
};
const fuse = new Fuse(wishlists, options);

@Injectable()
export class WishlistsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  @InjectModel(UserInitial.name) private readonly userModel: Model<UserDocument>
) {}
  private wishlist: Wishlist[] = wishlists;
  private products: any = products;

  findAllWishlists({ limit, page, search }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Wishlist[] = this.wishlist;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findWishlist(id: number) {
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

  async isInWishlist(product_id: string, token: string) {
    const extractToken = token.replace('Bearer', '').trim();

    if (!extractToken) {
      throw new UnauthorizedException();
    }

    const decoded = jwt.verify(extractToken, process.env.JWT_SECRET) as any;

    const user = await this.userModel.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user.wishlist_id.includes(product_id);
  }

  async toggle({ product_id }: CreateWishlistDto, token: string) {
    /*
    const product = this.products.find((p) => p.id === Number(product_id));

    product.in_wishlist = !product?.in_wishlist;

    return product.in_wishlist;
    */
    const extractToken = token.replace('Bearer', '').trim();

    if (!extractToken) {
      throw new UnauthorizedException();
    }

    const decoded = jwt.verify(extractToken, process.env.JWT_SECRET) as any;

    const user = await this.userModel.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedException();
    }
    // verify if product is in wishlist return true
    // if not return false

    if (user.wishlist_id.includes(product_id)) {
      user.wishlist_id = user.wishlist_id.filter((id) => id !== product_id);
      await user.save();
      return true;
    } else {
      user.wishlist_id.push(product_id);
      await user.save();
      return false;
    }
  }
}
