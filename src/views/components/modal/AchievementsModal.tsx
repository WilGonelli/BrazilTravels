import React, { useEffect } from 'react';
import styles from './AchievementsModal.module.css';
import { Achievement } from '../../../models/Achievement';

interface AchievementsModalProps {
  readonly isOpen: boolean;
  readonly achievements: readonly Achievement[];
  readonly unlockedCount: number;
  readonly totalCount: number;
  readonly onClose: () => void;
}

/**
 * Accessible modal showcasing traveler achievement badges, progress, and unlocked accolades.
 */
export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  achievements,
  unlockedCount,
  totalCount,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const overallPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
    >
      <div className={styles.modalCard}>
        <header className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 id="achievements-modal-title" className={styles.modalTitle}>
              🏅 Conquistas & Medalhas de Viajante
            </h2>
            <span className={styles.badgeCount} aria-live="polite">
              {unlockedCount} / {totalCount} Conquistadas
            </span>
          </div>
          <button
            type="button"
            className={styles.closeModalBtn}
            onClick={onClose}
            aria-label="Fechar janela de conquistas"
          >
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          {/* Overall summary progress */}
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <span className={styles.summaryTitle}>Progresso Geral das Conquistas</span>
              <span className={styles.summaryPercent}>{overallPercent}% Concluído</span>
            </div>
            <div
              className={styles.overallProgressBar}
              role="progressbar"
              aria-valuenow={overallPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.overallProgressFill} style={{ width: `${overallPercent}%` }} />
            </div>
          </div>

          {/* Badges Grid */}
          <div className={styles.badgesGrid}>
            {achievements.map((badge) => (
              <div
                key={badge.id}
                className={`${styles.badgeCard} ${badge.isUnlocked ? styles.badgeUnlocked : ''}`}
              >
                <div className={styles.badgeIconWrapper} aria-hidden="true">
                  {badge.icon}
                </div>

                <div className={styles.badgeInfo}>
                  <div className={styles.badgeTitleRow}>
                    <h3 className={styles.badgeTitle}>{badge.title}</h3>
                    {badge.isUnlocked && (
                      <span className={styles.unlockedCheck} aria-label="Conquista desbloqueada">
                        ✓ Desbloqueada
                      </span>
                    )}
                  </div>

                  <p className={styles.badgeDescription}>{badge.description}</p>

                  <div className={styles.badgeProgressRow}>
                    <div
                      className={styles.badgeProgressBar}
                      role="progressbar"
                      aria-valuenow={badge.progressPercentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`${styles.badgeProgressFill} ${
                          badge.isUnlocked ? styles.badgeProgressFillUnlocked : ''
                        }`}
                        style={{ width: `${badge.progressPercentage}%` }}
                      />
                    </div>
                    <span className={styles.badgeCountText}>
                      {badge.currentCount}/{badge.requiredCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
