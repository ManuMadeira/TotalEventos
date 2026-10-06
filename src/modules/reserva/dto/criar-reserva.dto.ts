import { IsInt, IsPositive, IsString, IsNotEmpty } from 'class-validator';

export class CriarReservaDto {
  @IsInt()
  @IsPositive()
  sessaoId: number;

  @IsString()
  @IsNotEmpty()
  participanteId: string;
}
