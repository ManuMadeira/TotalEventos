import { Inject, Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { SQLITE } from '../database/database.module';
import { GradeSessaoResponseDto } from '../modules/sessao/dto/grade-sessao-response.dto';

@Injectable()
export class SessaoRepository {
  constructor(@Inject(SQLITE) private readonly db: Database.Database) {}
  async buscarGrade(data?: string, trilha?: string): Promise<GradeSessaoResponseDto[]> {
    void trilha;
    const rows = this.db.prepare(`SELECT s.id,s.titulo,s.data,s.hora_inicio horaInicio,s.local,s.capacidade,
      s.capacidade-(SELECT COUNT(*) FROM reservas r WHERE r.sessao_id=s.id AND r.status='ATIVA') vagasDisponiveis
      FROM sessoes s WHERE (? IS NULL OR s.data=?) ORDER BY s.data,s.hora_inicio`).all(data ?? null, data ?? null) as GradeSessaoResponseDto[];
    return rows;
  }
  async buscarPorId(id: number) {
    return this.db.prepare('SELECT id,titulo,data,hora_inicio horaInicio,local,capacidade FROM sessoes WHERE id=?').get(id) ?? null;
  }
}
