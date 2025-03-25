import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateCertificationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
