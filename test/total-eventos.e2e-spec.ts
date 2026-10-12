import 'reflect-metadata';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { rmSync } from 'node:fs';
import request from 'supertest';
import Database from 'better-sqlite3';
import { AppModule } from '../src/app.module';
import { SQLITE } from '../src/database/database.module';

describe('Total Eventos HTTP (E2E)', () => {
  let app: INestApplication;
  let db: Database.Database;
  const path = join(tmpdir(), `total-eventos-${process.pid}.sqlite`);

  beforeAll(async () => {
    process.env.DATABASE_PATH = path;
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    db = module.get(SQLITE);
    await app.init();
  });
  afterAll(async () => {
    await app.close();
    delete process.env.DATABASE_PATH;
    rmSync(path, { force: true });
    rmSync(`${path}-wal`, { force: true });
    rmSync(`${path}-shm`, { force: true });
  });

  it('consulta grade, reserva vaga e consome o ingresso com check-in uma única vez', async () => {
    await request(app.getHttpServer()).get('/sessoes').expect(200).expect(({ body }) => expect(body).toHaveLength(2));
    const reserva = await request(app.getHttpServer()).post('/reservas').send({ sessaoId: 1, participanteId: 'p001' }).expect(201);
    expect(reserva.body.codigoIngresso).toBeTruthy();
    expect((await request(app.getHttpServer()).get('/sessoes').expect(200)).body[0].vagasDisponiveis).toBe(99);

    await request(app.getHttpServer()).post('/reservas').send({ sessaoId: 1, participanteId: 'p001' }).expect(409);
    await request(app.getHttpServer()).post('/checkins').send({ codigoIngresso: reserva.body.codigoIngresso, sessaoId: 1 }).expect(200);
    await request(app.getHttpServer()).post('/checkins').send({ codigoIngresso: reserva.body.codigoIngresso, sessaoId: 1 }).expect(401);
    expect((db.prepare('SELECT status FROM reservas WHERE id=?').get(reserva.body.id) as { status: string }).status).toBe('CONSUMIDA');
    expect((db.prepare('SELECT COUNT(*) n FROM checkins WHERE reserva_id=?').get(reserva.body.id) as { n: number }).n).toBe(1);
    await request(app.getHttpServer()).get('/participantes/p001/certificado').expect(200);
    await request(app.getHttpServer()).get('/participantes/p002/certificado').expect(400);
  });

  it('faz rollback do check-in se uma gravação dentro da transação falhar', async () => {
    const reserva = await request(app.getHttpServer()).post('/reservas').send({ sessaoId: 2, participanteId: 'p002' }).expect(201);
    db.exec("CREATE TRIGGER falhar_checkin BEFORE INSERT ON checkins WHEN NEW.reserva_id=" + Number(reserva.body.id) + " BEGIN SELECT RAISE(ABORT, 'falha de teste'); END");
    await request(app.getHttpServer()).post('/checkins').send({ codigoIngresso: reserva.body.codigoIngresso, sessaoId: 2 }).expect(409);
    expect((db.prepare('SELECT status FROM reservas WHERE id=?').get(reserva.body.id) as { status: string }).status).toBe('ATIVA');
    expect((db.prepare('SELECT COUNT(*) n FROM checkins WHERE reserva_id=?').get(reserva.body.id) as { n: number }).n).toBe(0);
  });

  it('bloqueia nova reserva ao atingir a capacidade persistida', async () => {
    db.prepare('UPDATE sessoes SET capacidade=1 WHERE id=2').run();
    await request(app.getHttpServer()).post('/reservas').send({ sessaoId: 2, participanteId: 'p001' }).expect(201);
    await request(app.getHttpServer()).post('/reservas').send({ sessaoId: 2, participanteId: 'p002' }).expect(409);
    expect((db.prepare("SELECT COUNT(*) n FROM reservas WHERE sessao_id=2 AND status='ATIVA'").get() as { n: number }).n).toBe(1);
  });
});
