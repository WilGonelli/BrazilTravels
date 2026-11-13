import React from 'react';
import { Flag, statesData } from 'br-state-flags';
import styles from './StateFlagsBar.module.css';
import { BrazilMapViewModelContract } from '../../../viewmodels/useBrazilMapViewModel';
import { BrazilStateCode } from '../../../models/Destination';
import { BRAZIL_GEO_PATHS } from '../../../models/brazilGeoPaths';

interface StateFlagsBarProps {
  readonly viewModel: BrazilMapViewModelContract;
}

const ALL_STATE_CODES = Object.keys(BRAZIL_GEO_PATHS) as BrazilStateCode[];

/**
 * Top ribbon displaying all 27 Federative Unit flags in scratch-off (locked) vs. official flag (unlocked) style.
 */
export const StateFlagsBar: React.FC<StateFlagsBarProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const { destinations, selectedStateCode } = state;

  return (
    <div className={styles.flagsBarContainer} aria-label="Bandeiras e siglas dos Estados do Brasil">
      <div className={styles.headerRow}>
        <span className={styles.title}>Estados:</span>
        {selectedStateCode && (
          <button
            type="button"
            className={styles.resetFilterBtn}
            onClick={() => actions.handleSelectState(null)}
            aria-label="Limpar filtro de estado"
          >
            ✕ Limpar ({selectedStateCode})
          </button>
        )}
      </div>

      <div className={styles.flagsGrid} role="group" aria-label="Seleção rápida de estados">
        {ALL_STATE_CODES.map((code) => {
          const stateId = `state-${code}`;
          const dest = destinations[stateId];
          const isUnlocked = dest?.isUnlocked ?? false;
          const isSelected = selectedStateCode === code;
          const stateMetadata = statesData[code];
          const stateName = stateMetadata?.name ?? code;

          return (
            <button
              key={code}
              type="button"
              className={`${styles.flagChip} ${isUnlocked ? styles.flagUnlocked : styles.flagLocked} ${
                isSelected ? styles.flagSelected : ''
              }`}
              onClick={() => actions.handleSelectState(code)}
              aria-label={`Filtrar destinos de ${stateName} (${code}) - ${
                isUnlocked ? 'Bandeira oficial liberada' : 'Bloqueado (Raspadinha)'
              }`}
              title={`${stateName} (${code}) - ${isUnlocked ? 'Liberado' : 'Bloqueado'}`}
              aria-pressed={isSelected}
            >
              {isUnlocked ? (
                <>
                  <div className={styles.flagSvgWrapper} aria-hidden="true">
                    <Flag uf={code} width="100%" height="100%" accessible={false} />
                  </div>
                  <span className={styles.flagCodeBadge} aria-hidden="true">
                    {code}
                  </span>
                </>
              ) : (
                <span className={styles.lockedCode}>{code}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

