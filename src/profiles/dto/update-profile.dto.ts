import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCertificationDto } from './update-certificate.dto';
import { CharitySupportDto } from './create-profile.dto';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  overview?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  location?: string;

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
  values?: string[];

  @IsObject()
  @IsOptional()
  impactMetrics?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharitySupportDto)
  @IsOptional()
  charitiesSupported?: CharitySupportDto[];

  @IsString()
  @IsOptional()
  bannerImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  causesSupported?: string[];

  @IsString()
  @IsOptional()
  logoImage?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCertificationDto)
  @IsOptional()
  certifications?: UpdateCertificationDto[];

  @IsString()
  @IsOptional()
  slug?: string;
}
