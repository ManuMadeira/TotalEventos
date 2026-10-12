# Total Eventos

API NestJS para consulta de sessões, reserva de vagas, check-in e emissão de certificados.

## Executar

Requisitos: Node.js 20+ e npm. Instale as dependências com `npm install` e inicie em desenvolvimento com `npm run start:dev`. A API escuta na porta `3000` por padrão; configure `PORT` para alterá-la.

O SQLite é criado em `data/total-eventos.sqlite`. Para escolher outro local, defina `DATABASE_PATH`. A chave HMAC usada para assinar os QR Codes deve ser configurada em `QR_CODE_SECRET` em produção.

## Endpoints

- `GET /sessoes?data=AAAA-MM-DD&trilha=...` — consulta a grade.
- `POST /reservas` — recebe `{ "sessaoId": 1, "participanteId": "p001" }`; retorna reserva e `codigoIngresso` assinado.
- `POST /checkins` — recebe `{ "codigoIngresso": "...", "sessaoId": 1 }`.
- `GET /participantes/:participanteId/certificado` — emite certificado conforme frequência registrada.

## Verificação E2E

Execute `npm run test:e2e`. Os testes usam um SQLite temporário e cobrem os endpoints, duplicidade, lotação, assinatura/uso único do QR e rollback transacional.
