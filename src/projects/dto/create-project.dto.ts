import { IsString, IsOptional, IsEnum, IsUUID, MinLength, IsUrl, IsBoolean } from 'class-validator';
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

  /**
   * Gates both the health-check scheduler and the metrics collector.
   * Defaults to false so newly-created (possibly half-built) projects
   * aren't checked/measured until the person explicitly flips this on.
   */
  @IsOptional()
  @IsBoolean()
  monitoringEnabled?: boolean;
}