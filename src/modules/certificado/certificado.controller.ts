import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { CertificadoService } from './certificado.service';
import { CertificadoResponseDto } from './dto/certificado-response.dto';

@Controller('participantes/:participanteId/certificado')
export class CertificadoController {
  constructor(private readonly certificadoService: CertificadoService) {}

  @Get()
  emitirCertificado(
    @Param('participanteId') participanteId: string,
  ): CertificadoResponseDto {
    const certificado =
      this.certificadoService.emitirCertificado(participanteId);
    if (!certificado) {
      throw new BadRequestException('Não foi possível emitir o certificado.');
    }
    return certificado;
  }
}
