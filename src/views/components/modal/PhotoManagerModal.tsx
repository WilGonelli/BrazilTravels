import React, { useState, useEffect, useMemo } from 'react';
import styles from './PhotoManagerModal.module.css';
import { TravelPhoto } from '../../../models/TravelPhoto';

export type PhotoSortOrder = 'newest' | 'oldest' | 'favorites' | 'name';

interface PhotoManagerModalProps {
  readonly isOpen: boolean;
  readonly photos: readonly TravelPhoto[];
  readonly onClose: () => void;
  readonly onDeletePhoto: (photoId: string) => Promise<void>;
  readonly onToggleFavorite?: (photoId: string) => Promise<void>;
}

/**
 * Normalizes text by removing diacritics / accents and converting to lower case.
 */
function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Dedicated modal to manage, sort, filter, favorite, and selectively remove travel photos.
 */
export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  photos,
  onClose,
  onDeletePhoto,
  onToggleFavorite,
}) => {
  const [photoPendingDelete, setPhotoPendingDelete] = useState<TravelPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<PhotoSortOrder>('newest');

  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (photoPendingDelete) {
          setPhotoPendingDelete(null);
        } else {
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photoPendingDelete, onClose]);

  // Filtered and sorted photos list
  const displayedPhotos = useMemo(() => {
    let result = [...photos];

    // Filter by query
    const q = normalizeSearchText(searchQuery.trim());
    if (q.length > 0) {
      result = result.filter((p) => {
        const dest = normalizeSearchText(p.destinationName);
        const state = normalizeSearchText(p.stateCode);
        const destId = normalizeSearchText(p.destinationId);
        const caption = p.caption ? normalizeSearchText(p.caption) : '';
        return dest.includes(q) || state === q || destId.includes(q) || caption.includes(q);
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === 'favorites') {
        if (Boolean(a.isFavorite) && !b.isFavorite) return -1;
        if (!a.isFavorite && Boolean(b.isFavorite)) return 1;
        return (b.travelDate || b.createdAt).localeCompare(a.travelDate || a.createdAt);
      }
      if (sortOrder === 'oldest') {
        return (a.travelDate || a.createdAt).localeCompare(b.travelDate || b.createdAt);
      }
      if (sortOrder === 'name') {
        return a.destinationName.localeCompare(b.destinationName);
      }
      // 'newest' default
      return (b.travelDate || b.createdAt).localeCompare(a.travelDate || a.createdAt);
    });

    return result;
  }, [photos, searchQuery, sortOrder]);

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    if (!photoPendingDelete) return;
    try {
      setIsDeleting(true);
      await onDeletePhoto(photoPendingDelete.id);
    } finally {
      setIsDeleting(false);
      setPhotoPendingDelete(null);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-manager-title"
    >
      <div className={styles.modalCard}>
        {/* Modal Header */}
        <header className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 id="photo-manager-title" className={styles.modalTitle}>
              🖼️ Gerenciar Fotos Registradas
            </h2>
            <span className={styles.photoCountBadge} aria-live="polite">
              {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
          <button
            type="button"
            className={styles.closeModalBtn}
            onClick={onClose}
            aria-label="Fechar gerenciador de fotos"
          >
            ✕
          </button>
        </header>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <p className={styles.instructionText}>
            Clique no <strong>✕</strong> no canto superior de qualquer foto para excluí-la, ou no{' '}
            <strong>⭐</strong> para favoritá-la.
          </p>

          {/* Search & Sort Toolbar */}
          {photos.length > 0 && (
            <div className={styles.toolbar} role="search">
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Filtrar por destino, estado ou legenda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filtrar fotos cadastradas"
                />
              </div>

              <div className={styles.sortGroup}>
                <label htmlFor="photo-sort-select" className={styles.sortLabel}>
                  Ordenar por:
                </label>
                <select
                  id="photo-sort-select"
                  className={styles.sortSelect}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as PhotoSortOrder)}
                >
                  <option value="newest">Mais recentes</option>
                  <option value="oldest">Mais antigas</option>
                  <option value="favorites">Favoritas primeiro ⭐</option>
                  <option value="name">Destino (A-Z)</option>
                </select>
              </div>
            </div>
          )}

          {photos.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">
                📷
              </span>
              <h3 className={styles.emptyTitle}>Nenhuma foto cadastrada</h3>
              <p className={styles.instructionText}>
                Todas as fotos foram removidas. Adicione novas memórias clicando no botão '+' dos
                destinos desbloqueados!
              </p>
            </div>
          ) : displayedPhotos.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon} aria-hidden="true">
                🔍
              </span>
              <h3 className={styles.emptyTitle}>Nenhuma foto encontrada</h3>
              <p className={styles.instructionText}>
                Nenhuma foto coincide com a pesquisa "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className={styles.photoGrid}>
              {displayedPhotos.map((photo) => (
                <div key={photo.id} className={styles.photoItem}>
                  <img
                    src={photo.imageUrl}
                    alt={`Foto de ${photo.destinationName}`}
                    className={styles.thumbnail}
                    loading="lazy"
                  />

                  {/* Favorite Toggle Button */}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      className={styles.favoritePhotoBtn}
                      onClick={() => onToggleFavorite(photo.id)}
                      aria-label={
                        photo.isFavorite
                          ? `Remover ${photo.destinationName} dos favoritos`
                          : `Marcar foto de ${photo.destinationName} como favorita`
                      }
                      title={photo.isFavorite ? 'Foto favorita' : 'Marcar favorita'}
                    >
                      {photo.isFavorite ? '⭐' : '☆'}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    className={styles.deletePhotoBtn}
                    onClick={() => setPhotoPendingDelete(photo)}
                    aria-label={`Remover foto de ${photo.destinationName}`}
                    title="Excluir foto"
                  >
                    ✕
                  </button>

                  <div className={styles.photoMeta}>
                    <p className={styles.destName}>
                      {photo.destinationName}{' '}
                      <span className={styles.stateCode}>({photo.stateCode})</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Child Confirmation Dialog Overlay */}
        {photoPendingDelete && (
          <div
            className={styles.confirmOverlay}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
          >
            <div className={styles.confirmCard}>
              <span className={styles.confirmIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3 id="confirm-delete-title" className={styles.confirmTitle}>
                Confirmar Exclusão
              </h3>
              <p className={styles.confirmText}>
                Tem certeza de que deseja remover esta foto de{' '}
                <strong>{photoPendingDelete.destinationName}</strong>?
              </p>
              <img
                src={photoPendingDelete.imageUrl}
                alt="Prévia da foto a ser excluída"
                className={styles.confirmPreviewImg}
              />
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.cancelConfirmBtn}
                  onClick={() => setPhotoPendingDelete(null)}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.deleteConfirmBtn}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Removendo...' : 'Excluir Foto'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
