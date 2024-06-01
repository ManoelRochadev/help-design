import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import shopsJson from '@db/shops.json';
import userJson from '@db/users.json';
import nearShopJson from '@db/near-shop.json';
import Fuse from 'fuse.js';
import { GetShopsDto } from './dto/get-shops.dto';
import { paginate } from 'src/common/pagination/paginate';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { GetTopShopsDto } from './dto/get-top-shops.dto';
import { User } from 'src/users/entities/user.entity';
import { GetFollowedShops } from './dto/get-followed-shop.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ShopDb, ShopDocument } from 'src/schemas/shop.schema';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { UserDocument, UserInitial } from 'src/schemas/user.schema';

const shops = plainToClass(Shop, shopsJson);
const users = plainToClass(User, userJson);

const nearShops = plainToClass(Shop, nearShopJson);
const options = {
  keys: ['name', 'type.slug', 'is_active'],
  threshold: 0.3,
};
const fuse = new Fuse(shops, options);

@Injectable()
export class ShopsService {
  constructor(@InjectModel(ShopDb.name) private readonly shopModel: Model<ShopDocument>,
    @InjectModel(UserInitial.name) private readonly userModel: Model<UserDocument>) { }
  private shops: Shop[] = shops;
  private users: User[] = users;
  private nearShops: Shop[] = shops;

  async create(createShopDto: CreateShopDto, token: string) {
    const tokenUser = token.split(' ')[1].trim();

    if (!tokenUser) {
      throw new UnauthorizedException();
    }

    // decoding token to get user id
    const idUser = jwt.verify(tokenUser, process.env.JWT_SECRET) as any;

    const user = await this.userModel.findById(idUser.id).lean().exec();

    const slug = createShopDto.slug;

    // check if slug already exists
    const shopSlug = await this.shopModel.findOne({ slug }).lean().exec();

    if (shopSlug) {
      throw new ConflictException('Slug already exists');
    }

    const shop = await this.shopModel.create({
      ...createShopDto,
      is_active: false,
      products_count: 0,
      orders_count: 0,
      owner_id: user._id.toString(),
      owner: user,
    });

    const id = shop._id.toString();
    const shops = {
      id,
      ...createShopDto,
    }

    // update user shops
    await this.userModel.findByIdAndUpdate(idUser.id, {
      $push: {
        shops: shops
      }
    });

    return {
      id,
      ...createShopDto,
    }
  }

