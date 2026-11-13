import React from 'react';
import styles from './BrazilMapSvg.module.css';
import { BRAZIL_GEO_PATHS } from '../../../models/brazilGeoPaths';
import { BrazilMapViewModelContract } from '../../../viewmodels/useBrazilMapViewModel';
import { BrazilStateCode } from '../../../models/Destination';

interface BrazilMapSvgProps {
  readonly viewModel: BrazilMapViewModelContract;
}

/**
 * Accessible vector map rendering authentic IBGE geographic boundaries in scratch-card poster style.
 */
export const BrazilMapSvg: React.FC<BrazilMapSvgProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const { destinations, selectedStateCode } = state;

  return (
    <div className={styles.mapSvgWrapper}>
      <svg
        viewBox="0 0 600 630"
        className={styles.svgRoot}
        aria-label="Mapa do Brasil com os 27 estados em estilo raspadinha"
        role="region"
      >
        <defs>
          <linearGradient id="scratchSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b0b5be" />
            <stop offset="25%" stopColor="#d8dce2" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#828994" />
          </linearGradient>
        </defs>

        {Object.values(BRAZIL_GEO_PATHS).map((geo) => {
          const stateId = `state-${geo.code}`;
          const dest = destinations[stateId];
          const isUnlocked = dest?.isUnlocked ?? false;
          const isSelected = selectedStateCode === geo.code;

          const fillColor = isUnlocked ? dest.unlockedColor : 'url(#scratchSilverGrad)';
          const strokeColor = isSelected ? '#38bdf8' : isUnlocked ? '#1e293b' : '#475569';
          const strokeWidth = isSelected ? 3.5 : isUnlocked ? 1.5 : 1;

          const handleKey = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              actions.handleSelectState(geo.code as BrazilStateCode);
            }
          };

          return (
            <path
              key={geo.code}
              id={`svg-state-${geo.code}`}
              d={geo.pathD}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className={`${styles.statePath} ${isSelected ? styles.stateSelected : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`${geo.name} (${geo.code}), ${geo.region} - ${
                isUnlocked ? 'Desbloqueado' : 'Bloqueado (Raspadinha)'
              }`}
              aria-pressed={isSelected}
              onClick={() => actions.handleSelectState(geo.code as BrazilStateCode)}
              onKeyDown={handleKey}
            />
          );
        })}

        {/* State Code Labels */}
        {Object.values(BRAZIL_GEO_PATHS).map((geo) => {
          const stateId = `state-${geo.code}`;
          const dest = destinations[stateId];
          const isUnlocked = dest?.isUnlocked ?? false;

          let fontSize = 11;
          if (['AM', 'PA', 'MT', 'BA', 'MG'].includes(geo.code)) fontSize = 13;
          if (['SE', 'AL', 'PB', 'RN', 'ES', 'DF'].includes(geo.code)) fontSize = 9;

          const labelText = isUnlocked ? `${geo.code} ✓` : geo.code;
          const textColor = isUnlocked ? '#ffffff' : '#111827';

          return (
            <text
              key={`label-${geo.code}`}
              x={geo.center.x}
              y={geo.center.y}
              fill={textColor}
              fontSize={fontSize}
              className={styles.stateLabel}
            >
              {labelText}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
