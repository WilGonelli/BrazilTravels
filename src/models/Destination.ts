/**
 * Official geographic regions of Brazil.
 */
export type BrazilianRegion =
  | 'Norte'
  | 'Nordeste'
  | 'Centro-Oeste'
  | 'Sudeste'
  | 'Sul';

/**
 * Two-letter Federative Unit codes (26 states + Federal District).
 */
export type BrazilStateCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

/**
 * Categories of destinations shown on the map poster.
 */
export type DestinationCategory =
  | 'State'
  | 'Beach'
  | 'FamousCity'
  | 'TouristSpot'
  | 'Waterfall'
  | 'Island';

/**
 * Core destination domain model.
 */
export interface Destination {
  readonly id: string;
  readonly name: string;
  readonly category: DestinationCategory;
  readonly region: BrazilianRegion;
  readonly stateCode: BrazilStateCode;
  readonly isUnlocked: boolean;
  readonly unlockedAt?: string;
  readonly unlockedColor: string;
  readonly photoUrls: readonly string[];
  readonly mapsUrl?: string;
}

/**
 * Raw destination input before runtime unlock initialization.
 */
export interface RawDestinationSeed {
  readonly id: string;
  readonly name: string;
  readonly category: DestinationCategory;
  readonly region: BrazilianRegion;
  readonly stateCode: BrazilStateCode;
  readonly mapsUrl?: string;
}

/**
 * Regional base color palette.
 */
export const REGION_COLORS: Record<BrazilianRegion, string> = {
  Norte: '#10b981',        // Emerald Green
  Nordeste: '#ef4444',     // Coral Red
  'Centro-Oeste': '#8b5cf6', // Purple/Violet
  Sudeste: '#f97316',      // Warm Orange
  Sul: '#0284c7',          // Ocean Blue
};

/**
 * Distinct vibrant color shades for individual states to provide rich gradients across regions.
 */
export const STATE_COLORS: Partial<Record<BrazilStateCode, string>> = {
  AM: '#059669',
  PA: '#10b981',
  RR: '#34d399',
  AP: '#047857',
  AC: '#065f46',
  RO: '#059669',
  TO: '#10b981',
  MA: '#dc2626',
  PI: '#f87171',
  CE: '#ef4444',
  RN: '#b91c1c',
  PB: '#f87171',
  PE: '#ef4444',
  AL: '#dc2626',
  SE: '#b91c1c',
  BA: '#ea580c',
  MT: '#7c3aed',
  MS: '#6d28d9',
  GO: '#8b5cf6',
  DF: '#a78bfa',
  MG: '#f59e0b',
  ES: '#fb923c',
  RJ: '#ea580c',
  SP: '#f97316',
  PR: '#0284c7',
  SC: '#06b6d4',
  RS: '#0369a1',
};
