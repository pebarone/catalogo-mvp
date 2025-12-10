/**
 * Utilitários de sanitização e validação de inputs
 * Para prevenção básica de XSS no frontend
 * NOTA: O backend DEVE sempre fazer sua própria validação/sanitização
 */

/**
 * Remove tags HTML potencialmente perigosas de uma string
 * Mantém apenas texto puro
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove tags HTML
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }
  
  // Remove espaços e converte para lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Regex básico para email
  const emailRegex = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Sanitiza string para uso em URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  try {
    const parsed = new URL(url);
    
    // Apenas permite protocolos seguros
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Limita tamanho de string para prevenir abuse
 */
export function truncateString(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  if (input.length <= maxLength) {
    return input;
  }
  
  return input.slice(0, maxLength);
}

/**
 * Sanitiza número para prevenir NaN/Infinity
 */
export function sanitizeNumber(input: unknown, fallback = 0): number {
  if (typeof input === 'number' && isFinite(input)) {
    return input;
  }
  
  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (isFinite(parsed)) {
      return parsed;
    }
  }
  
  return fallback;
}

/**
 * Valida se uma string contém apenas caracteres alfanuméricos
 */
export function isAlphanumeric(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z0-9]+$/.test(input);
}

/**
 * Sanitiza objeto removendo campos undefined/null e limitando profundidade
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxDepth = 3,
  currentDepth = 0
): Partial<T> {
  if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') {
    return {};
  }
  
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }
    
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (typeof value === 'number') {
      result[key] = sanitizeNumber(value);
    } else if (typeof value === 'boolean') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.slice(0, 100); // Limita arrays
    } else if (typeof value === 'object') {
      result[key] = sanitizeObject(value as Record<string, unknown>, maxDepth, currentDepth + 1);
    }
  }
  
  return result as Partial<T>;
}

export default {
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  truncateString,
  sanitizeNumber,
  isAlphanumeric,
  sanitizeObject,
};
