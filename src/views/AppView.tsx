import React from 'react';
import styles from './AppView.module.css';
import { useBrazilMapViewModel } from '../viewmodels/useBrazilMapViewModel';
import { useSlideshowViewModel } from '../viewmodels/useSlideshowViewModel';
import { PhotoSlideshow } from './components/slideshow/PhotoSlideshow';
import { BrazilMapSvg } from './components/map/BrazilMapSvg';
import { CategorySidebar } from './components/map/CategorySidebar';
import { StateFlagsBar } from './components/map/StateFlagsBar';
import { SimpleUnlockModal } from './components/modal/SimpleUnlockModal';
import { PhotoUploadModal } from './components/modal/PhotoUploadModal';

/**
 * Main application view following the strict MVVM architecture.
 */
export const AppView: React.FC = () => {
  const slideshowViewModel = useSlideshowViewModel();

  const mapViewModel = useBrazilMapViewModel(
    undefined,
    // When a photo is saved, immediately add it to the slideshow
    slideshowViewModel.actions.handleAddPhoto
  );

  const { state, actions } = mapViewModel;
  const {
    selectedStateCode,
    unlockedStatesCount,
    totalStatesCount,
    progressPercentage,
    isUnlockModalOpen,
    pendingDestination,
    isPhotoModalOpen,
    targetPhotoDestination,
  } = state;

  return (
    <main className={styles.appLayout}>
      {/* Top Banner Ribbon: 27 State Flags */}
      <StateFlagsBar viewModel={mapViewModel} />

      {/* Upper Presentation Slideshow */}
      <PhotoSlideshow viewModel={slideshowViewModel} />

      {/* Lower Interactive Scratch-off Map Poster */}
      <section className={styles.mapPosterContainer} aria-label="Poster do Mapa do Brasil">
        <header className={styles.mapHeader}>
          <div className={styles.posterTitleGroup}>
            <h1 className={styles.mainTitle}>MAPA DO BRASIL • ESTILO RASPAGEM</h1>
            <p className={styles.subTitle}>
              {selectedStateCode
                ? `Exibindo destinos de ${selectedStateCode}. Clique no estado novamente para desmarcar.`
                : 'Fronteiras geográficas oficiais do IBGE. Clique em qualquer local para liberar e raspar!'}
            </p>
          </div>

          <div className={styles.headerActions}>
            {selectedStateCode && (
              <button
                type="button"
                className={styles.clearFilterBtn}
                onClick={() => actions.handleSelectState(null)}
              >
                ✕ Limpar Filtro ({selectedStateCode})
              </button>
            )}

            <div className={styles.progressBadge} aria-live="polite">
              Progresso: {unlockedStatesCount} / {totalStatesCount} Estados ({progressPercentage}%)
            </div>
          </div>
        </header>

        {/* 3-Column Poster Layout */}
        <div className={styles.posterGrid}>
          {/* Left Column: Cidades, Pontos Turísticos, Cachoeiras, Ilhas */}
          <aside className={styles.leftColumn} aria-label="Categorias de Destinos">
            <CategorySidebar title="Cidades Famosas" category="FamousCity" viewModel={mapViewModel} />
            <CategorySidebar title="Pontos Turísticos" category="TouristSpot" viewModel={mapViewModel} />
            <CategorySidebar title="Cachoeiras" category="Waterfall" viewModel={mapViewModel} />
            <CategorySidebar title="Ilhas" category="Island" viewModel={mapViewModel} />
          </aside>

          {/* Center Column: Brazil Vector Map */}
          <div className={styles.centerColumn}>
            <BrazilMapSvg viewModel={mapViewModel} />
          </div>

          {/* Right Column: Principais Praias */}
          <aside className={styles.rightColumn} aria-label="Principais Praias">
            <CategorySidebar title="Principais Praias" category="Beach" viewModel={mapViewModel} />
          </aside>
        </div>

        <footer className={styles.footerNote}>
          Otimizado para exibição em Totem Vertical (1080×1920) e Monitores Desktop • MVVM Architecture
        </footer>
      </section>

      {/* Minimalist Unlock Confirmation Modal */}
      <SimpleUnlockModal
        isOpen={isUnlockModalOpen}
        destination={pendingDestination}
        onConfirm={actions.handleConfirmUnlock}
        onCancel={actions.handleCancelUnlock}
        onOpenPhotoUpload={actions.handleOpenPhotoUpload}
      />

      {/* Dedicated Photo Upload Modal (Triggered via '+' Button) */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        destination={targetPhotoDestination}
        onSave={actions.handleSavePhoto}
        onClose={actions.handleClosePhotoUpload}
      />
    </main>
  );
};
