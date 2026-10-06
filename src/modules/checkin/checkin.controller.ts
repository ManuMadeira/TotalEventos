import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { RealizarCheckinDto } from './dto/realizar-checkin.dto';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  realizarCheckin(@Body() dto: RealizarCheckinDto) {
    return this.checkinService.realizarCheckin(dto);
  }
}
