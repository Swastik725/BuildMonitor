import { IsString, IsOptional, IsEnum, IsUUID, MinLength } from 'class-validator';
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
}