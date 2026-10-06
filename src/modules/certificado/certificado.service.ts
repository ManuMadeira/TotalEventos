import { Injectable, BadRequestException } from '@nestjs/common';
import { CertificadoResponseDto } from './dto/certificado-response.dto';
import { ParticipanteRepository } from '../../repositories/participante.repository';

@Injectable()
export class CertificadoService {
  constructor(private readonly participanteRepo: ParticipanteRepository) {}

  emitirCertificado(participanteId: string): CertificadoResponseDto {
    const participante =
      this.participanteRepo.buscarComFrequencia(participanteId);

    if (!participante) {
      throw new BadRequestException('Participante não encontrado.');
    }

    if (participante.frequencia < 0.75) {
      throw new BadRequestException(
        'Frequência insuficiente para emissão do certificado (mín. 75%).',
      );
    }

    return {
      participanteId: participante.id,
      nome: participante.nome,
      evento: participante.evento,
      cargaHoraria: participante.cargaHoraria,
      codigoVerificacao: this.gerarCodigoVerificacao(participante.id),
    };
  }

  private gerarCodigoVerificacao(participanteId: string): string {
    return Buffer.from(participanteId + '-' + Date.now())
      .toString('base64url')
      .slice(0, 12)
      .toUpperCase();
  }
}