  async getShops({ search, limit, page }: GetShopsDto) {
    if (!page) page = 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = await this.shopModel.find().lean().exec();
    const dataWithId: Shop[] = data.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }))
    let results = dataWithId;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        results = results.filter(item => String(item[key]).toLowerCase().includes(value.toLowerCase()));
      }
    }
    // if (text?.replace(/%/g, '')) {
    //   data = fuse.search(text)?.map(({ item }) => item);
    // }
    const paginatedResults = results.slice(startIndex, endIndex);
    const url = `/shops?search=${search}&limit=${limit}`;

    return {
      data: paginatedResults,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getNewShops({ search, limit, page }: GetShopsDto) {
    if (!page) page = 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const datadb = await this.shopModel.find().lean().exec();
    const dataWithId: Shop[] = datadb.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }))
    let data: Shop[] = dataWithId.filter((s) => s.is_active === false);

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = data.filter(item => String(item[key]).toLowerCase().includes(value.toLowerCase()));
      }
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/new-shops?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getStaffs({ shop_id, limit, page }: GetStaffsDto) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let staffs: Shop['staffs'] = [];

    if (shop_id) {
      // staffs = this.shops.find((p) => p.id === Number(shop_id))?.staffs ?? [];
      staffs = (await this.shopModel.findById(shop_id)).staffs;
    }
    const results = staffs?.slice(startIndex, endIndex);
    const url = `/staffs?limit=${limit}`;

    return {
      data: results,
      ...paginate(staffs?.length, page, limit, results?.length, url),
    };
  }

  async getShop(slug: string): Promise<Shop> {
    //return this.shops.find((p) => p.slug === slug);
    const data = await this.shopModel.findOne({
      slug
    }).lean().exec();

    const dataWithId: Shop = data ? { id: data._id.toString(), ...data } : null;

    return dataWithId;
  }

  getNearByShop(lat: string, lng: string) {
    return nearShops;
  }

  async update(id: number | string, updateShopDto: UpdateShopDto) {
    console.log(id)
    const updatedShop = await this.shopModel.findByIdAndUpdate(id, updateShopDto, { new: true }).lean().exec();
    // atualizar no banco

    return updatedShop
  }

  async approve(id: number | string) {
    //const shop = this.shops.find((s) => s.id === Number(id));
    // função ainda não achei implementação
    const shop = await this.shopModel.findByIdAndUpdate(id, { is_active: true }, { new: true }).lean().exec();

    return shop;
  }
                                                                                                                                              
  async remove(id: number | string) {
    // apagar no banco de dados a loja
    //return this.shops[0];
    const shop = await this.shopModel.findByIdAndDelete(id).lean().exec();
    return shop;
  }

  async topShops({ search, limit, page }: GetTopShopsDto) {
    if (!page) page = 1;
    if (!limit) limit = 15;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const dataInitial  = await this.shopModel.find().lean().exec();
    let data: Shop[] = dataInitial.map(({ _id, ...rest }) => ({ id: _id.toString(), ...rest }));

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      /*
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        searchText.push({
          [key]: value,
        });
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
      */
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        searchText.push(value);

        data = data.filter(item => String(item[key]).toLowerCase().includes(value.toLowerCase()));
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/top-shops?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async disapproveShop(id: number | string) {
    //const shop = this.shops.find((s) => s.id === Number(id));
    const shop = await this.shopModel.findByIdAndUpdate(id, { is_active: false }, { new: true }).lean().exec();

    return shop;
  }

  async approveShop(id: number | string) {
    //const shop = this.shops.find((s) => s.id === Number(id));
    const shop = await this.shopModel.findByIdAndUpdate(id, { is_active: true }, { new: true }).lean().exec();

    return shop;
  }

  async followShop(shop_id: any, tokenUser: any) {
    const token = tokenUser.split(' ')[1].trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    if (!decoded) {
      throw new UnauthorizedException();
    }

    const idUser = decoded.id;
    const user = await this.userModel.findById(idUser).lean().exec();
    const shop = await this.shopModel.findById(shop_id).lean().exec();
    const isFollowed = user.followingShops?.filter((s) => s.id === shop_id).map(s => s.id);

    if (isFollowed[0] === shop_id) {
      /*
      user.shops = user.shops.filter((s) => s !== shop_id);
      return true;
      */
      // remove shop from user followingShops
      await this.userModel.findByIdAndUpdate(idUser, {
        $pull: {
          followingShops: {id: shop_id}
        }
      });

      return false;
    }

    const shopWithId = {
      id: shop._id.toString(),
      ...shop,
    }

    user.shops = user.shops.concat(shopWithId);

    await this.userModel.findByIdAndUpdate(idUser, {
      followingShops: user.shops
    });

    return true;
  }

  async getFollowShop(shop_id: any, tokenUser: any) {
    const token = tokenUser.split(' ')[1].trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

    if (!decoded) {
      throw new UnauthorizedException();
    }

    const user = await this.userModel.findById(decoded.id).lean().exec();
    const isFollowed = user.followingShops?.filter((s) => s.id === shop_id).map(s => s.id);

    if (isFollowed[0] === shop_id) {
      //user.shops = user.followingShops.filter((s) => s !== shop_id);
      return true;
    }

    return false;
  }

  // followedShops({ limit }: GetFollowedShops): Shop[] {
  //   return this.shops?.slice(0, limit);
  // }
}
