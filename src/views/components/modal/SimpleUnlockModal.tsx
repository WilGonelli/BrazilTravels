import React, { useEffect, useRef } from 'react';
import { Flag } from 'br-state-flags';
import styles from './SimpleUnlockModal.module.css';
import { Destination, DestinationCategory } from '../../../models/Destination';

export interface SimpleUnlockModalProps {
  readonly isOpen: boolean;
  readonly destination: Destination | null;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly onOpenPhotoUpload?: (destination: Destination) => void;
}

const CATEGORY_LABELS: Record<DestinationCategory, string> = {
  State: 'Estado',
  Beach: 'Praia',
  Waterfall: 'Cachoeira',
  Island: 'Ilha',
  FamousCity: 'Cidade Famosa',
  TouristSpot: 'Ponto Turístico',
};

/**
 * Accessible modal displaying destination details, Google Maps navigation link,
 * and travel unlock confirmation.
 */
export const SimpleUnlockModal: React.FC<SimpleUnlockModalProps> = ({
  isOpen,
  destination,
  onConfirm,
  onCancel,
  onOpenPhotoUpload,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    if (destination?.isUnlocked) {
      closeBtnRef.current?.focus();
    } else {
      confirmBtnRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, destination?.isUnlocked, onCancel]);

  if (!isOpen || !destination) return null;

  const isUnlocked = destination.isUnlocked;
  const mapsSearchUrl =
    destination.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${destination.name}, ${destination.stateCode}, Brasil`,
    )}`;
  const categoryLabel = CATEGORY_LABELS[destination.category] || destination.category;

  return (
    <div
      className={styles.backdrop}
      onClick={onCancel}
      role="presentation"
    >
      <div
        className={styles.modalBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dest-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <span className={styles.categoryBadge}>{categoryLabel}</span>
            <span className={styles.headerState}>
              <span className={styles.headerFlag} aria-hidden="true">
                <Flag uf={destination.stateCode} width="22" height="15" accessible={false} />
              </span>
              <span>{destination.stateCode}</span>
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          <h2 id="modal-dest-title" className={styles.destinationTitle}>
            {destination.name}
          </h2>

          <div className={styles.statusRow}>
            <span
              className={`${styles.statusPill} ${isUnlocked ? styles.unlockedPill : styles.lockedPill}`}
            >
              {isUnlocked ? '✓ Liberado / Visitado' : '🔒 Destino Bloqueado'}
            </span>
          </div>

          <div className={styles.mapsCard}>
            <div className={styles.mapsIcon} aria-hidden="true">
              🗺️
            </div>
            <div className={styles.mapsContent}>
              <span className={styles.mapsTitle}>Localização & Rotas</span>
              <span className={styles.mapsSubtitle}>Explore no mapa oficial com fotos e rotas</span>
            </div>
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapsLinkBtn}
              aria-label={`Ver ${destination.name} no Google Maps (abre em nova guia)`}
            >
              <span>Abrir Maps</span>
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
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>

          {!isUnlocked ? (
            <p className={styles.ruleNote}>
              ✦ <strong>Regra em Cascata:</strong> Ao confirmar a visita, este destino é raspado e o{' '}
              <strong>Estado ({destination.stateCode})</strong> também será colorido no mapa, liberando o upload de fotos.
            </p>
          ) : (
            <p className={styles.ruleNote}>
              ✦ Este destino já está desbloqueado em seu passaporte! Você pode registrar fotos de viagem para o álbum.
            </p>
          )}
        </div>

        <footer className={styles.modalActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            {isUnlocked ? 'Fechar' : 'Cancelar'}
          </button>

          {isUnlocked && onOpenPhotoUpload && (
            <button
              type="button"
              className={styles.photoActionBtn}
              onClick={() => {
                onCancel();
                onOpenPhotoUpload(destination);
              }}
            >
              📷 Adicionar Fotos
            </button>
          )}

          {!isUnlocked && (
            <button
              ref={confirmBtnRef}
              type="button"
              className={styles.confirmBtn}
              onClick={onConfirm}
            >
              ✓ Liberar Destino
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
