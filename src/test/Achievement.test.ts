import { describe, it, expect } from 'vitest';
import { calculateAchievements } from '../models/Achievement';
import { Destination } from '../models/Destination';
import { TravelPhoto } from '../models/TravelPhoto';

function createMockDestination(overrides: Partial<Destination>): Destination {
  return {
    id: 'test-id',
    name: 'Destino Teste',
    category: 'Beach',
    region: 'Sudeste',
    stateCode: 'SP',
    isUnlocked: false,
    unlockedColor: '#22c55e',
    photoUrls: [],
    ...overrides,
  };
}

describe('Achievement domain calculation', () => {
  it('returns all badges locked initially when no destinations or photos exist', () => {
    const destinations: Record<string, Destination> = {
      'sp-felix': createMockDestination({ id: 'sp-felix', isUnlocked: false }),
    };
    const badges = calculateAchievements(destinations, []);

    expect(badges).toHaveLength(9);
    expect(badges.every((b) => !b.isUnlocked)).toBe(true);
    expect(badges.find((b) => b.id === 'first-step')?.isUnlocked).toBe(false);
  });

  it('unlocks "Primeiro Passo" when at least one destination is unlocked', () => {
    const destinations: Record<string, Destination> = {
      'sp-felix': createMockDestination({ id: 'sp-felix', isUnlocked: true }),
    };
    const badges = calculateAchievements(destinations, []);

    const firstStep = badges.find((b) => b.id === 'first-step');
    expect(firstStep?.isUnlocked).toBe(true);
    expect(firstStep?.progressPercentage).toBe(100);
  });

  it('unlocks "Mestre das Águas" when 5 beaches are unlocked', () => {
    const destinations: Record<string, Destination> = {};
    for (let i = 1; i <= 5; i++) {
      destinations[`beach-${i}`] = createMockDestination({
        id: `beach-${i}`,
        category: 'Beach',
        isUnlocked: true,
      });
    }

    const badges = calculateAchievements(destinations, []);
    const seaMaster = badges.find((b) => b.id === 'sea-master');

    expect(seaMaster?.isUnlocked).toBe(true);
    expect(seaMaster?.currentCount).toBe(5);
  });

  it('unlocks "Expedição 5 Regiões" when all 5 Brazilian regions have unlocked destinations', () => {
    const destinations: Record<string, Destination> = {
      'n-1': createMockDestination({ id: 'n-1', region: 'Norte', isUnlocked: true }),
      'ne-1': createMockDestination({ id: 'ne-1', region: 'Nordeste', isUnlocked: true }),
      'co-1': createMockDestination({ id: 'co-1', region: 'Centro-Oeste', isUnlocked: true }),
      'se-1': createMockDestination({ id: 'se-1', region: 'Sudeste', isUnlocked: true }),
      's-1': createMockDestination({ id: 's-1', region: 'Sul', isUnlocked: true }),
    };

    const badges = calculateAchievements(destinations, []);
    const fiveRegions = badges.find((b) => b.id === 'five-regions');

    expect(fiveRegions?.isUnlocked).toBe(true);
    expect(fiveRegions?.currentCount).toBe(5);
  });

  it('unlocks "Coleção Dourada" and "Guardião de Memórias" when enough photos and favorites exist', () => {
    const photos: TravelPhoto[] = [
      { id: 'p1', destinationId: 'd1', destinationName: 'D1', stateCode: 'SP', imageUrl: 'u1', isFavorite: true, createdAt: '2026-11-13' },
      { id: 'p2', destinationId: 'd1', destinationName: 'D1', stateCode: 'SP', imageUrl: 'u2', isFavorite: true, createdAt: '2026-11-13' },
      { id: 'p3', destinationId: 'd2', destinationName: 'D2', stateCode: 'RJ', imageUrl: 'u3', isFavorite: true, createdAt: '2026-11-13' },
      { id: 'p4', destinationId: 'd2', destinationName: 'D2', stateCode: 'RJ', imageUrl: 'u4', isFavorite: false, createdAt: '2026-11-13' },
      { id: 'p5', destinationId: 'd3', destinationName: 'D3', stateCode: 'BA', imageUrl: 'u5', isFavorite: false, createdAt: '2026-11-13' },
    ];

    const badges = calculateAchievements({}, photos);
    const memoryKeeper = badges.find((b) => b.id === 'memory-keeper');
    const goldenFavorites = badges.find((b) => b.id === 'golden-favorites');

    expect(memoryKeeper?.isUnlocked).toBe(true);
    expect(goldenFavorites?.isUnlocked).toBe(true);
    expect(goldenFavorites?.currentCount).toBe(3);
  });
});
