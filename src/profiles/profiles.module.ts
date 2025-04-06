import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { AuthModule } from 'src/auth/auth.module';
import { ProfileController } from './profiles.controller';
import { Wave, WaveSchema } from 'src/waves/schema/waves.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    MongooseModule.forFeature([{ name: Wave.name, schema: WaveSchema }]),
    AuthModule,
  ],
  controllers: [ProfileController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
