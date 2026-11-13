import React from 'react';
import styles from './PhotoSlideshow.module.css';
import { SlideshowViewModelContract } from '../../../viewmodels/useSlideshowViewModel';

interface PhotoSlideshowProps {
  readonly viewModel: SlideshowViewModelContract;
}

/**
 * Upper presentation slideshow component displaying travel photos.
 */
export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const { photos, activeIndex, activePhoto, isPlaying } = state;

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

      <div className={styles.contentGrid}>
        {/* Main Hero Viewer */}
        <div className={styles.heroCard}>
          {activePhoto ? (
            <>
              <div className={styles.imageWrapper}>
                <img
                  src={activePhoto.imageUrl}
                  alt={`Foto de ${activePhoto.destinationName}`}
                  className={styles.heroImage}
                />
                <span className={styles.heroBadge}>★ DESTINO DESBLOQUEADO</span>

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={`${styles.navButton} ${styles.prevButton}`}
                      onClick={actions.handlePrevious}
                      aria-label="Foto anterior"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className={`${styles.navButton} ${styles.nextButton}`}
                      onClick={actions.handleNext}
                      aria-label="Próxima foto"
                    >
                      ›
                    </button>
                  </>
                )}
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
                    {isPlaying ? '⏸ Pausar' : '▶ Reproduzir'}
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
                <strong>'+'</strong> para carregar suas primeiras memórias de viagem!
              </p>
            </div>
          )}
        </div>

        {/* Thumbnails Sidebar */}
        <div className={styles.thumbnailList} role="tablist" aria-label="Lista de Fotos das Viagens">
          {photos.map((photo, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={photo.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.thumbnailItem} ${isActive ? styles.thumbnailActive : ''}`}
                onClick={() => actions.handleSelectIndex(index)}
              >
                <img src={photo.imageUrl} alt="" aria-hidden="true" className={styles.thumbImg} />
                <div className={styles.thumbInfo}>
                  <span className={styles.thumbTitle}>{photo.destinationName}</span>
                  <span className={styles.thumbDate}>{photo.travelDate || photo.stateCode}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
