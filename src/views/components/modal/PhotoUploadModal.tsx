import React, { useState, useRef, useEffect } from 'react';
import styles from './PhotoUploadModal.module.css';
import { Destination } from '../../../models/Destination';

interface PhotoUploadModalProps {
  readonly isOpen: boolean;
  readonly destination: Destination | null;
  readonly onSave: (destinationId: string, photoDataUrls: string[], caption?: string) => void;
  readonly onClose: () => void;
}

/**
 * Resize and compress an image file client-side using HTMLCanvas.
 * Ensures images fit safely in memory and upload with high speed and zero distortion.
 */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result;
      if (typeof rawDataUrl !== 'string') {
        resolve('');
        return;
      }

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
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Accessible photo upload modal supporting single or multiple photo selection.
 */
export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  destination,
  onSave,
  onClose,
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPhotos([]);
      setCaption('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !destination) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      const resizedList = await Promise.all(files.map(resizeImage));
      const valid = resizedList.filter(Boolean);
      setSelectedPhotos((prev) => [...prev, ...valid]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setSelectedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    if (selectedPhotos.length === 0) return;
    onSave(destination.id, selectedPhotos, caption.trim() || undefined);
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
          <span className={styles.headerTitle}>Adicionar Memórias de Viagem</span>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar janela">
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.titleRow}>
            <h2 id="photo-modal-title" className={styles.destTitle}>
              {destination.name} ({destination.stateCode})
            </h2>
            {selectedPhotos.length > 0 && (
              <span className={styles.countBadge}>
                {selectedPhotos.length} {selectedPhotos.length === 1 ? 'foto' : 'fotos'}
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
            id="photo-file-upload"
          />

          {selectedPhotos.length > 0 ? (
            <div className={styles.galleryPreviewSection}>
              <div className={styles.previewGrid}>
                {selectedPhotos.map((photoUrl, idx) => (
                  <div key={idx} className={styles.previewThumbItem}>
                    <img src={photoUrl} alt={`Prévia ${idx + 1}`} className={styles.thumbImage} />
                    <button
                      type="button"
                      className={styles.removePhotoBtn}
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label={`Remover foto ${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={styles.addMoreBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
              >
                + Adicionar mais fotos
              </button>
            </div>
          ) : (
            <label htmlFor="photo-file-upload" className={styles.dropzone}>
              <span className={styles.dropzoneIcon} aria-hidden="true">
                📷
              </span>
              <span className={styles.dropzoneText}>
                {isProcessing ? 'Processando fotos...' : 'Clique para selecionar fotos da viagem'}
              </span>
              <span className={styles.dropzoneSub}>
                Você pode selecionar uma ou várias fotos ao mesmo tempo (JPG, PNG, WEBP)
              </span>
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
            disabled={selectedPhotos.length === 0 || isProcessing}
          >
            {selectedPhotos.length <= 1
              ? 'Salvar Foto no Slideshow'
              : `Salvar ${selectedPhotos.length} Fotos no Slideshow`}
          </button>
        </footer>
      </div>
    </div>
  );
};
