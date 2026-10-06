/**
 * Texto fijo en la app (no viene de la API): la API de links referidos solo
 * expone título, descripción corta e imagen a las apps, no un campo de
 * "motivo de recomendación".
 */
export const RECOMENDACION_MOTIVO =
  'Alba te despierta con la luz del amanecer para que arranques el día con calma, ' +
  'no con un sobresalto. Este libro propone la misma idea llevada a hábito: usar la ' +
  'primera hora del día, antes de que el mundo se acelere, para vos. Si ya estás ' +
  'madrugando con Alba, te da un método para aprovechar mejor ese rato ganado.';

export function getStoreLabel(dominio: string): string {
  if (dominio.includes('amazon')) return 'Comprar en Amazon';
  if (dominio.includes('mercadolibre') || dominio.includes('mercadolivre')) {
    return 'Comprar en Mercado Libre';
  }
  return `Comprar en ${dominio}`;
}
