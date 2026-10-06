import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class RealizarCheckinDto {
  @IsString()
  @IsNotEmpty()
  codigoIngresso: string;

  @IsInt()
  @IsPositive()
  sessaoId: number;
}
