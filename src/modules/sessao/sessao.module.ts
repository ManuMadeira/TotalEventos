import { Module } from '@nestjs/common';
import { SessaoController } from './sessao.controller';
import { SessaoService } from './sessao.service';
import { SessaoRepository } from '../../repositories/sessao.repository';

@Module({
  controllers: [SessaoController],
  providers: [SessaoService, SessaoRepository],
  exports: [SessaoRepository],
})
export class SessaoModule {}
