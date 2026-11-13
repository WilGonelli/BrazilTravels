import { useState, useEffect, useCallback, useMemo } from 'react';
import { TravelPhoto } from '../models/TravelPhoto';
import { StorageService } from '../services/StorageService';
import { LocalStorageService } from '../services/LocalStorageService';

export type KenBurnsVariant = 'zoom-in' | 'pan-left' | 'pan-right' | 'zoom-out';

export interface SlideshowState {
  readonly photos: readonly TravelPhoto[];
  readonly activeIndex: number;
  readonly activePhoto: TravelPhoto | null;
  readonly isPlaying: boolean;
  readonly intervalMs: number;
  readonly isGalleryOpen: boolean;
  readonly kenBurnsVariant: KenBurnsVariant;
  readonly activeDestinationPhotos: readonly TravelPhoto[];
  readonly destinationPhotoIndex: number;
}

export interface SlideshowActions {
  readonly handleNext: () => void;
  readonly handlePrevious: () => void;
  readonly handleSelectIndex: (index: number) => void;
  readonly handleNextDestinationPhoto: () => void;
  readonly handlePreviousDestinationPhoto: () => void;
  readonly handleJumpToDestinationPhoto: (index: number) => void;
  readonly handleTogglePlayPause: () => void;
  readonly handleToggleFavorite: (photoId: string) => Promise<void>;
  readonly handleAddPhoto: (photo: TravelPhoto) => void;
  readonly handleAddPhotos: (photos: TravelPhoto[]) => void;
  readonly handleOpenGallery: () => void;
  readonly handleCloseGallery: () => void;
  readonly handleDeletePhoto: (photoId: string) => Promise<void>;
}

export interface SlideshowViewModelContract {
  readonly state: SlideshowState;
  readonly actions: SlideshowActions;
}

const defaultStorage: StorageService = new LocalStorageService();

const KEN_BURNS_VARIANTS: readonly KenBurnsVariant[] = [
  'zoom-in',
  'pan-left',
  'pan-right',
  'zoom-out',
];

/**
 * ViewModel managing the photo presentation slideshow, Ken Burns animations, and destination carousels.
 */
