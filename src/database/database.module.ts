import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import { resolve } from 'node:path';

export const SQLITE = Symbol('SQLITE');

class SqliteCloser implements OnModuleDestroy {
  constructor(private readonly db: Database.Database) {}
  onModuleDestroy() { this.db.close(); }
}

@Global()
@Module({
  providers: [{
    provide: SQLITE,
    useFactory: () => {
      const filename = resolve(process.env.DATABASE_PATH ?? 'data/total-eventos.sqlite');
      const { mkdirSync } = require('node:fs');
      mkdirSync(resolve(filename, '..'), { recursive: true });
      const db = new Database(filename);
      db.pragma('foreign_keys = ON');
      db.pragma('journal_mode = WAL');
      db.exec(`
        CREATE TABLE IF NOT EXISTS sessoes (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, data TEXT NOT NULL, hora_inicio TEXT NOT NULL, local TEXT NOT NULL, capacidade INTEGER NOT NULL CHECK(capacidade > 0));
        CREATE TABLE IF NOT EXISTS participantes (id TEXT PRIMARY KEY, nome TEXT NOT NULL, evento TEXT NOT NULL, carga_horaria REAL NOT NULL, frequencia REAL NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS reservas (id INTEGER PRIMARY KEY AUTOINCREMENT, sessao_id INTEGER NOT NULL REFERENCES sessoes(id), participante_id TEXT NOT NULL REFERENCES participantes(id), status TEXT NOT NULL, criada_em TEXT NOT NULL, UNIQUE(participante_id, sessao_id));
        CREATE TABLE IF NOT EXISTS checkins (id INTEGER PRIMARY KEY AUTOINCREMENT, reserva_id INTEGER NOT NULL UNIQUE REFERENCES reservas(id), sessao_id INTEGER NOT NULL REFERENCES sessoes(id), realizado_em TEXT NOT NULL);
      `);
      const count = (db.prepare('SELECT COUNT(*) n FROM sessoes').get() as { n: number }).n;
      if (!count) db.exec(`INSERT INTO sessoes VALUES (1,'Abertura','2026-10-10','09:00','Auditório A',100),(2,'Workshop NestJS','2026-10-10','14:00','Lab 3',40)`);
      const people = (db.prepare('SELECT COUNT(*) n FROM participantes').get() as { n: number }).n;
      if (!people) db.exec(`INSERT INTO participantes VALUES ('p001','João Silva','TotalEventos 2026',20,0.9),('p002','Maria Souza','TotalEventos 2026',20,0.5)`);
      return db;
    },
  }, { provide: SqliteCloser, inject: [SQLITE], useFactory: (db: Database.Database) => new SqliteCloser(db) }],
  exports: [SQLITE],
})
export class DatabaseModule {}
