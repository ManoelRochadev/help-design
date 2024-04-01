import { Address } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
// import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from './profile.entity';

export class User {
  id?: number | string;
  name: string;
  email: string;
  password?: string;
  profile?: Profile;
  shops?: Shop[];
  managed_shop?: Shop;
  is_active?: boolean = true;
  address?: Address[];
  permissions?: Permission[];
  // orders?: Order[];
  wallet?: Wallet;
  created_at: Date;
  updated_at: Date;
  followingShops?: Shop[];
}

export class Wallet {
  id?: string;
  total_points?: number;
  available_points?: number;
  used_points?: number;
  customer_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Permission extends CoreEntity {
  name?: string;
  guard_name?: string;
  pivot?: any;
}