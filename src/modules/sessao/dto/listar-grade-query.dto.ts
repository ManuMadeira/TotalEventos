import { IsOptional, IsDateString, IsString } from 'class-validator';

export class ListarGradeQueryDto {
  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  trilha?: string;
}
