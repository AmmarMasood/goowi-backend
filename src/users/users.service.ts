import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from 'src/profiles/schemas/profile.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Profile.name) private readonly profileModel: Model<Profile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    // Remove password before returning
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { password, ...result } = savedUser.toObject();
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password').exec();
    const profile = await this.profileModel.findOne({ userId: id }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      user,
      profileExists: profile ? true : false,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  async activateUser(userId: string) {
    await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpires: null,
        },
        { new: true },
      )
      .exec();
  }

  async setEmailVerificationToken(userId: string, token: string) {
    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 1);

    await this.userModel
      .findByIdAndUpdate(userId, {
        verificationToken: token,
        verificationTokenExpires: expireAt,
      })
      .exec();
  }

  async findByVerificationToken(token: string) {
    return this.userModel
      .findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      })
      .exec();
  }
}
