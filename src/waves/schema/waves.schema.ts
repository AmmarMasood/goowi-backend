import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Profile } from 'src/profiles/schemas/profile.schema';

// Enum for support types
export enum SupportType {
  VOLUNTEERING = 'volunteering',
  DONATION = 'donation',
  SPONSORSHIP = 'sponsorship',
  ENDORSEMENT = 'endorsement',
  IN_KIND = 'in-kind',
}

@Schema({ timestamps: true })
export class Wave extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Profile' })
  creatorId: Profile;

  @Prop({ required: true })
  title: string;

  @Prop()
  shortDescription: string;

  @Prop()
  longDescription: string;

  @Prop({ default: false })
  isNewWave: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Wave' })
  parentWaveId: Wave;

  @Prop()
  causeName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Profile' })
  charityId: Profile;

  @Prop({ type: [{ type: String, enum: Object.values(SupportType) }] })
  supportTypes: SupportType[];

  @Prop()
  location: string;

  @Prop()
  eventLink: string;

  @Prop()
  monetaryValue: number;

  @Prop()
  currency: string;

  @Prop({ default: false })
  isMonetaryValueVisible: boolean;

  @Prop({ type: [String] })
  imageUrls: string[];

  @Prop({ type: [String] })
  videoUrls: string[];

  @Prop({ type: [String] })
  documentUrls: string[];

  @Prop({ type: [String] })
  tags: string[];

  @Prop()
  hashtag: string;

  @Prop({ default: true })
  allowComments: boolean;

  @Prop({
    type: [
      {
        profileId: { type: MongooseSchema.Types.ObjectId, ref: 'Profile' },
        content: String,
        createdAt: { type: Date, default: Date.now },
        isApproved: { type: Boolean, default: false },
      },
    ],
  })
  comments: Array<{
    profileId: Profile;
    content: string;
    createdAt: Date;
    isApproved: boolean;
  }>;

  @Prop({
    type: [
      {
        profileId: { type: MongooseSchema.Types.ObjectId, ref: 'Profile' },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
      },
    ],
  })
  participants: Array<{
    profileId: Profile;
    status: string;
  }>;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  charityApprovalStatus: string;
}

export const WaveSchema = SchemaFactory.createForClass(Wave);

// Indexes for faster queries
WaveSchema.index({ creatorId: 1 });
WaveSchema.index({ charityId: 1 });
WaveSchema.index({ causeName: 1 });
WaveSchema.index({ hashtag: 1 });
WaveSchema.index({ tags: 1 });
