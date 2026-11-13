import React, { useMemo } from 'react';
import styles from './AppView.module.css';
import { useBrazilMapViewModel } from '../viewmodels/useBrazilMapViewModel';
import { useSlideshowViewModel } from '../viewmodels/useSlideshowViewModel';
import { createDefaultStorageService } from '../services/StorageFactory';
import { PhotoSlideshow } from './components/slideshow/PhotoSlideshow';
import { BrazilMapSvg } from './components/map/BrazilMapSvg';
import { CategorySidebar } from './components/map/CategorySidebar';
import { StateFlagsBar } from './components/map/StateFlagsBar';
import { DestinationSearchBar } from './components/search/DestinationSearchBar';
import { SimpleUnlockModal } from './components/modal/SimpleUnlockModal';
import { PhotoUploadModal } from './components/modal/PhotoUploadModal';
import { AchievementsModal } from './components/modal/AchievementsModal';
import { RemoteControlModal } from './components/modal/RemoteControlModal';

/**
 * Main application view following the strict MVVM architecture.
 */
export const AppView: React.FC = () => {
  const sharedStorage = useMemo(() => createDefaultStorageService(), []);

  // 10-second automatic slideshow transition per user specification
  const slideshowViewModel = useSlideshowViewModel(sharedStorage, 10000);

  const mapViewModel = useBrazilMapViewModel(
    sharedStorage,
    slideshowViewModel.actions.handleAddPhoto,
    slideshowViewModel.actions.handleAddPhotos
  );

  const { state, actions } = mapViewModel;
  const {
    selectedStateCode,
    unlockedStatesCount,
    totalStatesCount,
    progressPercentage,
    unlockedPointsCount,
    totalPointsCount,
    pointsProgressPercentage,
    isUnlockModalOpen,
    pendingDestination,
    isPhotoModalOpen,
    targetPhotoDestination,
    raffleNotification,
    achievements,
    unlockedAchievementsCount,
    totalAchievementsCount,
    isAchievementsModalOpen,
    isRemoteModalOpen,
  } = state;

  return (
    <main className={styles.appLayout}>
      <div className={styles.pageGrid}>
        {/* Main Column: Image Card on top, Map Poster Card below */}
        <div className={styles.mainColumn}>
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

              <div className={styles.headerStatsGroup}>
                <div className={styles.progressBadge} aria-live="polite">
                  <span className={styles.progressItem}>
                    <strong>{unlockedStatesCount}</strong>/{totalStatesCount} Estados (
                    {progressPercentage}%)
                  </span>
                  <span className={styles.progressDivider} aria-hidden="true">
                    •
                  </span>
                  <span className={styles.progressItem}>
                    <strong>{unlockedPointsCount}</strong>/{totalPointsCount} Destinos (
                    {pointsProgressPercentage.toFixed(2)}% visitados)
                  </span>
                </div>

                <div className={styles.searchSection}>
                  <DestinationSearchBar viewModel={mapViewModel} />
                </div>
              </div>
            </header>

            {/* Dedicated Action Toolbar */}
            <div className={styles.mapToolbar} role="toolbar" aria-label="Ferramentas e Ações do Mapa">
              <div className={styles.toolbarActionsLeft}>
                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onClick={actions.handleOpenAchievements}
                  aria-label={`Ver conquistas e medalhas (${unlockedAchievementsCount} de ${totalAchievementsCount})`}
                  title="Conquistas de Viagem"
                >
                  🏅 Conquistas
                  <span className={styles.toolbarBtnBadge}>
                    {unlockedAchievementsCount}/{totalAchievementsCount}
                  </span>
                </button>

                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onClick={actions.handlePickRandomDestination}
                  aria-label={
                    selectedStateCode
                      ? `Sortear próximo destino não visitado em ${selectedStateCode}`
                      : 'Sortear próximo destino não visitado no Brasil'
                  }
                  title={
                    selectedStateCode
                      ? `Sortear destino não visitado em ${selectedStateCode}`
                      : 'Sortear destino não visitado no Brasil'
                  }
                >
                  🎲 Sortear {selectedStateCode ? `(${selectedStateCode})` : 'Destino'}
                </button>

                <button
                  type="button"
                  className={styles.toolbarBtn}
                  onClick={actions.handleOpenRemoteModal}
                  aria-label="Abrir controle remoto e acesso celular"
                  title="Controle Remoto / Acesso Celular"
                >
                  📱 Celular
                </button>
              </div>

              {selectedStateCode && (
                <div className={styles.toolbarActionsRight}>
                  <button
                    type="button"
                    className={styles.clearFilterBtn}
                    onClick={() => actions.handleSelectState(null)}
                  >
                    ✕ Limpar Filtro ({selectedStateCode})
                  </button>
                </div>
              )}
            </div>

            {/* Raffle Notification Feedback Banner */}
            {raffleNotification && (
              <div className={styles.raffleAlertBanner} role="alert" aria-live="polite">
                <span className={styles.raffleAlertText}>
                  🔔 {raffleNotification}
                </span>
                <button
                  type="button"
                  className={styles.raffleAlertDismiss}
                  onClick={actions.handleDismissRaffleNotification}
                  aria-label="Fechar aviso de sorteio"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Visual Gradient Progress Bar */}
            <div
              className={styles.progressBarWrapper}
              role="progressbar"
              aria-valuenow={pointsProgressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso geral de viagens: ${pointsProgressPercentage}% dos destinos visitados e ${progressPercentage}% dos estados explorados`}
            >
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.min(100, Math.max(pointsProgressPercentage, 2))}%` }}
              />
            </div>

            {/* 3-Column Poster Layout */}
            <div className={styles.posterGrid}>
              {/* Left Column: Cidades, Pontos Turísticos, Cachoeiras, Ilhas */}
              <aside className={styles.leftColumn} aria-label="Categorias de Destinos">
                <CategorySidebar
                  title="Cidades Famosas"
                  category="FamousCity"
                  viewModel={mapViewModel}
                />
                <CategorySidebar
                  title="Pontos Turísticos"
                  category="TouristSpot"
                  viewModel={mapViewModel}
                />
                <CategorySidebar
                  title="Cachoeiras"
                  category="Waterfall"
                  viewModel={mapViewModel}
                />
                <CategorySidebar title="Ilhas" category="Island" viewModel={mapViewModel} />
              </aside>

              {/* Center Column: Brazil Vector Map */}
              <div className={styles.centerColumn}>
                <BrazilMapSvg viewModel={mapViewModel} />
              </div>

              {/* Right Column: Principais Praias */}
              <aside className={styles.rightColumn} aria-label="Principais Praias">
                <CategorySidebar
                  title="Principais Praias"
                  category="Beach"
                  viewModel={mapViewModel}
                />
              </aside>
            </div>

            <footer className={styles.footerNote}>
              Otimizado para exibição em Totem Vertical (1080×1920) e Monitores Desktop • MVVM
              Architecture
            </footer>
          </section>
        </div>

        {/* Right Lateral Column: State Flags Card spanning the full height along image and map */}
        <aside className={styles.flagsSidebar} aria-label="Estados do Brasil">
          <StateFlagsBar viewModel={mapViewModel} />
        </aside>
      </div>

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
        onSave={actions.handleSavePhotos}
        onClose={actions.handleClosePhotoUpload}
      />

      {/* Traveler Badges & Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        achievements={achievements}
        unlockedCount={unlockedAchievementsCount}
        totalCount={totalAchievementsCount}
        onClose={actions.handleCloseAchievements}
      />

      {/* Remote Control & Mobile Access Modal */}
      <RemoteControlModal
        isOpen={isRemoteModalOpen}
        onClose={actions.handleCloseRemoteModal}
        onNextPhoto={slideshowViewModel.actions.handleNext}
        onPrevPhoto={slideshowViewModel.actions.handlePrevious}
        onTogglePlayPause={slideshowViewModel.actions.handleTogglePlayPause}
        isPlaying={slideshowViewModel.state.isPlaying}
        onPickRandomDestination={actions.handlePickRandomDestination}
      />
    </main>
  );
};
