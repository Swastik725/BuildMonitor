import { IsOptional, IsString, MinLength } from 'class-validator';

export class ConnectRepositoryDto {
  @IsString()
  @MinLength(1)
  repository!: string;

  /** Workflow file GitHub Actions should run for deployments, e.g. "deploy.yml". */
  @IsOptional()
  @IsString()
  workflowFile?: string;
}
