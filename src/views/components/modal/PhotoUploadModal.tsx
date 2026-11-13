import React, { useState, useRef, useEffect } from 'react';
import styles from './PhotoUploadModal.module.css';
import { Destination } from '../../../models/Destination';

interface PhotoUploadModalProps {
  readonly isOpen: boolean;
  readonly destination: Destination | null;
  readonly onSave: (destinationId: string, photoDataUrl: string, caption?: string) => void;
  readonly onClose: () => void;
}

/**
 * Accessible photo upload modal triggered via '+' button on unlocked destinations.
 */
export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  destination,
  onSave,
  onClose,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPhoto(null);
      setCaption('');
    }
  }, [isOpen]);

  if (!isOpen || !destination) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (typeof rawDataUrl !== 'string') return;

      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 1280;
        let { width, height } = img;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setSelectedPhoto(optimizedDataUrl);
        } else {
          setSelectedPhoto(rawDataUrl);
        }
      };
      img.onerror = () => {
        setSelectedPhoto(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!selectedPhoto) return;
    onSave(destination.id, selectedPhoto, caption.trim() || undefined);
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.modalBox}
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <span className={styles.headerTitle}>Adicionar Memória de Viagem</span>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar janela">
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          <h2 id="photo-modal-title" className={styles.destTitle}>
            {destination.name} ({destination.stateCode})
          </h2>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
            id="photo-file-upload"
          />

          {selectedPhoto ? (
            <div className={styles.previewWrapper}>
              <img src={selectedPhoto} alt="Prévia da foto selecionada" className={styles.previewImg} />
            </div>
          ) : (
            <label htmlFor="photo-file-upload" className={styles.dropzone}>
              <span className={styles.dropzoneIcon} aria-hidden="true">
                📷
              </span>
              <span className={styles.dropzoneText}>Clique para selecionar uma foto da viagem</span>
              <span className={styles.dropzoneSub}>Formatos: JPG, PNG, WEBP (será exibida no Slideshow)</span>
            </label>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="caption-input" className={styles.label}>
              Legenda ou data da viagem (opcional):
            </label>
            <input
              id="caption-input"
              type="text"
              placeholder="Ex: Viagem de férias em Outubro/2026"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={styles.textInput}
            />
          </div>
        </div>

        <footer className={styles.modalActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={handleSave}
            disabled={!selectedPhoto}
          >
            Salvar Foto no Slideshow
          </button>
        </footer>
      </div>
    </div>
  );
};
