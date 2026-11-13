import { Destination, STATE_COLORS, REGION_COLORS } from './Destination';
import { ALL_RAW_DESTINATIONS } from './states';

export { ALL_RAW_DESTINATIONS };

/**
 * Generates initial destinations record mapped by id using all 27 federative state catalogues.
 *
 * @param unlockedIds - Optional set of destination IDs that have already been scratched off.
 * @returns Record of Destination entities indexed by destination ID.
 */
export function createInitialDestinations(unlockedIds: Set<string> = new Set()): Record<string, Destination> {
  const result: Record<string, Destination> = {};

  for (const raw of ALL_RAW_DESTINATIONS) {
    const isUnlocked = unlockedIds.has(raw.id);
    const color = STATE_COLORS[raw.stateCode] || REGION_COLORS[raw.region];

    result[raw.id] = {
      ...raw,
      isUnlocked,
      unlockedColor: color,
      photoUrls: [],
    };
  }

  return result;
}
