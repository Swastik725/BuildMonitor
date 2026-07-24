import { IsString, IsOptional, IsEnum, IsUUID, MinLength, IsUrl } from 'class-validator';
import { Visibility } from '../../../generated/prisma/enums';

export class CreateProjectDto {
  @IsUUID()
  organizationId!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Visibility)
  visibility!: Visibility;

  @IsString()
  defaultBranch!: string;

  @IsOptional()
  @IsUrl()
  repositoryUrl?: string;

  @IsOptional()
  @IsUrl()
  productionUrl?: string;

  @IsOptional()
  @IsUrl()
  healthUrl?: string;

  @IsOptional()
  @IsString()
  branch?: string;
}