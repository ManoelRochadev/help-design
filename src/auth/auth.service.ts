import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpException
} from '@nestjs/common';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  CoreResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyForgetPasswordDto,
  SocialLoginDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto,
} from './dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { plainToClass } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import usersJson from '@db/users.json';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserInitial } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';

const users = plainToClass(User, usersJson);

@Injectable()
export class AuthService {
  constructor(@InjectModel(UserInitial.name) private readonly userModel: Model<UserDocument>) { }
  private users: User[] = users;

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: createUserInput.email });

    if (user) {
      throw new ConflictException('Email já cadastrado!');
    }

    const userData = {
      ...createUserInput,
      created_at: new Date(),
      updated_at: new Date(),
      permissions: createUserInput.permission ,
    };

    const createdUser = new this.userModel(userData);

    await createdUser.save();

    const id = createdUser._id.toString();

    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    const permissions = createdUser.permissions.map(data => {
      return data.name
    })

    return {
      token: token,
      permissions: permissions,
    };
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const email = await this.userModel.findOne({ email: loginInput.email });
    const password = await this.userModel.findOne({ password: loginInput.password });
    if (!email) {
      throw new HttpException('Email ou senha inválidos', 400);
    }

    if (!password) {
      throw new HttpException('Email ou senha inválidos', 400);
    }

    const id = email._id.toString();
    const permissions = email.permissions.map((permission) => permission.name);

    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    return {
      token,
      permissions: permissions,
      role: 'customer',
    };
  }

  async changePassword(
    changePasswordInput: ChangePasswordDto,
  ): Promise<CoreResponse> {
    const oldPassword = changePasswordInput.oldPassword;
    const newPassword = changePasswordInput.newPassword;
    const id = changePasswordInput.token;
    // decode token
    const decoded = jwt.verify(id, process.env.JWT_SECRET) as any;

    if (!decoded) {
      throw new UnauthorizedException();
    }

    const user = await this.userModel.findOne({ _id: decoded.id });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.password !== oldPassword) {
      throw new ConflictException('Old password is incorrect');
    }

    user.password = newPassword;

    try {
      await user.save();
      return {
        success: true,
        message: 'Password change successful',
      };
    } catch (error) {
      throw new HttpException('Erro interno do servidor', 500);
    }
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(forgetPasswordInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(verifyForgetPasswordTokenInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreResponse> {
    console.log(resetPasswordInput);

    return {
      success: true,
      message: 'Password change successful',
    };
  }

  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    console.log(socialLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
      role: 'customer',
    };
  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    console.log(otpLoginDto);
    return {
      token: 'jwt token',
      permissions: ['super_admin', 'customer'],
      role: 'customer',
    };
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreResponse> {
    console.log(verifyOtpInput);
    return {
      message: 'success',
      success: true,
    };
  }

  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    console.log(otpInput);
    return {
      message: 'success',
      success: true,
      id: '1',
      provider: 'google',
      phone_number: '+919494949494',
      is_contact_exist: true,
    };
  }

  // async getUsers({ text, first, page }: GetUsersArgs): Promise<UserPaginator> {
  //   const startIndex = (page - 1) * first;
  //   const endIndex = page * first;
  //   let data: User[] = this.users;
  //   if (text?.replace(/%/g, '')) {
  //     data = fuse.search(text)?.map(({ item }) => item);
  //   }
  //   const results = data.slice(startIndex, endIndex);
  //   return {
  //     data: results,
  //     paginatorInfo: paginate(data.length, page, first, results.length),
  //   };
  // }
  // public getUser(getUserArgs: GetUserArgs): User {
  //   return this.users.find((user) => user.id === getUserArgs.id);
  // }
  async me(token: string): Promise<User> {
    // Extract bearer
    const extractToken = token.replace('Bearer', '').trim();

    if (!extractToken) {
      throw new UnauthorizedException();
    }

    const decoded = jwt.verify(extractToken, process.env.JWT_SECRET) as any;

    const user = await this.userModel.findOne({
      _id: decoded.id,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const user2 = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      profile: user.profile,
      shops: user.shops,
      managed_shop: user.managed_shop,
      is_active: user.is_active,
      address: user.address,
      permissions: user.permissions,
      wallet: user.wallet,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }

    // FIXME
    // make empty shops
    // this.users[0].shops = [];


    // updateUser(id: number, updateUserInput: UpdateUserInput) {
    //   return `This action updates a #${id} user`;
    // }
    return user2
  }
}
