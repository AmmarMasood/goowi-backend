import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateCertificationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
