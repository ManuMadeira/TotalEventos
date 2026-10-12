import { Inject, Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { SQLITE } from '../database/database.module';
import { StatusReserva } from '../enum/status-reserva.enum';
import { ReservaResponseDto } from '../modules/reserva/dto/reserva-response.dto';

@Injectable()
export class ReservaRepository {
  constructor(@Inject(SQLITE) private readonly db: Database.Database) {}

  async criar(dados: Omit<ReservaResponseDto, 'id'>): Promise<ReservaResponseDto> {
    return this.db.transaction(() => {
      const sessao = this.db.prepare('SELECT capacidade FROM sessoes WHERE id=?').get(dados.sessaoId) as { capacidade: number } | undefined;
      if (!sessao) throw new Error('SESSAO_NAO_ENCONTRADA');
      const ativas = this.db.prepare("SELECT COUNT(*) n FROM reservas WHERE sessao_id=? AND status='ATIVA'").get(dados.sessaoId) as { n: number };
      if (ativas.n >= sessao.capacidade) throw new Error('SESSAO_ESGOTADA');
      const result = this.db.prepare('INSERT INTO reservas(sessao_id,participante_id,status,criada_em) VALUES(?,?,?,?)').run(dados.sessaoId, dados.participanteId, dados.status, dados.criadaEm.toISOString());
      return { ...dados, id: Number(result.lastInsertRowid) };
    })();
  }

  async buscarPorId(id: number): Promise<ReservaResponseDto | null> {
    const r = this.db.prepare('SELECT id,sessao_id sessaoId,participante_id participanteId,status,criada_em criadaEm FROM reservas WHERE id=?').get(id) as any;
    return r ? { ...r, criadaEm: new Date(r.criadaEm) } : null;
  }
  async contarAtivasPorSessao(sessaoId: number): Promise<number> {
    return (this.db.prepare("SELECT COUNT(*) n FROM reservas WHERE sessao_id=? AND status='ATIVA'").get(sessaoId) as { n: number }).n;
  }
  async existePorParticipanteESessao(participanteId: string, sessaoId: number): Promise<boolean> {
    return !!this.db.prepare("SELECT 1 FROM reservas WHERE participante_id=? AND sessao_id=? AND status='ATIVA'").get(participanteId, sessaoId);
  }
  async concluirCheckin(reservaId: number, sessaoId: number, realizadoEm: Date) {
    return this.db.transaction(() => {
      const reserva = this.db.prepare("SELECT r.participante_id participanteId FROM reservas r WHERE r.id=? AND r.sessao_id=? AND r.status='ATIVA'").get(reservaId, sessaoId) as { participanteId: string } | undefined;
      if (!reserva) throw new Error('RESERVA_INVALIDA');
      const sessao = this.db.prepare('SELECT capacidade FROM sessoes WHERE id=?').get(sessaoId) as { capacidade: number };
      const presentes = this.db.prepare('SELECT COUNT(*) n FROM checkins WHERE sessao_id=?').get(sessaoId) as { n: number };
      if (presentes.n >= sessao.capacidade) throw new Error('SESSAO_ESGOTADA');
      const result = this.db.prepare('INSERT INTO checkins(reserva_id,sessao_id,realizado_em) VALUES(?,?,?)').run(reservaId, sessaoId, realizadoEm.toISOString());
      this.db.prepare("UPDATE reservas SET status='CONSUMIDA' WHERE id=?").run(reservaId);
      const checkin = { id: Number(result.lastInsertRowid), reservaId, sessaoId, realizadoEm };
      return { checkin, participanteId: reserva.participanteId };
    })();
  }
}
