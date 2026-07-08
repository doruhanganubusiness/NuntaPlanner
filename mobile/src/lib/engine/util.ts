/** Utilitare numerice pure pentru motorul de calcul. */

/**
 * Rotunjire în sus la întreg (pentru unități discrete: sticle, pahare, mese).
 * Aplică o rotunjire la 9 zecimale înainte de `ceil` ca să elimine zgomotul de
 * virgulă mobilă (ex. 49.5/0.75 = 66.0000000001 → 66, nu 67).
 */
export const ceil = (x: number): number => Math.ceil(Math.round(x * 1e9) / 1e9);

/** Rotunjire la `d` zecimale (pentru litri, mp, sume). */
export function round(x: number, d = 2): number {
  const f = 10 ** d;
  return Math.round(x * f) / f;
}

/** Tratează null/undefined/NaN ca 0 și taie negativele. */
export function num(x: number | null | undefined): number {
  if (x == null || Number.isNaN(x)) return 0;
  return x < 0 ? 0 : x;
}
