import { Injectable } from '@nestjs/common';

export interface ParticipanteComFrequencia {
  id: string;
  nome: string;
  evento: string;
  cargaHoraria: number;
  frequencia: number;
}

@Injectable()
export class ParticipanteRepository {
  private participantes: ParticipanteComFrequencia[] = [
    {
      id: 'p001',
      nome: 'João Silva',
      evento: 'TotalEventos 2026',
      cargaHoraria: 20,
      frequencia: 0.9,
    },
    {
      id: 'p002',
      nome: 'Maria Souza',
      evento: 'TotalEventos 2026',
      cargaHoraria: 20,
      frequencia: 0.5,
    },
  ];

  buscarComFrequencia(id: string): ParticipanteComFrequencia | null {
    return this.participantes.find((p) => p.id === id) ?? null;
  }
}
