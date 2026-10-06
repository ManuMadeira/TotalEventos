import { Injectable } from '@nestjs/common';
import { CheckinResponseDto } from '../modules/checkin/dto/checkin-response.dto';

@Injectable()
export class CheckinRepository {
  private checkins: CheckinResponseDto[] = [];
  private proximoId = 1;

  async criar(dados: Omit<CheckinResponseDto, 'id'>): Promise<CheckinResponseDto> {
    const checkin = { id: this.proximoId++, ...dados };
    this.checkins.push(checkin);
    return checkin;
  }

  async existePorReserva(reservaId: number): Promise<boolean> {
    return this.checkins.some((c) => c.reservaId === reservaId);
  }
}
