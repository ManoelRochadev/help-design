import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { GetShopsDto, ShopPaginator } from './dto/get-shops.dto';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { UserPaginator } from 'src/users/dto/get-users.dto';
import { GetTopShopsDto } from './dto/get-top-shops.dto';
import { GetFollowedShops } from './dto/get-followed-shop.dto';
import { Shop } from './entities/shop.entity';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  create(@Body() createShopDto: CreateShopDto, @Req() req: any) {
    return this.shopsService.create(createShopDto, req?.headers?.authorization);
  }

  @Get()
  async getShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getShops(query);
  }

  @Get(':slug')
  async getShop(@Param('slug') slug: string) {
    return this.shopsService.getShop(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string | number) {
    return this.shopsService.remove(id);
  }

  @Post('approve')
  approveShop(@Param('id') id: string) {
    return this.shopsService.approve(id);
  }
}

@Controller('disapprove-shop-test')
export class DisapproveShop {
  constructor(private shopsService: ShopsService) {}

  @Post()
  disapproveShop(@Param('id') id: number | string) {
    return this.shopsService.approve(id);
  }
}

@Controller('top-shops')
export class TopShopsController {
  constructor(private shopsService: ShopsService) {}

  @Get()
  async topShops(@Query() query: GetTopShopsDto): Promise<ShopPaginator> {
    return this.shopsService.topShops(query);
  }
}

@Controller('staffs')
export class StaffsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  create(@Body() createShopDto: CreateShopDto, @Req() req: any){
    return this.shopsService.create(createShopDto, req?.headers?.authorization);
  }

  @Get()
  async getStaffs(@Query() query: GetStaffsDto): Promise<UserPaginator> {
    return this.shopsService.getStaffs(query);
  }

  @Get(':slug')
  async getShop(@Param('slug') slug: string) {
    return this.shopsService.getShop(slug);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopsService.remove(+id);
  }
}

@Controller('disapprove-shop')
export class DisapproveShopController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  async disapproveShop(@Body('id') id: number | string) {
    return this.shopsService.disapproveShop(id);
  }
}

@Controller('approve-shop')
export class ApproveShopController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  async approveShop(@Body('id') id) {
    return this.shopsService.approveShop(id);
  }
}

@Controller('follow-shop')
export class FollowShopController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  async followShop(@Body('shop_id') shop_id, @Req() req: any) {
    return this.shopsService.followShop(shop_id, req?.headers?.authorization);
  }

  @Get()
  async getFollowShop( @Query('shop_id') shop_id: string, @Req() req: any){
    return this.shopsService.getFollowShop(shop_id, req?.headers?.authorization);
  }
}

@Controller('followed-shops')
export class FollowedShops {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  async followedShopsPopularProducts(
    @Query() query: GetShopsDto,
  ): Promise<ShopPaginator> {
    return this.shopsService.getShops(query);
  }
}
@Controller('near-by-shop')
export class NearByShopController {
  constructor(private shopsService: ShopsService) {}

  @Get(':lat/:lng')
  async getNearByShop(@Param('lat') lat: string, @Param('lng') lng: string) {
    return this.shopsService.getNearByShop(lat, lng);
  }
}

@Controller('new-shops')
export class NewShopsController {
  constructor(private shopsService: ShopsService) {}

  @Get()
  async getNewShops(@Query() query: GetShopsDto): Promise<ShopPaginator> {
    return this.shopsService.getNewShops(query);
  }
}
