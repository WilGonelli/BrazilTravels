import { useState, useEffect, useMemo, useCallback } from 'react';
import { Destination, BrazilStateCode } from '../models/Destination';
import { createInitialDestinations } from '../models/brazilDestinationsSeed';
import { StorageService } from '../services/StorageService';
import { createDefaultStorageService } from '../services/StorageFactory';
import { TravelPhoto } from '../models/TravelPhoto';

export interface BrazilMapState {
  readonly destinations: Record<string, Destination>;
  readonly selectedStateCode: BrazilStateCode | null;
  readonly displayedDestinations: readonly Destination[];
  readonly unlockedStatesCount: number;
  readonly totalStatesCount: number;
  readonly progressPercentage: number;
  readonly isUnlockModalOpen: boolean;
  readonly pendingDestination: Destination | null;
  readonly isPhotoModalOpen: boolean;
  readonly targetPhotoDestination: Destination | null;
  readonly isLoading: boolean;
}

export interface BrazilMapActions {
  readonly handleSelectState: (stateCode: BrazilStateCode | null) => void;
  readonly handleRequestUnlock: (destination: Destination) => void;
  readonly handleConfirmUnlock: () => Promise<void>;
  readonly handleCancelUnlock: () => void;
  readonly handleOpenPhotoUpload: (destination: Destination) => void;
  readonly handleClosePhotoUpload: () => void;
  readonly handleSavePhoto: (destinationId: string, photoDataUrl: string, caption?: string) => Promise<void>;
  readonly handleSavePhotos: (destinationId: string, photoDataUrls: string[], caption?: string) => Promise<void>;
  readonly handleResetAll: () => Promise<void>;
}

export interface BrazilMapViewModelContract {
  readonly state: BrazilMapState;
  readonly actions: BrazilMapActions;
}

const defaultStorage: StorageService = createDefaultStorageService();

/**
 * Custom ViewModel hook orchestrating map state, dynamic sidebars, and cascading unlock rules.
 */
