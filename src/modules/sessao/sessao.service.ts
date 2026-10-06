import { Injectable } from '@nestjs/common';
import { ListarGradeQueryDto } from './dto/listar-grade-query.dto';
import { SessaoRepository } from '../../repositories/sessao.repository';

@Injectable()
export class SessaoService {
  constructor(private readonly sessaoRepo: SessaoRepository) {}

  async consultarGrade(query: ListarGradeQueryDto) {
    return this.sessaoRepo.buscarGrade(query.data, query.trilha);
  }
}
