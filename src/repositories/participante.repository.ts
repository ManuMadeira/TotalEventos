import { Inject, Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { SQLITE } from '../database/database.module';
export interface ParticipanteComFrequencia { id: string; nome: string; evento: string; cargaHoraria: number; frequencia: number }
@Injectable()
export class ParticipanteRepository {
  constructor(@Inject(SQLITE) private readonly db: Database.Database) {}
  buscarComFrequencia(id: string): ParticipanteComFrequencia | null {
    return (this.db.prepare('SELECT id,nome,evento,carga_horaria cargaHoraria,frequencia FROM participantes WHERE id=?').get(id) as ParticipanteComFrequencia | undefined) ?? null;
  }
}
