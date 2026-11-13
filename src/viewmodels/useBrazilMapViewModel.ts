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
  readonly unlockedPointsCount: number;
  readonly totalPointsCount: number;
  readonly pointsProgressPercentage: number;
  readonly searchQuery: string;
  readonly searchResults: readonly Destination[];
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
  readonly handleSearchChange: (query: string) => void;
  readonly handleClearSearch: () => void;
  readonly handleSelectSearchResult: (destination: Destination) => void;
  readonly handleResetAll: () => Promise<void>;
}

export interface BrazilMapViewModelContract {
  readonly state: BrazilMapState;
  readonly actions: BrazilMapActions;
}

const defaultStorage: StorageService = createDefaultStorageService();

/**
 * Normalizes text by removing diacritics / accents and converting to lower case for resilient search matching.
 */
function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

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
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  // Derived state: calculate total progress for states and destination points
  const {
    unlockedStatesCount,
    totalStatesCount,
    progressPercentage,
    unlockedPointsCount,
    totalPointsCount,
    pointsProgressPercentage,
  } = useMemo(() => {
    const all = Object.values(destinations);
    const states = all.filter((d) => d.category === 'State');
    const points = all.filter((d) => d.category !== 'State');

    const unlockedStates = states.filter((d) => d.isUnlocked).length;
    const totalStates = states.length || 27;
    const statesPercentage = Math.round((unlockedStates / totalStates) * 100);

    const unlockedPoints = points.filter((d) => d.isUnlocked).length;
    const totalPoints = points.length;
    const pointsPercentage = totalPoints > 0 ? Number(((unlockedPoints / totalPoints) * 100).toFixed(2)) : 0;

    return {
      unlockedStatesCount: unlockedStates,
      totalStatesCount: totalStates,
      progressPercentage: statesPercentage,
      unlockedPointsCount: unlockedPoints,
      totalPointsCount: totalPoints,
      pointsProgressPercentage: pointsPercentage,
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

  // Derived state: Quick destination search results with accent-insensitive fuzzy matching
  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery.trim());
    if (normalizedQuery.length < 2) return [];

    const all = Object.values(destinations);
    return all
      .filter((d) => {
        if (d.category === 'State') return false;
        const normalizedName = normalizeSearchText(d.name);
        const normalizedState = normalizeSearchText(d.stateCode);
        return normalizedName.includes(normalizedQuery) || normalizedState === normalizedQuery;
      })
      .slice(0, 8);
  }, [destinations, searchQuery]);

  // Actions
  const handleSelectState = useCallback((stateCode: BrazilStateCode | null) => {
    setSelectedStateCode((prev) => (prev === stateCode ? null : stateCode));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleRequestUnlock = useCallback((destination: Destination) => {
    setPendingDestination(destination);
  }, []);

  const handleSelectSearchResult = useCallback((destination: Destination) => {
    setSearchQuery('');
    // Automatically select the state of the destination
    setSelectedStateCode(destination.stateCode);

    if (!destination.isUnlocked) {
      setPendingDestination(destination);
    }
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
      unlockedPointsCount,
      totalPointsCount,
      pointsProgressPercentage,
      searchQuery,
      searchResults,
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
      handleSearchChange,
      handleClearSearch,
      handleSelectSearchResult,
      handleResetAll,
    },
  };
}
