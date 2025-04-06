import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsUrl,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCertificationDto } from './create-certificate.dto';

export class CharitySupportDto {
  @IsMongoId()
  charityId: string;

  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: string = 'pending';
}

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  industry: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  overview: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  location: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsUrl()
  @IsOptional()
  website?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  socialMediaLinks?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  causesSupported?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];

  @IsObject()
  @IsOptional()
  impactMetrics?: Record<string, any>;

  @IsArray()
  @Type(() => CharitySupportDto)
  @IsOptional()
  charitiesSupported?: CharitySupportDto[];

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsString()
  @IsOptional()
  logoImage?: string;

  @IsArray()
  @Type(() => CreateCertificationDto)
  @IsOptional()
  certifications?: CreateCertificationDto[];

  @IsString()
  @IsOptional()
  slug?: string;
}

export class UpdateProfileDto extends CreateProfileDto {}
