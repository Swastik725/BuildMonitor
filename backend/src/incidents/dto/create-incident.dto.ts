import { IsString, MinLength } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @MinLength(3)
  title!: string;
}