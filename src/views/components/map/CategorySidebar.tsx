import React from 'react';
import styles from './CategorySidebar.module.css';
import { Destination, DestinationCategory } from '../../../models/Destination';
import { BrazilMapViewModelContract } from '../../../viewmodels/useBrazilMapViewModel';

interface CategorySidebarProps {
  readonly title: string;
  readonly category: DestinationCategory;
  readonly viewModel: BrazilMapViewModelContract;
}

/**
 * Category sidebar listing destinations with dynamic filter (unlocked global vs. state-focused).
 */
export const CategorySidebar: React.FC<CategorySidebarProps> = ({ title, category, viewModel }) => {
  const { state, actions } = viewModel;
  const { displayedDestinations, selectedStateCode } = state;

  // Filter displayed destinations by this category
  const items = displayedDestinations.filter((d) => d.category === category);

  return (
    <div className={styles.sidebarCard}>
      <div className={styles.categoryTitle}>
        <span>{title}</span>
        <span className={styles.countTag}>
          {selectedStateCode ? `(${selectedStateCode})` : 'Liberados'} ({items.length})
        </span>
      </div>

      <div className={styles.itemList} role="list" aria-label={`Lista de ${title}`}>
        {items.length === 0 ? (
          <p className={styles.emptyNotice}>
            {selectedStateCode
              ? 'Nenhum ponto desta categoria cadastrado para este estado.'
              : 'Nenhum destino liberado nesta categoria ainda.'}
          </p>
        ) : (
          items.map((item: Destination) => {
            const isUnlocked = item.isUnlocked;

            return (
              <div
                key={item.id}
                role="listitem"
                tabIndex={0}
                className={`${styles.itemCard} ${isUnlocked ? styles.itemUnlocked : styles.itemLocked}`}
                style={isUnlocked ? { backgroundColor: item.unlockedColor } : undefined}
                onClick={() => {
                  actions.handleRequestUnlock(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    actions.handleRequestUnlock(item);
                  }
                }}
              >
                <div className={styles.itemContent}>
                  <span className={styles.statusIcon} aria-hidden="true">
                    {isUnlocked ? '✓' : '🔒'}
                  </span>
                  <span className={styles.itemName} title={item.name}>
                    {item.name}
                  </span>
                </div>

                {isUnlocked && (
                  <button
                    type="button"
                    className={styles.addPhotoBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.handleOpenPhotoUpload(item);
                    }}
                    aria-label={`Adicionar fotos de viagem para ${item.name}`}
                    title="Adicionar fotos de viagem"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