export function useSlideshowViewModel(
  storage: StorageService = defaultStorage,
  intervalMs: number = 10000,
  onPhotoDeleted?: (photoId: string) => void
): SlideshowViewModelContract {
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // Load photos on mount
  useEffect(() => {
    let isMounted = true;
    async function loadPhotos() {
      try {
        const stored = await storage.getTravelPhotos();
        if (isMounted) {
          setPhotos(stored);
        }
      } catch (err) {
        console.warn('Failed to load photos:', err);
      }
    }
    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, [storage]);

  // Periodic background photo sync so kiosk picks up photos uploaded from other devices
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const stored = await storage.getTravelPhotos();
        if (isMounted) {
          setPhotos((prev) => {
            if (
              stored.length !== prev.length ||
              (stored.length > 0 && stored[0]?.id !== prev[0]?.id)
            ) {
              return stored;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Background photo poll failed:', err);
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [storage]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || photos.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % photos.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, photos.length, intervalMs]);

  const handleNext = useCallback(() => {
    if (photos.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const handlePrevious = useCallback(() => {
    if (photos.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < photos.length) {
        setActiveIndex(index);
      }
    },
    [photos.length]
  );

  const handleTogglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const activePhoto = photos[activeIndex] || null;

  // Destination-specific carousel photos
  const activeDestinationPhotos = useMemo(() => {
    if (!activePhoto) return [];
    return photos.filter((p) => p.destinationId === activePhoto.destinationId);
  }, [photos, activePhoto]);

  const destinationPhotoIndex = useMemo(() => {
    if (!activePhoto || activeDestinationPhotos.length === 0) return 0;
    const idx = activeDestinationPhotos.findIndex((p) => p.id === activePhoto.id);
    return idx >= 0 ? idx : 0;
  }, [activePhoto, activeDestinationPhotos]);

  const handleNextDestinationPhoto = useCallback(() => {
    if (activeDestinationPhotos.length <= 1) return;
    const nextDestIdx = (destinationPhotoIndex + 1) % activeDestinationPhotos.length;
    const targetPhoto = activeDestinationPhotos[nextDestIdx];
    const globalIdx = photos.findIndex((p) => p.id === targetPhoto.id);
    if (globalIdx >= 0) {
      setActiveIndex(globalIdx);
    }
  }, [activeDestinationPhotos, destinationPhotoIndex, photos]);

  const handlePreviousDestinationPhoto = useCallback(() => {
    if (activeDestinationPhotos.length <= 1) return;
    const prevDestIdx =
      (destinationPhotoIndex - 1 + activeDestinationPhotos.length) %
      activeDestinationPhotos.length;
    const targetPhoto = activeDestinationPhotos[prevDestIdx];
    const globalIdx = photos.findIndex((p) => p.id === targetPhoto.id);
    if (globalIdx >= 0) {
      setActiveIndex(globalIdx);
    }
  }, [activeDestinationPhotos, destinationPhotoIndex, photos]);

  const handleJumpToDestinationPhoto = useCallback(
    (index: number) => {
      if (index >= 0 && index < activeDestinationPhotos.length) {
        const targetPhoto = activeDestinationPhotos[index];
        const globalIdx = photos.findIndex((p) => p.id === targetPhoto.id);
        if (globalIdx >= 0) {
          setActiveIndex(globalIdx);
        }
      }
    },
    [activeDestinationPhotos, photos]
  );

  const handleToggleFavorite = useCallback(
    async (photoId: string) => {
      const target = photos.find((p) => p.id === photoId);
      if (!target) return;

      const updatedPhoto: TravelPhoto = {
        ...target,
        isFavorite: !target.isFavorite,
      };

      setPhotos((prev) => prev.map((p) => (p.id === photoId ? updatedPhoto : p)));
      await storage.updateTravelPhoto(updatedPhoto);
    },
    [photos, storage]
  );

  const handleAddPhoto = useCallback((photo: TravelPhoto) => {
    setPhotos((prev) => [photo, ...prev]);
    setActiveIndex(0);
  }, []);

  const handleAddPhotos = useCallback((newPhotos: TravelPhoto[]) => {
    if (newPhotos.length === 0) return;
    setPhotos((prev) => [...newPhotos, ...prev]);
    setActiveIndex(0);
  }, []);

  const handleOpenGallery = useCallback(() => {
    setIsGalleryOpen(true);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      await storage.deleteTravelPhoto(photoId);

      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== photoId);
        return updated;
      });

      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));

      if (onPhotoDeleted) {
        onPhotoDeleted(photoId);
      }
    },
    [storage, onPhotoDeleted]
  );

  // Listen to remote control commands broadcast from other browser tabs or mobile
  useEffect(() => {
    function handleRemoteEvent(e: Event) {
      const customEvent = e as CustomEvent<{ action: string; payload?: unknown }>;
      const action = customEvent.detail?.action;
      if (action === 'NEXT') handleNext();
      else if (action === 'PREV') handlePrevious();
      else if (action === 'PLAY_PAUSE') handleTogglePlayPause();
      else if (action === 'OPEN_GALLERY') handleOpenGallery();
    }

    function handleStorageRemote(e: StorageEvent) {
      if (e.key === 'brazil_travels_remote_cmd' && e.newValue) {
        try {
          const cmd = JSON.parse(e.newValue);
          if (cmd.action === 'NEXT') handleNext();
          else if (cmd.action === 'PREV') handlePrevious();
          else if (cmd.action === 'PLAY_PAUSE') handleTogglePlayPause();
        } catch {
          // Ignore invalid command
        }
      }
    }

    window.addEventListener('brazil_travels_remote', handleRemoteEvent);
    window.addEventListener('storage', handleStorageRemote);
    return () => {
      window.removeEventListener('brazil_travels_remote', handleRemoteEvent);
      window.removeEventListener('storage', handleStorageRemote);
    };
  }, [handleNext, handlePrevious, handleTogglePlayPause, handleOpenGallery]);

  const kenBurnsVariant: KenBurnsVariant =
    KEN_BURNS_VARIANTS[activeIndex % KEN_BURNS_VARIANTS.length] || 'zoom-in';

  return {
    state: {
      photos,
      activeIndex,
      activePhoto,
      isPlaying,
      intervalMs,
      isGalleryOpen,
      kenBurnsVariant,
      activeDestinationPhotos,
      destinationPhotoIndex,
    },
    actions: {
      handleNext,
      handlePrevious,
      handleSelectIndex,
      handleNextDestinationPhoto,
      handlePreviousDestinationPhoto,
      handleJumpToDestinationPhoto,
      handleTogglePlayPause,
      handleToggleFavorite,
      handleAddPhoto,
      handleAddPhotos,
      handleOpenGallery,
      handleCloseGallery,
      handleDeletePhoto,
    },
  };
}
