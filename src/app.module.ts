import { Module } from '@nestjs/common';
import { SessaoModule } from './modules/sessao/sessao.module';
import { ReservaModule } from './modules/reserva/reserva.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { CertificadoModule } from './modules/certificado/certificado.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, SessaoModule, ReservaModule, CheckinModule, CertificadoModule],
})
export class AppModule {}
