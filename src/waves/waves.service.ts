import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateWaveDto } from './dto/create-wave.dto';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { Wave } from './schema/waves.schema';
import { Profile } from 'src/profiles/schemas/profile.schema';

@Injectable()
export class WavesService {
  constructor(
    @InjectModel(Wave.name) private waveModel: Model<Wave>,
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async create(creatorId: string, createWaveDto: CreateWaveDto): Promise<Wave> {
    console.log('test', createWaveDto);
    const creator = await this.profileModel
      .findOne({
        userId: creatorId,
      })
      .exec();

    if (!creator) {
      throw new NotFoundException(`Creator with ID ${creatorId} not found`);
    }
    const createdWave = new this.waveModel({
      ...createWaveDto,
      charityId: new Types.ObjectId(createWaveDto.charityId),
      creatorId: creator._id,
    });
    return createdWave.save();
  }

  async findAll(): Promise<Wave[]> {
    return this.waveModel.find().exec();
  }

  async findOne(id: string): Promise<Wave> {
    const wave = await this.waveModel.findById(id).exec();
    if (!wave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }
    return wave;
  }

  async findByCreator(creatorId: string): Promise<Wave[]> {
    const creator = await this.profileModel
      .findOne({ userId: creatorId })
      .exec();
    if (!creator) {
      throw new NotFoundException(`Creator with ID ${creatorId} not found`);
    }
    return this.waveModel
      .find({ creatorId: creator._id })
      .populate({
        path: 'creatorId', // Populate creatorId
        populate: {
          path: 'userId', // Populate userId inside creatorId
          select: 'firstName lastName email', // Select specific fields from User
        },
      })
      .populate({
        path: 'participants',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate('charityId')
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
  }

  async findByCharity(charityId: string): Promise<Wave[]> {
    return this.waveModel
      .find({ charityId })
      .populate({
        path: 'creatorId', // Populate creatorId
        populate: {
          path: 'userId', // Populate userId inside creatorId
          select: 'firstName lastName email', // Select specific fields from User
        },
      })
      .populate({
        path: 'participants',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate('charityId')
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
  }

  async findByCause(causeName: string): Promise<Wave[]> {
    return this.waveModel.find({ causeName }).exec();
  }

  async findByHashtag(hashtag: string): Promise<Wave[]> {
    return this.waveModel.find({ hashtag }).exec();
  }

  async findByTags(tags: string[]): Promise<Wave[]> {
    return this.waveModel.find({ tags: { $in: tags } }).exec();
  }

  async update(id: string, updateWaveDto: UpdateWaveDto): Promise<Wave> {
    const updatedWave = await this.waveModel
      .findByIdAndUpdate(id, updateWaveDto, { new: true })
      .exec();

    if (!updatedWave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }

    return updatedWave;
  }

  async addComment(
    id: string,
    comment: { profileId: string; content: string; isApproved?: boolean },
  ): Promise<Wave> {
    const wave = await this.waveModel.findById(id).exec();

    if (!wave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }

    wave.comments.push({
      ...comment,
      createdAt: new Date(),
      isApproved: comment.isApproved || false,
    } as any);

    return wave.save();
  }

  async addParticipant(id: string, userId: string): Promise<Wave> {
    console.log('reachhhhhhhed', id, userId);
    const wave = await this.waveModel.findById(id).exec();
    console.log('reachhhhhhhed 1', id, userId);
    if (!wave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }
    console.log('reachhhhhhhed 2', id, userId);
    const participant = await this.profileModel.findOne({ userId }).exec();
    if (!participant) {
      throw new NotFoundException(`Participant with ID ${userId} not found`);
    }

    wave.participants.push(participant._id as any);

    return wave.save();
  }

  async updateCharityApprovalStatus(id: string, status: string): Promise<Wave> {
    const wave = await this.waveModel.findById(id).exec();

    if (!wave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }

    wave.charityApprovalStatus = status;
    return wave.save();
  }

  async remove(id: string): Promise<Wave> {
    const deletedWave = await this.waveModel.findByIdAndDelete(id).exec();

    if (!deletedWave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }

    return deletedWave;
  }

  async getAllHashTags(): Promise<string[]> {
    const waves = await this.waveModel
      .find(
        { hashtag: { $exists: true, $ne: '' } },
        { hashtag: 1, participants: 1 },
      )
      .exec();

    const hashtagMap = new Map<string, number>();

    for (const wave of waves) {
      const hashtag = wave.hashtag?.trim();
      if (!hashtag) continue;

      const count = hashtagMap.get(hashtag) || 0;
      hashtagMap.set(hashtag, count + (wave.participants?.length || 0));
    }

    const sortedHashtags = Array.from(hashtagMap.entries())
      .sort((a, b) => b[1] - a[1]) // Descending by number of participants
      .map(([hashtag]) => hashtag);

    return sortedHashtags;
  }

  async findWavesWithFilters(
    filters: {
      hashtags?: string[];
      title?: string;
    },
    page = 1,
    limit = 10,
  ): Promise<{ data: Wave[]; total: number; page: number; limit: number }> {
    const query: any = {
      charityApprovalStatus: 'approved', // Ensure only approved waves are fetched
    };

    // Add filters for hashtags
    if (filters.hashtags && filters.hashtags.length > 0) {
      query.hashtag = { $in: filters.hashtags };
    }

    // Add filter for title (case-insensitive search)
    if (filters.title) {
      query.title = { $regex: filters.title, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    // Fetch waves with pagination
    const [data, total] = await Promise.all([
      this.waveModel
        .find(query)
        .populate({
          path: 'creatorId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        })
        .populate('charityId')
        .populate({
          path: 'participants',
          populate: {
            path: 'userId',
            select: 'firstName lastName email',
          },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .exec(),
      this.waveModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByParticipant(userId: string): Promise<Wave[]> {
    // Find the profile associated with the given userId
    const participantProfile = await this.profileModel
      .findOne({ userId })
      .exec();

    if (!participantProfile) {
      throw new NotFoundException(
        `Participant with userId ${userId} not found`,
      );
    }

    // Query waves where the participant's profileId is in the participants array
    return this.waveModel
      .find({ participants: participantProfile._id })
      .populate({
        path: 'creatorId', // Populate creatorId
        populate: {
          path: 'userId', // Populate userId inside creatorId
          select: 'firstName lastName email', // Select specific fields from User
        },
      })
      .populate({
        path: 'participants',
        populate: {
          path: 'userId',
          select: 'firstName lastName email',
        },
      })
      .populate('charityId', 'name industry location') // Populate charityId with specific fields
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
  }
}