export function useBrazilMapViewModel(
  storage: StorageService = defaultStorage,
  onPhotoSaved?: (photo: TravelPhoto) => void,
  onPhotosSaved?: (photos: TravelPhoto[]) => void
): BrazilMapViewModelContract {
  const [destinations, setDestinations] = useState<Record<string, Destination>>(() => createInitialDestinations());
  const [selectedStateCode, setSelectedStateCode] = useState<BrazilStateCode | null>(null);
  const [pendingDestination, setPendingDestination] = useState<Destination | null>(null);
  const [targetPhotoDestination, setTargetPhotoDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load saved state from storage
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const unlockedIds = await storage.getUnlockedDestinationIds();
        if (isMounted) {
          setDestinations(createInitialDestinations(unlockedIds));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load initial destination state:', err);
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [storage]);

  // Derived state: calculate total unlocked states count (out of 27)
  const { unlockedStatesCount, totalStatesCount, progressPercentage } = useMemo(() => {
    const states = Object.values(destinations).filter((d) => d.category === 'State');
    const unlocked = states.filter((d) => d.isUnlocked).length;
    const total = states.length || 27;
    const percentage = Math.round((unlocked / total) * 100);
    return {
      unlockedStatesCount: unlocked,
      totalStatesCount: total,
      progressPercentage: percentage,
    };
  }, [destinations]);

  // Derived state: Dynamic sidebars content based on user specification:
  // - When NO state is selected (null): show ALL destinations that are already unlocked
  // - When a state IS selected: filter and show all points belonging to that state (both locked and unlocked)
  const displayedDestinations = useMemo(() => {
    const all = Object.values(destinations);

    if (selectedStateCode !== null) {
      // Filter points belonging to selected state (excluding the state item itself from lists)
      return all.filter((d) => d.stateCode === selectedStateCode && d.category !== 'State');
    }

    // Default global view: show all destinations that have already been unlocked
    return all.filter((d) => d.isUnlocked && d.category !== 'State');
  }, [destinations, selectedStateCode]);

  // Actions
  const handleSelectState = useCallback((stateCode: BrazilStateCode | null) => {
    setSelectedStateCode((prev) => (prev === stateCode ? null : stateCode));
  }, []);

  const handleRequestUnlock = useCallback((destination: Destination) => {
    setPendingDestination(destination);
  }, []);

  const handleCancelUnlock = useCallback(() => {
    setPendingDestination(null);
  }, []);

  const handleConfirmUnlock = useCallback(async () => {
    if (!pendingDestination || pendingDestination.isUnlocked) {
      setPendingDestination(null);
      return;
    }

    const destId = pendingDestination.id;
    const parentStateId = `state-${pendingDestination.stateCode}`;

    // Cascading unlock: unlocking any point unlocks the point AND its parent state!
    setDestinations((prev) => {
      const updated = { ...prev };
      if (updated[destId]) {
        updated[destId] = { ...updated[destId], isUnlocked: true, unlockedAt: new Date().toISOString() };
      }
      if (updated[parentStateId]) {
        updated[parentStateId] = { ...updated[parentStateId], isUnlocked: true, unlockedAt: new Date().toISOString() };
      }
      return updated;
    });

    setPendingDestination(null);

    // Save to persistent storage atomically
    const idsToSave = Array.from(new Set([destId, parentStateId]));
    await storage.saveUnlockedDestinationIds(idsToSave);
  }, [pendingDestination, storage]);

  const handleOpenPhotoUpload = useCallback((destination: Destination) => {
    if (!destination.isUnlocked) return;
    setTargetPhotoDestination(destination);
  }, []);

  const handleClosePhotoUpload = useCallback(() => {
    setTargetPhotoDestination(null);
  }, []);

  const handleSavePhotos = useCallback(
    async (destinationId: string, photoDataUrls: string[], caption?: string) => {
      const dest = destinations[destinationId];
      if (!dest || photoDataUrls.length === 0) return;

      const newPhotos: TravelPhoto[] = photoDataUrls.map((url, index) => ({
        id: `photo-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        destinationId,
        destinationName: dest.name,
        stateCode: dest.stateCode,
        imageUrl: url,
        caption,
        createdAt: new Date().toISOString(),
      }));

      // Update destination photo references
      setDestinations((prev) => {
        const current = prev[destinationId];
        if (!current) return prev;
        return {
          ...prev,
          [destinationId]: {
            ...current,
            photoUrls: [...photoDataUrls, ...current.photoUrls],
          },
        };
      });

      for (const photo of newPhotos) {
        await storage.saveTravelPhoto(photo);
      }

      if (onPhotosSaved) {
        onPhotosSaved(newPhotos);
      } else if (onPhotoSaved) {
        newPhotos.forEach((p) => onPhotoSaved(p));
      }

      setTargetPhotoDestination(null);
    },
    [destinations, storage, onPhotoSaved, onPhotosSaved]
  );

  const handleSavePhoto = useCallback(
    async (destinationId: string, photoDataUrl: string, caption?: string) => {
      await handleSavePhotos(destinationId, [photoDataUrl], caption);
    },
    [handleSavePhotos]
  );

  const handleResetAll = useCallback(async () => {
    await storage.resetAll();
    setDestinations(createInitialDestinations());
    setSelectedStateCode(null);
  }, [storage]);

  return {
    state: {
      destinations,
      selectedStateCode,
      displayedDestinations,
      unlockedStatesCount,
      totalStatesCount,
      progressPercentage,
      isUnlockModalOpen: pendingDestination !== null,
      pendingDestination,
      isPhotoModalOpen: targetPhotoDestination !== null,
      targetPhotoDestination,
      isLoading,
    },
    actions: {
      handleSelectState,
      handleRequestUnlock,
      handleConfirmUnlock,
      handleCancelUnlock,
      handleOpenPhotoUpload,
      handleClosePhotoUpload,
      handleSavePhoto,
      handleSavePhotos,
      handleResetAll,
    },
  };
}
