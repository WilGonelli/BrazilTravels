import React from 'react';
import styles from './PhotoSlideshow.module.css';
import { SlideshowViewModelContract } from '../../../viewmodels/useSlideshowViewModel';

interface PhotoSlideshowProps {
  readonly viewModel: SlideshowViewModelContract;
}

/**
 * Upper presentation slideshow component displaying travel photos in grand hero format.
 */
export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const { photos, activePhoto, isPlaying } = state;

  return (
    <section className={styles.slideshowContainer} aria-label="Apresentação de Memórias de Viagem">
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.tagline}>
            <span className={styles.indicatorDot} aria-hidden="true" />
            <span>Travel Memories • Memórias de Viagem</span>
          </div>
          <h2 className={styles.heading}>Apresentação das Viagens Registradas</h2>
        </div>
        <div className={styles.badge} aria-live="polite">
          {photos.length} {photos.length === 1 ? 'Foto Registrada' : 'Fotos Registradas'}
        </div>
      </header>

      {/* Main Grand Hero Viewer */}
      <div className={styles.heroCard}>
        {activePhoto ? (
          <>
            <div className={styles.imageWrapper}>
              <img
                key={activePhoto.id}
                src={activePhoto.imageUrl}
                alt={`Foto de ${activePhoto.destinationName}`}
                className={styles.heroImage}
              />
            </div>

            <div className={styles.metaSection}>
              <div>
                <h3 className={styles.destTitle}>
                  {activePhoto.destinationName} ({activePhoto.stateCode})
                </h3>
                <p className={styles.destSub}>
                  {activePhoto.caption || 'Lembrança de viagem registrada'}
                  {activePhoto.travelDate ? ` • ${activePhoto.travelDate}` : ''}
                </p>
              </div>

              {photos.length > 1 && (
                <button
                  type="button"
                  className={styles.playPauseBtn}
                  onClick={actions.handleTogglePlayPause}
                  aria-label={isPlaying ? 'Pausar apresentação automática' : 'Iniciar apresentação automática'}
                >
                  {isPlaying ? '⏸ Pausar (15s)' : '▶ Reproduzir'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              🗺️
            </span>
            <h3 className={styles.emptyTitle}>Nenhuma foto adicionada ainda</h3>
            <p className={styles.emptyText}>
              Clique em qualquer estado ou praia no mapa abaixo para liberar o destino e clique no botão{' '}
              <strong>'+'</strong> para carregar suas memórias de viagem!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
