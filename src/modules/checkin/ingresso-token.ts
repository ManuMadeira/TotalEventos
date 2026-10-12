import { createHmac, timingSafeEqual } from 'node:crypto';

const secret = () => process.env.QR_CODE_SECRET ?? 'total-eventos-local-development-secret';
export function emitirCodigoIngresso(reservaId: number): string {
  const payload = Buffer.from(JSON.stringify({ reservaId })).toString('base64url');
  const assinatura = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${assinatura}`;
}
export function validarCodigoIngresso(codigo: string): { reservaId: number } | null {
  const [payload, assinatura, extra] = codigo.split('.');
  if (!payload || !assinatura || extra) return null;
  const esperada = createHmac('sha256', secret()).update(payload).digest();
  let recebida: Buffer;
  try { recebida = Buffer.from(assinatura, 'base64url'); } catch { return null; }
  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return Number.isInteger(value?.reservaId) && value.reservaId > 0 ? value : null;
  } catch { return null; }
}
