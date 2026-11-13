import React from 'react';
import styles from './PhotoSlideshow.module.css';
import {
  SlideshowViewModelContract,
  KenBurnsVariant,
} from '../../../viewmodels/useSlideshowViewModel';
import { PhotoManagerModal } from '../modal/PhotoManagerModal';

interface PhotoSlideshowProps {
  readonly viewModel: SlideshowViewModelContract;
}

/**
 * Maps Ken Burns variant key to corresponding CSS module class name.
 */
function getKenBurnsClass(variant: KenBurnsVariant): string {
  switch (variant) {
    case 'pan-left':
      return styles.kenBurnsPanLeft;
    case 'pan-right':
      return styles.kenBurnsPanRight;
    case 'zoom-out':
      return styles.kenBurnsZoomOut;
    case 'zoom-in':
    default:
      return styles.kenBurnsZoomIn;
  }
}

/**
 * Formats ISO date string (YYYY-MM-DD) into readable Portuguese date.
 */
function formatTravelDate(dateString?: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

/**
 * Upper presentation slideshow component displaying travel photos in grand hero format
 * with Ken Burns cinematic pan/zoom, destination multi-photo carousel, and interactive favorites.
 */
export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({ viewModel }) => {
  const { state, actions } = viewModel;
  const {
    photos,
    activePhoto,
    isPlaying,
    isGalleryOpen,
    kenBurnsVariant,
    activeDestinationPhotos,
    destinationPhotoIndex,
  } = state;

  const kenBurnsClass = getKenBurnsClass(kenBurnsVariant);
  const hasMultipleDestPhotos = activeDestinationPhotos.length > 1;

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

        <div className={styles.headerControls}>
          {photos.length > 0 && (
            <button
              type="button"
              className={styles.managePhotosBtn}
              onClick={actions.handleOpenGallery}
              aria-label="Gerenciar e remover fotos de viagem"
              title="Gerenciar fotos"
            >
              🗑️ Gerenciar Fotos ({photos.length})
            </button>
          )}

          <div className={styles.badge} aria-live="polite">
            {photos.length} {photos.length === 1 ? 'Foto Registrada' : 'Fotos Registradas'}
          </div>
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
                className={`${styles.heroImage} ${kenBurnsClass}`}
              />

              {/* Destination Multi-Photo Carousel Overlay */}
              {hasMultipleDestPhotos && (
                <div
                  className={styles.carouselOverlay}
                  aria-label="Navegação de fotos deste destino"
                >
                  <button
                    type="button"
                    className={styles.carouselNavBtn}
                    onClick={actions.handlePreviousDestinationPhoto}
                    aria-label="Foto anterior deste destino"
                  >
                    ‹
                  </button>

                  <span className={styles.carouselCounter}>
                    {destinationPhotoIndex + 1} / {activeDestinationPhotos.length}
                  </span>

                  <div className={styles.carouselDots} role="tablist">
                    {activeDestinationPhotos.map((p, idx) => (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={idx === destinationPhotoIndex}
                        aria-label={`Ver foto ${idx + 1} de ${activeDestinationPhotos.length}`}
                        className={`${styles.carouselDot} ${
                          idx === destinationPhotoIndex ? styles.carouselDotActive : ''
                        }`}
                        onClick={() => actions.handleJumpToDestinationPhoto(idx)}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className={styles.carouselNavBtn}
                    onClick={actions.handleNextDestinationPhoto}
                    aria-label="Próxima foto deste destino"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            <div className={styles.metaSection}>
              <div>
                <div className={styles.destTitleRow}>
                  <h3 className={styles.destTitle}>
                    {activePhoto.destinationName} ({activePhoto.stateCode})
                  </h3>
                  <button
                    type="button"
                    className={styles.favoriteStarBtn}
                    onClick={() => actions.handleToggleFavorite(activePhoto.id)}
                    aria-label={
                      activePhoto.isFavorite
                        ? 'Remover dos favoritos'
                        : 'Marcar foto como favorita'
                    }
                    title={activePhoto.isFavorite ? 'Foto favorita' : 'Marcar favorita'}
                  >
                    {activePhoto.isFavorite ? '⭐' : '☆'}
                  </button>
                </div>

                <p className={styles.destSub}>
                  {activePhoto.caption || 'Lembrança de viagem registrada'}
                </p>

                {activePhoto.travelDate && (
                  <span className={styles.datePill}>
                    📅 {formatTravelDate(activePhoto.travelDate)}
                  </span>
                )}
              </div>

              {photos.length > 1 && (
                <button
                  type="button"
                  className={styles.playPauseBtn}
                  onClick={actions.handleTogglePlayPause}
                  aria-label={
                    isPlaying
                      ? 'Pausar apresentação automática'
                      : 'Iniciar apresentação automática'
                  }
                >
                  {isPlaying ? '⏸ Pausar (10s)' : '▶ Reproduzir'}
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
              Clique em qualquer estado ou praia no mapa abaixo para liberar o destino e clique no
              botão <strong>'+'</strong> para carregar suas memórias de viagem!
            </p>
          </div>
        )}
      </div>

      {/* Photo Management & Removal Modal */}
      <PhotoManagerModal
        isOpen={isGalleryOpen}
        photos={photos}
        onClose={actions.handleCloseGallery}
        onDeletePhoto={actions.handleDeletePhoto}
        onToggleFavorite={actions.handleToggleFavorite}
      />
    </section>
  );
};
