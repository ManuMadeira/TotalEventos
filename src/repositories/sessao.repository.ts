import { Injectable } from '@nestjs/common';
import { GradeSessaoResponseDto } from '../modules/sessao/dto/grade-sessao-response.dto';

@Injectable()
export class SessaoRepository {
  private sessoes = [
    { id: 1, titulo: 'Abertura', data: '2026-10-10', horaInicio: '09:00', local: 'Auditório A', capacidade: 100, reservasAtivas: 30 },
    { id: 2, titulo: 'Workshop NestJS', data: '2026-10-10', horaInicio: '14:00', local: 'Lab 3', capacidade: 40, reservasAtivas: 40 },
  ];

  async buscarGrade(data?: string, trilha?: string): Promise<GradeSessaoResponseDto[]> {
    void trilha;
    return this.sessoes
      .filter((s) => !data || s.data === data)
      .map((s) => ({
        id: s.id,
        titulo: s.titulo,
        data: s.data,
        horaInicio: s.horaInicio,
        local: s.local,
        capacidade: s.capacidade,
        vagasDisponiveis: s.capacidade - s.reservasAtivas,
      }));
  }

  async buscarPorId(id: number) {
    return this.sessoes.find((s) => s.id === id) ?? null;
  }
}
