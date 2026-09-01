export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function formatCountdown(target: Date, from: Date = new Date()): string {
  const diffMs = target.getTime() - from.getTime();
  if (diffMs <= 0) return 'ahora';

  const totalMinutes = Math.round(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `en ${minutes}min`;
  return `en ${hours}h ${minutes}min`;
}

export function formatOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return 'en el momento exacto';
  const abs = Math.abs(offsetMinutes);
  return offsetMinutes < 0 ? `${abs} min antes` : `${abs} min después`;
}
