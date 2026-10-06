import { Module } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { CheckinRepository } from '../../repositories/checkin.repository';
import { ReservaRepository } from '../../repositories/reserva.repository';

@Module({
  controllers: [CheckinController],
  providers: [CheckinService, CheckinRepository, ReservaRepository],
})
export class CheckinModule {}
