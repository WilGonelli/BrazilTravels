import React from 'react';
import styles from './StateFlagsBar.module.css';
import { BrazilMapViewModelContract } from '../../../viewmodels/useBrazilMapViewModel';
import { BrazilStateCode } from '../../../models/Destination';
import { BRAZIL_GEO_PATHS } from '../../../models/brazilGeoPaths';

interface StateFlagsBarProps {
  readonly viewModel: BrazilMapViewModelContract;
}

const ALL_STATE_CODES = Object.keys(BRAZIL_GEO_PATHS) as BrazilStateCode[];

/**
 * Top ribbon displaying all 27 Federative Unit flags in scratch-off vs. colored style.
 */
export const StateFlagsBar: React.FC<StateFlagsBarProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const { destinations, selectedStateCode } = state;

  return (
    <div className={styles.flagsBarContainer} aria-label="Bandeiras e siglas dos Estados do Brasil">
      <div className={styles.headerRow}>
        <span className={styles.title}>Bandeiras dos Estados (Raspadinha):</span>
        {selectedStateCode && (
          <button
            type="button"
            className={styles.resetFilterBtn}
            onClick={() => actions.handleSelectState(null)}
            aria-label="Limpar filtro de estado"
          >
            ✕ Limpar seleção ({selectedStateCode})
          </button>
        )}
      </div>

      <div className={styles.flagsGrid} role="group" aria-label="Seleção rápida de estados">
        {ALL_STATE_CODES.map((code) => {
          const stateId = `state-${code}`;
          const dest = destinations[stateId];
          const isUnlocked = dest?.isUnlocked ?? false;
          const isSelected = selectedStateCode === code;

          return (
            <button
              key={code}
              type="button"
              className={`${styles.flagChip} ${isUnlocked ? styles.flagUnlocked : styles.flagLocked} ${
                isSelected ? styles.flagSelected : ''
              }`}
              style={isUnlocked ? { backgroundColor: dest.unlockedColor } : undefined}
              onClick={() => actions.handleSelectState(code)}
              aria-label={`Filtrar destinos do estado ${code} - ${isUnlocked ? 'Liberado' : 'Bloqueado'}`}
              aria-pressed={isSelected}
            >
              {code}
            </button>
          );
        })}
      </div>
    </div>
  );
};
