import React, { useEffect, useState } from 'react';
import styles from './RemoteControlModal.module.css';

interface RemoteControlModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onNextPhoto: () => void;
  readonly onPrevPhoto: () => void;
  readonly onTogglePlayPause: () => void;
  readonly isPlaying: boolean;
  readonly onToggleRouteLine: () => void;
  readonly isRouteLineVisible: boolean;
  readonly onPickRandomDestination: () => void;
}

/**
 * Sends a remote control command across tabs/devices via localStorage event.
 */
function broadcastRemoteCommand(action: string) {
  try {
    localStorage.setItem(
      'brazil_travels_remote_cmd',
      JSON.stringify({ action, timestamp: Date.now() })
    );
  } catch {
    // Ignore storage quota
  }
}

/**
 * Accessible modal providing quick kiosk remote controls and mobile companion link.
 */
export const RemoteControlModal: React.FC<RemoteControlModalProps> = ({
  isOpen,
  onClose,
  onNextPhoto,
  onPrevPhoto,
  onTogglePlayPause,
  isPlaying,
  onToggleRouteLine,
  isRouteLineVisible,
  onPickRandomDestination,
}) => {
  const [deviceUrl, setDeviceUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    onNextPhoto();
    broadcastRemoteCommand('NEXT');
  };

  const handlePrev = () => {
    onPrevPhoto();
    broadcastRemoteCommand('PREV');
  };

  const handlePlayPause = () => {
    onTogglePlayPause();
    broadcastRemoteCommand('PLAY_PAUSE');
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remote-modal-title"
    >
      <div className={styles.modalCard}>
        <header className={styles.modalHeader}>
          <h2 id="remote-modal-title" className={styles.modalTitle}>
            📱 Controle Remoto & Acesso Móvel
          </h2>
          <button
            type="button"
            className={styles.closeModalBtn}
            onClick={onClose}
            aria-label="Fechar controle remoto"
          >
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          {/* Mobile connection guide */}
          <div className={styles.qrSection}>
            <h3 className={styles.qrTitle}>Acesse do seu Smartphone</h3>
            <p className={styles.qrDescription}>
              Conecte seu celular na mesma rede Wi-Fi e abra o endereço abaixo para enviar fotos e
              controlar o painel da TV:
            </p>
            <div className={styles.urlBadge}>{deviceUrl || 'http://192.168.1.16'}</div>
          </div>

          {/* Quick remote controls */}
          <div className={styles.controlsSection}>
            <h3 className={styles.controlsTitle}>Ações Rápidas do Painel</h3>
            <div className={styles.buttonGrid}>
              <button
                type="button"
                className={styles.remoteBtn}
                onClick={handlePrev}
                aria-label="Foto anterior"
              >
                <span className={styles.btnIcon} aria-hidden="true">
                  ⏮️
                </span>
                <span className={styles.btnLabel}>Foto Anterior</span>
              </button>

              <button
                type="button"
                className={styles.remoteBtn}
                onClick={handlePlayPause}
                aria-label={isPlaying ? 'Pausar apresentação' : 'Reproduzir apresentação'}
              >
                <span className={styles.btnIcon} aria-hidden="true">
                  {isPlaying ? '⏸️' : '▶️'}
                </span>
                <span className={styles.btnLabel}>
                  {isPlaying ? 'Pausar (10s)' : 'Reproduzir'}
                </span>
              </button>

              <button
                type="button"
                className={styles.remoteBtn}
                onClick={handleNext}
                aria-label="Próxima foto"
              >
                <span className={styles.btnIcon} aria-hidden="true">
                  ⏭️
                </span>
                <span className={styles.btnLabel}>Próxima Foto</span>
              </button>

              <button
                type="button"
                className={styles.remoteBtn}
                onClick={onToggleRouteLine}
                aria-label={
                  isRouteLineVisible
                    ? 'Ocultar linhas de viagem no mapa'
                    : 'Exibir linhas de viagem no mapa'
                }
              >
                <span className={styles.btnIcon} aria-hidden="true">
                  ✈️
                </span>
                <span className={styles.btnLabel}>
                  {isRouteLineVisible ? 'Rotas Ativas' : 'Rotas Ocultas'}
                </span>
              </button>

              <button
                type="button"
                className={styles.remoteBtn}
                onClick={onPickRandomDestination}
                aria-label="Sortear próximo destino para viajar"
              >
                <span className={styles.btnIcon} aria-hidden="true">
                  🎲
                </span>
                <span className={styles.btnLabel}>Sortear Destino</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
