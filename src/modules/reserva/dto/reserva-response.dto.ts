import { StatusReserva } from '../../../enum/status-reserva.enum';

export class ReservaResponseDto {
  id: number;
  sessaoId: number;
  participanteId: string;
  status: StatusReserva;
  criadaEm: Date;
}
