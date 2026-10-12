import { Module } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { ReservaRepository } from '../../repositories/reserva.repository';

@Module({
  controllers: [CheckinController],
  providers: [CheckinService, ReservaRepository],
})
export class CheckinModule {}
