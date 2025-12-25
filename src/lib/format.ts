// Utility functions for formatting values

/**
 * Format a probability (0-1) as Brazilian Real currency
 * e.g., 0.42 -> "R$ 0,42"
 */
export function formatProbabilityAsBrl(probability: string | number): string {
  const value = typeof probability === 'string' ? parseFloat(probability) : probability;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format a probability as percentage
 * e.g., 0.42 -> "42%"
 */
export function formatProbabilityAsPercent(probability: string | number): string {
  const value = typeof probability === 'string' ? parseFloat(probability) : probability;
  return `${Math.round(value * 100)}%`;
}

/**
 * Format BRL amount
 * e.g., "1250.50" -> "R$ 1.250,50"
 */
export function formatBrl(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Format volume with abbreviation
 * e.g., 2450000 -> "R$ 2,45M"
 */
export function formatVolume(amount: string | number): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(2).replace('.', ',')}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return formatBrl(value);
}

/**
 * Format a decimal string as number for display
 */
export function formatDecimal(value: string, decimals = 2): string {
  const num = parseFloat(value);
  return num.toFixed(decimals);
}

/**
 * Format relative date
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Encerrado';
  }
  if (diffDays === 0) {
    return 'Hoje';
  }
  if (diffDays === 1) {
    return 'Amanhã';
  }
  if (diffDays <= 7) {
    return `Em ${diffDays} dias`;
  }
  if (diffDays <= 30) {
    const weeks = Math.ceil(diffDays / 7);
    return `Em ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  if (diffDays <= 365) {
    const months = Math.ceil(diffDays / 30);
    return `Em ${months} ${months > 1 ? 'meses' : 'mês'}`;
  }
  const years = Math.ceil(diffDays / 365);
  return `Em ${years} ano${years > 1 ? 's' : ''}`;
}

/**
 * Format date/time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
