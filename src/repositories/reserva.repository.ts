import { Injectable } from '@nestjs/common';
import { StatusReserva } from '../enum/status-reserva.enum';
import { ReservaResponseDto } from '../modules/reserva/dto/reserva-response.dto';

@Injectable()
export class ReservaRepository {
  private reservas: ReservaResponseDto[] = [];
  private proximoId = 1;

  async criar(dados: Omit<ReservaResponseDto, 'id'>): Promise<ReservaResponseDto> {
    const reserva = { id: this.proximoId++, ...dados };
    this.reservas.push(reserva);
    return reserva;
  }

  async buscarPorId(id: number): Promise<ReservaResponseDto | null> {
    return this.reservas.find((r) => r.id === id) ?? null;
  }

  async contarAtivasPorSessao(sessaoId: number): Promise<number> {
    return this.reservas.filter(
      (r) => r.sessaoId === sessaoId && r.status === StatusReserva.ATIVA,
    ).length;
  }

  async existePorParticipanteESessao(
    participanteId: string,
    sessaoId: number,
  ): Promise<boolean> {
    return this.reservas.some(
      (r) =>
        r.participanteId === participanteId &&
        r.sessaoId === sessaoId &&
        r.status === StatusReserva.ATIVA,
    );
  }
}
