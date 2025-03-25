import { Module } from '@nestjs/common';
import { WavesService } from './waves.service';
import { WavesController } from './waves.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wave, WaveSchema } from './schema/waves.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wave.name, schema: WaveSchema }]),
  ],
  providers: [WavesService],
  controllers: [WavesController],
})
export class WavesModule {}
