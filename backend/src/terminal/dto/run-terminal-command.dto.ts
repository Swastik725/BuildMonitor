import { IsString, MinLength } from 'class-validator';

export class RunTerminalCommandDto {
  @IsString()
  @MinLength(1)
  command!: string;
}
