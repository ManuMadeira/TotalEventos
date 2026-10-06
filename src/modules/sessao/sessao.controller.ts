import { Controller, Get, Query } from '@nestjs/common';
import { SessaoService } from './sessao.service';
import { ListarGradeQueryDto } from './dto/listar-grade-query.dto';

@Controller('sessoes')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) {}

  @Get()
  consultarGrade(@Query() query: ListarGradeQueryDto) {
    return this.sessaoService.consultarGrade(query);
  }
}
