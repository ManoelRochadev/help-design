import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  AdminController,
  AllCustomerController,
  AllStaffsController,
  MyStaffsController,
  ProfilesController,
  UsersController,
  VendorController,
} from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInitial, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInitial.name, schema: UserSchema }]), // Importe o modelo aqui
  ],
  controllers: [
    UsersController,
    ProfilesController,
    AdminController,
    VendorController,
    MyStaffsController,
    AllStaffsController,
    AllCustomerController,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
