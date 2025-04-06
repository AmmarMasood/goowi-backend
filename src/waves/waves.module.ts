import { Module } from '@nestjs/common';
import { WavesService } from './waves.service';
import { WavesController } from './waves.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wave, WaveSchema } from './schema/waves.schema';
import { Profile, ProfileSchema } from 'src/profiles/schemas/profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wave.name, schema: WaveSchema }]),
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
  ],
  providers: [WavesService],
  controllers: [WavesController],
})
export class WavesModule {}
