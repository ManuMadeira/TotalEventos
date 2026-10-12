import { Inject, Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { SQLITE } from '../database/database.module';
import { CheckinResponseDto } from '../modules/checkin/dto/checkin-response.dto';

@Injectable()
export class CheckinRepository {
  constructor(@Inject(SQLITE) private readonly db: Database.Database) {}
  async criar(dados: Omit<CheckinResponseDto, 'id'>): Promise<CheckinResponseDto> {
    const result = this.db.prepare('INSERT INTO checkins(reserva_id,sessao_id,realizado_em) VALUES(?,?,?)').run(dados.reservaId, dados.sessaoId, dados.realizadoEm.toISOString());
    return { ...dados, id: Number(result.lastInsertRowid) };
  }
  async existePorReserva(reservaId: number): Promise<boolean> {
    return !!this.db.prepare('SELECT 1 FROM checkins WHERE reserva_id=?').get(reservaId);
  }
}
