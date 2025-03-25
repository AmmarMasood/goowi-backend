import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ required: true })
  name: string;

  @Prop()
  shortDescription: string;

  @Prop()
  industry: string;

  @Prop()
  location: string;

  @Prop()
  overview: string;

  @Prop()
  website: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop({ type: [String] })
  socialMediaLinks: string[];

  @Prop({ type: [String] })
  values: string[];

  @Prop({ type: Object })
  impactMetrics: Record<string, any>;

  @Prop({ type: [String] })
  supportTypes: string[];

  @Prop({ type: [String] })
  causesSupported: string[];

  @Prop({
    type: [
      {
        charityId: { type: MongooseSchema.Types.ObjectId, ref: 'Profile' },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
      },
    ],
  })
  charitiesSupported: Array<{ charityId: Profile; status: string }>;

  @Prop()
  bannerImage: string;

  @Prop()
  logoImage: string;

  @Prop({
    type: [
      {
        name: String,
        logo: String,
        link: String,
      },
    ],
  })
  certifications: Array<{ name: string; logo: string; link: string }>;

  // Unique slug for the profile URL
  @Prop({ required: true, unique: true })
  slug: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

// Index the slug field for faster lookups
ProfileSchema.index({ slug: 1 });
