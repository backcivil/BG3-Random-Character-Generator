// src/lib/types.ts
export const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type Abil = typeof ABILS[number];
