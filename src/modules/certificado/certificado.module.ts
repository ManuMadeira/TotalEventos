import { Module } from '@nestjs/common';
import { CertificadoController } from './certificado.controller';
import { CertificadoService } from './certificado.service';
import { ParticipanteRepository } from '../../repositories/participante.repository';

@Module({
  controllers: [CertificadoController],
  providers: [CertificadoService, ParticipanteRepository],
})
export class CertificadoModule {}
