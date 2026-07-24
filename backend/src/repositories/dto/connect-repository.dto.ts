import { IsString, MinLength } from 'class-validator';

export class ConnectRepositoryDto {
  @IsString()
  @MinLength(1)
  repository!: string;
}
