import { IsOptional, IsString } from 'class-validator';

export class CreateTerminalSessionDto {
  @IsOptional()
  @IsString()
  shell?: string;
}
