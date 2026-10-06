import { Module } from '@nestjs/common';
import { ReservaController } from './reserva.controller';
import { ReservaService } from './reserva.service';
import { ReservaRepository } from '../../repositories/reserva.repository';
import { SessaoRepository } from '../../repositories/sessao.repository';

@Module({
  controllers: [ReservaController],
  providers: [ReservaService, ReservaRepository, SessaoRepository],
  exports: [ReservaRepository],
})
export class ReservaModule {}
