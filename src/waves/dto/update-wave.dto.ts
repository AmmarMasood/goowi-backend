import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommentDto, ParticipantDto } from './create-wave.dto';
import { SupportType } from '../schema/waves.schema';

export class UpdateWaveDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsBoolean()
  isNewWave?: boolean;

  @IsOptional()
  @IsMongoId()
  parentWaveId?: string;

  @IsOptional()
  @IsString()
  causeName?: string;

  @IsOptional()
  @IsMongoId()
  charityId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(SupportType, { each: true })
  supportTypes?: SupportType[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  eventLink?: string;

  @IsOptional()
  @IsNumber()
  monetaryValue?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isMonetaryValueVisible?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentUrls?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  hashtag?: string;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  comments?: CommentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];

  @IsOptional()
  @IsString()
  charityApprovalStatus?: 'pending' | 'approved' | 'rejected';
}
