import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateWaveDto } from './dto/create-wave.dto';
import { UpdateWaveDto } from './dto/update-wave.dto';
import { Wave } from './schema/waves.schema';

@Injectable()
export class WavesService {
  constructor(@InjectModel(Wave.name) private waveModel: Model<Wave>) {}

  async create(createWaveDto: CreateWaveDto): Promise<Wave> {
    const createdWave = new this.waveModel(createWaveDto);
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
    return this.waveModel.find({ creatorId }).exec();
  }

  async findByCharity(charityId: string): Promise<Wave[]> {
    return this.waveModel.find({ charityId }).exec();
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

  async addParticipant(
    id: string,
    participant: { profileId: string; status?: string },
  ): Promise<Wave> {
    const wave = await this.waveModel.findById(id).exec();

    if (!wave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }

    wave.participants.push({
      ...participant,
      status: participant.status || 'pending',
    } as any);

    return wave.save();
  }

  async updateParticipantStatus(
    id: string,
    profileId: string,
    status: string,
  ): Promise<Wave> {
    const wave = await this.waveModel.findById(id).exec();

    if (!wave) {
      throw new NotFoundException(`Wave with ID ${id} not found`);
    }

    const participantIndex = wave.participants.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      (p) => p.profileId.toString() === profileId,
    );

    if (participantIndex === -1) {
      throw new NotFoundException(
        `Participant with ID ${profileId} not found in wave ${id}`,
      );
    }

    wave.participants[participantIndex].status = status;
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
}
