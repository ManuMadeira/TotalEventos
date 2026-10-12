import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { RealizarCheckinDto } from './dto/realizar-checkin.dto';
import { ReservaRepository } from '../../repositories/reserva.repository';
import { StatusReserva } from '../../enum/status-reserva.enum';
import { validarCodigoIngresso } from './ingresso-token';

@Injectable()
export class CheckinService {
  constructor(private readonly reservaRepo: ReservaRepository) {}

  async realizarCheckin(dto: RealizarCheckinDto) {
    const payload = this.validarQrCode(dto.codigoIngresso);
    const reserva = await this.reservaRepo.buscarPorId(payload.reservaId);
    if (!reserva || reserva.status !== StatusReserva.ATIVA || reserva.sessaoId !== dto.sessaoId) {
      throw new UnauthorizedException('Ingresso inválido ou reserva não ativa para esta sessão.');
    }
    try {
      const { checkin } = await this.reservaRepo.concluirCheckin(reserva.id, dto.sessaoId, new Date());
      return checkin;
    } catch (error) {
      if (error instanceof Error && error.message === 'SESSAO_ESGOTADA') throw new ConflictException('Lotação máxima da sessão atingida.');
      throw new ConflictException('Check-in já realizado ou ingresso inválido.');
    }
  }

  private validarQrCode(codigo: string): { reservaId: number } {
    const payload = validarCodigoIngresso(codigo);
    if (!payload) throw new UnauthorizedException('QR Code corrompido ou inválido.');
    return payload;
  }
}
