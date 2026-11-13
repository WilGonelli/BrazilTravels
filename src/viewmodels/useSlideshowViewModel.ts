import { useState, useEffect, useCallback } from 'react';
import { TravelPhoto } from '../models/TravelPhoto';
import { StorageService } from '../services/StorageService';
import { LocalStorageService } from '../services/LocalStorageService';

export interface SlideshowState {
  readonly photos: readonly TravelPhoto[];
  readonly activeIndex: number;
  readonly activePhoto: TravelPhoto | null;
  readonly isPlaying: boolean;
  readonly intervalMs: number;
}

export interface SlideshowActions {
  readonly handleNext: () => void;
  readonly handlePrevious: () => void;
  readonly handleSelectIndex: (index: number) => void;
  readonly handleTogglePlayPause: () => void;
  readonly handleAddPhoto: (photo: TravelPhoto) => void;
  readonly handleAddPhotos: (photos: TravelPhoto[]) => void;
}

export interface SlideshowViewModelContract {
  readonly state: SlideshowState;
  readonly actions: SlideshowActions;
}

const defaultStorage: StorageService = new LocalStorageService();

/**
 * ViewModel managing the photo presentation slideshow.
 */
export function useSlideshowViewModel(
  storage: StorageService = defaultStorage,
  intervalMs: number = 15000
): SlideshowViewModelContract {
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

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
        if (isMounted && stored.length > 0) {
          setPhotos((prev) => {
            if (stored.length !== prev.length || stored[0]?.id !== prev[0]?.id) {
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

  const handleAddPhoto = useCallback((photo: TravelPhoto) => {
    setPhotos((prev) => [photo, ...prev]);
    setActiveIndex(0);
  }, []);

  const handleAddPhotos = useCallback((newPhotos: TravelPhoto[]) => {
    if (newPhotos.length === 0) return;
    setPhotos((prev) => [...newPhotos, ...prev]);
    setActiveIndex(0);
  }, []);

  const activePhoto = photos[activeIndex] || null;

  return {
    state: {
      photos,
      activeIndex,
      activePhoto,
      isPlaying,
      intervalMs,
    },
    actions: {
      handleNext,
      handlePrevious,
      handleSelectIndex,
      handleTogglePlayPause,
      handleAddPhoto,
      handleAddPhotos,
    },
  };
}
