import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile } from './schemas/profile.schema';
import { CharitySupportDto, CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { slugify } from 'utils/slugify';
import { Wave } from 'src/waves/schema/waves.schema';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    @InjectModel(Wave.name) private waveModel: Model<Wave>,
  ) {}

  /**
   * Create a new profile
   */
  async create(
    userId: string,
    email: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    console.log('createProfileDto', userId);
    // Check if profile already exists for this user
    const existingProfile = await this.profileModel.findOne({ userId }).exec();
    if (existingProfile) {
      throw new BadRequestException('Profile already exists for this user');
    }

    // Generate slug from name if not provided
    const slug = createProfileDto.slug || slugify(email);

    // Check if slug is already taken
    const slugExists = await this.profileModel.findOne({ slug }).exec();
    if (slugExists) {
      throw new BadRequestException('Profile slug already exists');
    }

    const newProfile = new this.profileModel({
      ...createProfileDto,
      userId: new Types.ObjectId(userId),
      slug,
    });

    return newProfile.save();
  }

  /**
   * Get all profiles with pagination
   */
  async findAll(
    page = 1,
    limit = 10,
    filters?: Record<string, any>,
  ): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const query = filters || {};

    const [data, total] = await Promise.all([
      this.profileModel.find(query).skip(skip).limit(limit).exec(),
      this.profileModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single profile by ID
   */
  async findOne(id: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  /**
   * Get a profile by slug
   */
  async findBySlug(slug: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ slug }).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with slug ${slug} not found`);
    }
    return profile;
  }

  /**
   * Get a profile by user ID
   */
  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
    return profile;
  }

  /**
   * Update a profile
   */
  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    // Check if slug is being updated and ensure it's unique
    if (updateProfileDto.slug) {
      const slugExists = await this.profileModel
        .findOne({
          slug: updateProfileDto.slug,
          _id: { $ne: id },
        })
        .exec();

      if (slugExists) {
        throw new BadRequestException('Profile slug already exists');
      }
    }

    const updatedProfile = await this.profileModel
      .findByIdAndUpdate(id, updateProfileDto, { new: true })
      .exec();

    if (!updatedProfile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return updatedProfile;
  }

  /**
   * Delete a profile
   */
  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.profileModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return { deleted: true };
  }

  /**
   * Add a charity support to a profile
   */
  async addCharitySupport(
    id: string,
    charitySupport: CharitySupportDto,
  ): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    // Check if charity already exists in the support list
    const existingSupport = profile.charitiesSupported.find(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      (support) => support.charityId.toString() === charitySupport.charityId,
    );

    if (existingSupport) {
      throw new BadRequestException('Charity already supported');
    }

    profile.charitiesSupported.push(charitySupport as any);
    return profile.save();
  }

  /**
   * Update charity support status
   */
  async updateCharitySupport(
    id: string,
    charityId: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    const supportIndex = profile.charitiesSupported.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      (support) => support.charityId.toString() === charityId,
    );

    if (supportIndex === -1) {
      throw new NotFoundException(
        `Charity with ID ${charityId} not found in this profile's support list`,
      );
    }

    profile.charitiesSupported[supportIndex].status = status;
    return profile.save();
  }

  /**
   * Remove charity support
   */
  async removeCharitySupport(id: string, charityId: string): Promise<Profile> {
    const profile = await this.profileModel.findById(id).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    const initialLength = profile.charitiesSupported.length;
    profile.charitiesSupported = profile.charitiesSupported.filter(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      (support) => support.charityId.toString() !== charityId,
    );

    if (profile.charitiesSupported.length === initialLength) {
      throw new NotFoundException(
        `Charity with ID ${charityId} not found in this profile's support list`,
      );
    }

    return profile.save();
  }

  /**
   * Search profiles by name, industry, or location
   */
  async search(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Profile[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query, 'i');

    const searchQuery = {
      $or: [
        { name: searchRegex },
        { industry: searchRegex },
        { location: searchRegex },
        { causesSupported: searchRegex },
        { values: searchRegex },
      ],
    };

    const [data, total] = await Promise.all([
      this.profileModel.find(searchQuery).skip(skip).limit(limit).exec(),
      this.profileModel.countDocuments(searchQuery).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getAllCharities(): Promise<any> {
    const charities = await this.profileModel.aggregate([
      {
        $lookup: {
          from: 'users', // Ensure this matches the actual collection name
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: false, // Remove profiles without matching users
        },
      },
      {
        $match: {
          'user.role': 'charity', // Filter where user.role is "charity"
        },
      },
      {
        $project: {
          name: 1,
          industry: 1,
          location: 1,
          userId: 1,
          'user.email': 1,
          'user.role': 1,
        },
      },
    ]);

    console.log('Charities:', charities); // Debugging log
    return charities;
  }

  async getUserMetrics(profileId: string): Promise<any> {
    // 1. Total number of waves created by the user
    const totalWavesCreated = await this.waveModel.countDocuments({
      creatorId: profileId,
    });

    // 2. Total number of waves participated by the user
    const totalWavesParticipated = await this.waveModel.countDocuments({
      participants: profileId,
    });

    // 3. Total number of unique charities supported by the user
    const profile = await this.profileModel.findById(profileId).exec();
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${profileId} not found`);
    }
    const uniqueCharitiesSupported = profile.charitiesSupported.filter(
      (charity) => charity.status === 'approved',
    ).length;

    // 4. Total number of unique users that participated in the waves created by the user
    const uniqueParticipants = await this.waveModel.aggregate([
      {
        $match: { creatorId: new Types.ObjectId(profileId) }, // Match waves created by the user
      },
      {
        $unwind: '$participants', // Unwind the participants array
      },
      {
        $group: {
          _id: null,
          uniqueParticipants: { $addToSet: '$participants' }, // Collect unique participants
        },
      },
      {
        $project: {
          count: { $size: '$uniqueParticipants' }, // Count the unique participants
        },
      },
    ]);
    const totalUniqueParticipants =
      uniqueParticipants.length > 0 ? uniqueParticipants[0].count : 0;

    // 5. List of all waves.causeNames supported by the user
    const causeNames = await this.waveModel.distinct('causeName', {
      participants: profileId,
    });

    // Return the metrics
    return {
      totalWavesCreated,
      totalWavesParticipated,
      uniqueCharitiesSupported,
      totalUniqueParticipants,
      causeNames,
    };
  }
}
