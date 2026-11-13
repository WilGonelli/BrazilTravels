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
  intervalMs: number = 6000
): SlideshowViewModelContract {
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Load photos on mount
  useEffect(() => {
    let isMounted = true;
    async function loadPhotos() {
      const stored = await storage.getTravelPhotos();
      if (isMounted) {
        setPhotos(stored);
      }
    }
    loadPhotos();
    return () => {
      isMounted = false;
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
    },
  };
}
