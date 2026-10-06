import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CriarReservaDto } from './dto/criar-reserva.dto';
import { ReservaRepository } from '../../repositories/reserva.repository';
import { SessaoRepository } from '../../repositories/sessao.repository';
import { StatusReserva } from '../../enum/status-reserva.enum';

@Injectable()
export class ReservaService {
  constructor(
    private readonly reservaRepo: ReservaRepository,
    private readonly sessaoRepo: SessaoRepository,
  ) {}

  async reservarVaga(dto: CriarReservaDto) {
    const sessao = await this.sessaoRepo.buscarPorId(dto.sessaoId);
    if (!sessao) throw new BadRequestException('Sessão não encontrada.');

    const reservasAtivas =
      await this.reservaRepo.contarAtivasPorSessao(dto.sessaoId);
    if (reservasAtivas >= sessao.capacidade) {
      throw new ConflictException('Sessão esgotada (lotação máxima atingida).');
    }

    const jaReservou =
      await this.reservaRepo.existePorParticipanteESessao(
        dto.participanteId,
        dto.sessaoId,
      );
    if (jaReservou) {
      throw new ConflictException('Participante já possui reserva nesta sessão.');
    }

    return this.reservaRepo.criar({
      sessaoId: dto.sessaoId,
      participanteId: dto.participanteId,
      status: StatusReserva.ATIVA,
      criadaEm: new Date(),
    });
  }
}
