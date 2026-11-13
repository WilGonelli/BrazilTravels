import React, { useState, useEffect } from 'react';
import styles from './PhotoManagerModal.module.css';
import { TravelPhoto } from '../../../models/TravelPhoto';

interface PhotoManagerModalProps {
  readonly isOpen: boolean;
  readonly photos: readonly TravelPhoto[];
  readonly onClose: () => void;
  readonly onDeletePhoto: (photoId: string) => Promise<void>;
}

/**
 * Dedicated modal to manage and selectively remove travel photos.
 * Stays open after individual photo deletions so multiple photos can be removed in sequence.
 */
export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  photos,
  onClose,
  onDeletePhoto,
}) => {
  const [photoPendingDelete, setPhotoPendingDelete] = useState<TravelPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
            Clique no <strong>✕</strong> no canto superior de qualquer foto para excluí-la. Esta
            janela permanecerá aberta para que você possa remover várias fotos se desejar.
          </p>

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
          ) : (
            <div className={styles.photoGrid}>
              {photos.map((photo) => (
                <div key={photo.id} className={styles.photoItem}>
                  <img
                    src={photo.imageUrl}
                    alt={`Foto de ${photo.destinationName}`}
                    className={styles.thumbnail}
                    loading="lazy"
                  />
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
