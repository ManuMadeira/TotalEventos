import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CriarReservaDto } from './dto/criar-reserva.dto';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  reservarVaga(@Body() dto: CriarReservaDto) {
    return this.reservaService.reservarVaga(dto);
  }
}
