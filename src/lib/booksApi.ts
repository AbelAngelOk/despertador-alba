const API_BASE_URL = 'https://links-referidos-api.fly.dev';
const APP_NAME = 'despertador-app';
const REQUEST_TIMEOUT_MS = 15_000;

export interface BookSlot {
  dominio: string;
  status: 'active' | 'broken';
  ctaUrl: string;
}

export interface RecommendedBook {
  id: string;
  titulo: string;
  descripcion: string;
  imagenUrl: string;
  slots: BookSlot[];
}

/**
 * - config:  la app se compiló sin la API key (falta EXPO_PUBLIC_LINKS_API_KEY).
 * - auth:    la API rechazó la key (revocada o inválida).
 * - network: no hubo respuesta (sin conexión, timeout).
 * - server:  la API respondió con un error inesperado.
 */
export type BooksApiErrorKind = 'config' | 'auth' | 'network' | 'server';

export class BooksApiError extends Error {
  constructor(
    readonly kind: BooksApiErrorKind,
    message: string
  ) {
    super(message);
    this.name = 'BooksApiError';
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Trae el primer producto (libro) configurado para esta app en el dashboard
 * de links referidos. Los endpoints /v1/* de esa API se autentican con una
 * "read API key" (no expira sola, solo lectura, revocable desde el dashboard)
 * y no con el token de login, que es solo para /admin/*.
 */
export async function fetchRecommendedBook(): Promise<RecommendedBook | null> {
  // process.env.EXPO_PUBLIC_* se reemplaza en el bundle solo con acceso directo.
  const apiKey = process.env.EXPO_PUBLIC_LINKS_API_KEY;
  if (!apiKey) {
    throw new BooksApiError('config', 'Falta EXPO_PUBLIC_LINKS_API_KEY en el build de la app');
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${API_BASE_URL}/v1/products?app=${encodeURIComponent(APP_NAME)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
  } catch {
    throw new BooksApiError('network', 'No hubo respuesta de la API de libros');
  }

  if (response.status === 401 || response.status === 403) {
    throw new BooksApiError('auth', `La API rechazó la key (${response.status})`);
  }
  if (!response.ok) {
    throw new BooksApiError('server', `La API respondió ${response.status}`);
  }

  const products = (await response.json()) as {
    id: string;
    titulo: string;
    descripcion_corta: string;
    imagen_url: string;
    slots?: { dominio: string; status: 'active' | 'broken'; cta_url: string }[];
  }[];

  const book = products[0];
  if (!book) return null;

  return {
    id: book.id,
    titulo: book.titulo,
    descripcion: book.descripcion_corta,
    imagenUrl: book.imagen_url,
    slots: (book.slots ?? [])
      .filter((slot) => slot.status === 'active')
      .map((slot) => ({ dominio: slot.dominio, status: slot.status, ctaUrl: slot.cta_url })),
  };
}

/** El cta_url que devuelve la API es relativo (/r/{id}/{dominio}); hay que resolverlo contra el host de la API. */
export function resolveStoreUrl(ctaUrl: string): string {
  return `${API_BASE_URL}${ctaUrl}`;
}
