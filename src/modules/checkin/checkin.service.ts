import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { RealizarCheckinDto } from './dto/realizar-checkin.dto';
import { ReservaRepository } from '../../repositories/reserva.repository';
import { CheckinRepository } from '../../repositories/checkin.repository';
import { StatusReserva } from '../../enum/status-reserva.enum';

@Injectable()
export class CheckinService {
  constructor(
    private readonly reservaRepo: ReservaRepository,
    private readonly checkinRepo: CheckinRepository,
  ) {}

  async realizarCheckin(dto: RealizarCheckinDto) {
    const payload = this.validarQrCode(dto.codigoIngresso);
    const reserva = await this.reservaRepo.buscarPorId(payload.reservaId);

    if (!reserva || reserva.status !== StatusReserva.ATIVA) {
      throw new UnauthorizedException('Ingresso inválido ou reserva não ativa.');
    }

    const jaFeito = await this.checkinRepo.existePorReserva(reserva.id);
    if (jaFeito) {
      throw new ConflictException('Check-in já realizado para este ingresso.');
    }

    const checkin = await this.checkinRepo.criar({
      reservaId: reserva.id,
      sessaoId: dto.sessaoId,
      realizadoEm: new Date(),
    });

    await this.computarFrequencia(reserva.participanteId);

    return checkin;
  }

  private validarQrCode(codigo: string): { reservaId: number } {
    try {
      return JSON.parse(Buffer.from(codigo, 'base64url').toString('utf-8'));
    } catch {
      throw new UnauthorizedException('QR Code corrompido ou inválido.');
    }
  }

  private async computarFrequencia(participanteId: string): Promise<void> {
    void participanteId;
  }
}
