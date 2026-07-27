import { IsOptional, IsString } from 'class-validator';

export class TriggerDeploymentDto {
  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  commitMessage?: string;
}