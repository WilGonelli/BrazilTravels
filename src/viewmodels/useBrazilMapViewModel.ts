import { useState, useEffect, useMemo, useCallback } from 'react';
import { Destination, BrazilStateCode } from '../models/Destination';
import { createInitialDestinations } from '../models/brazilDestinationsSeed';
import { StorageService } from '../services/StorageService';
import { createDefaultStorageService } from '../services/StorageFactory';
import { TravelPhoto } from '../models/TravelPhoto';
import { Achievement, calculateAchievements } from '../models/Achievement';

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
  readonly raffleNotification: string | null;
  readonly achievements: readonly Achievement[];
  readonly unlockedAchievementsCount: number;
  readonly totalAchievementsCount: number;
  readonly isAchievementsModalOpen: boolean;
  readonly isRemoteModalOpen: boolean;
}

export interface BrazilMapActions {
  readonly handleSelectState: (stateCode: BrazilStateCode | null) => void;
  readonly handleRequestUnlock: (destination: Destination) => void;
  readonly handleConfirmUnlock: () => Promise<void>;
  readonly handleCancelUnlock: () => void;
  readonly handleOpenPhotoUpload: (destination: Destination) => void;
  readonly handleClosePhotoUpload: () => void;
  readonly handleSavePhoto: (
    destinationId: string,
    photoDataUrl: string,
    caption?: string,
    travelDate?: string
  ) => Promise<void>;
  readonly handleSavePhotos: (
    destinationId: string,
    photoDataUrls: string[],
    caption?: string,
    travelDate?: string
  ) => Promise<void>;
  readonly handleSearchChange: (query: string) => void;
  readonly handleClearSearch: () => void;
  readonly handleSelectSearchResult: (destination: Destination) => void;
  readonly handlePickRandomDestination: () => Destination | null;
  readonly handleDismissRaffleNotification: () => void;
  readonly handleOpenAchievements: () => void;
  readonly handleCloseAchievements: () => void;
  readonly handleOpenRemoteModal: () => void;
  readonly handleCloseRemoteModal: () => void;
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
 * Custom ViewModel hook orchestrating map state, dynamic sidebars, destination raffles, achievements, and cascading unlock rules.
 */
export function useBrazilMapViewModel(
  storage: StorageService = defaultStorage,
  onPhotoSaved?: (photo: TravelPhoto) => void,
  onPhotosSaved?: (photos: TravelPhoto[]) => void
): BrazilMapViewModelContract {
  const [destinations, setDestinations] = useState<Record<string, Destination>>(() =>
    createInitialDestinations()
  );
  const [selectedStateCode, setSelectedStateCode] = useState<BrazilStateCode | null>(null);
  const [pendingDestination, setPendingDestination] = useState<Destination | null>(null);
  const [targetPhotoDestination, setTargetPhotoDestination] = useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [raffleNotification, setRaffleNotification] = useState<string | null>(null);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState<boolean>(false);
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState<boolean>(false);
  const [loadedPhotos, setLoadedPhotos] = useState<TravelPhoto[]>([]);

  // Initialize and load saved state from storage
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [unlockedIds, photos] = await Promise.all([
          storage.getUnlockedDestinationIds(),
          storage.getTravelPhotos(),
        ]);
        if (isMounted) {
          setDestinations(createInitialDestinations(unlockedIds));
          setLoadedPhotos(photos);
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
    const pointsPercentage =
      totalPoints > 0 ? Number(((unlockedPoints / totalPoints) * 100).toFixed(2)) : 0;

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
      return all.filter((d) => d.stateCode === selectedStateCode && d.category !== 'State');
    }

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

  // Derived state: Calculated traveler achievements
  const achievements = useMemo(() => {
    return calculateAchievements(destinations, loadedPhotos);
  }, [destinations, loadedPhotos]);

  const unlockedAchievementsCount = useMemo(() => {
    return achievements.filter((a) => a.isUnlocked).length;
  }, [achievements]);

  const totalAchievementsCount = achievements.length;

  // Actions
  const handleSelectState = useCallback((stateCode: BrazilStateCode | null) => {
    setSelectedStateCode((prev) => (prev === stateCode ? null : stateCode));
    setRaffleNotification(null);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleSelectSearchResult = useCallback(
    (destination: Destination) => {
      setSelectedStateCode(destination.stateCode);
      setPendingDestination(destination);
      setSearchQuery('');
      setRaffleNotification(null);
    },
    []
  );

  /**
   * Randomly raffles an unvisited destination.
   * If a state is selected, raffles an unvisited destination from that state.
   * If no state is selected, raffles an unvisited destination from anywhere in Brazil.
   * Strictly excludes all already visited (unlocked) destinations.
   */
  const handlePickRandomDestination = useCallback((): Destination | null => {
    const all = Object.values(destinations);
    const candidates = all.filter((d) => {
      if (d.category === 'State') return false;
      if (d.isUnlocked) return false;
      if (selectedStateCode !== null) {
        return d.stateCode === selectedStateCode;
      }
      return true;
    });

    if (candidates.length === 0) {
      if (selectedStateCode !== null) {
        setRaffleNotification(
          `Todos os destinos de ${selectedStateCode} já foram visitados! Selecione outro estado ou desmarque o filtro para sortear pelo Brasil todo.`
        );
      } else {
        setRaffleNotification(
          'Parabéns! Todos os destinos turísticos cadastrados no Brasil já foram visitados!'
        );
      }
      return null;
    }

    const randomChoice = candidates[Math.floor(Math.random() * candidates.length)];
    setRaffleNotification(null);

    // If no state was selected, select the state of the drawn destination so the user sees it in context
    if (selectedStateCode === null) {
      setSelectedStateCode(randomChoice.stateCode);
    }

    // Open unlock confirmation modal for the chosen destination
    setPendingDestination(randomChoice);
    return randomChoice;
  }, [destinations, selectedStateCode]);

  const handleDismissRaffleNotification = useCallback(() => {
    setRaffleNotification(null);
  }, []);

  const handleRequestUnlock = useCallback((destination: Destination) => {
    setPendingDestination(destination);
    setRaffleNotification(null);
  }, []);

  const handleCancelUnlock = useCallback(() => {
    setPendingDestination(null);
  }, []);

  /**
   * Confirms unlocking of pending destination. Cascades to state root automatically if not unlocked.
   */
  const handleConfirmUnlock = useCallback(async () => {
    if (!pendingDestination) return;

    const target = pendingDestination;
    const nowIso = new Date().toISOString();
    const idsToSave: string[] = [target.id];

    setDestinations((prev) => {
      const next = { ...prev };

      // Unlock targeted item
      next[target.id] = {
        ...target,
        isUnlocked: true,
        unlockedAt: nowIso,
      };

      // Cascade unlock: If unlocking a point destination (Beach, Waterfall, etc.),
      // automatically unlock its corresponding federative unit root state if still locked
      if (target.category !== 'State') {
        const stateRootId = `state-${target.stateCode}`;
        const parentState = next[stateRootId];
        if (parentState && !parentState.isUnlocked) {
          next[stateRootId] = {
            ...parentState,
            isUnlocked: true,
            unlockedAt: nowIso,
          };
          idsToSave.push(stateRootId);
        }
      }

      return next;
    });

    setPendingDestination(null);

    // Asynchronously synchronize with persistent storage layer
    try {
      await storage.saveUnlockedDestinationIds(idsToSave);
    } catch (err) {
      console.error('Failed to persist unlocked destinations:', err);
    }
  }, [pendingDestination, storage]);

  const handleOpenPhotoUpload = useCallback((destination: Destination) => {
    setTargetPhotoDestination(destination);
    setPendingDestination(null);
    setRaffleNotification(null);
  }, []);

  const handleClosePhotoUpload = useCallback(() => {
    setTargetPhotoDestination(null);
  }, []);

  const handleSavePhotos = useCallback(
    async (
      destinationId: string,
      photoDataUrls: string[],
      caption?: string,
      travelDate?: string
    ) => {
      if (photoDataUrls.length === 0) return;

      const createdPhotos: TravelPhoto[] = [];

      for (const photoUrl of photoDataUrls) {
        const targetDest = destinations[destinationId];
        const newPhoto: TravelPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          destinationId,
          destinationName: targetDest?.name || destinationId,
          stateCode: targetDest?.stateCode || '',
          imageUrl: photoUrl,
          caption: caption?.trim() || undefined,
          travelDate: travelDate || undefined,
          createdAt: new Date().toISOString(),
        };

        try {
          await storage.saveTravelPhoto(newPhoto);
          createdPhotos.push(newPhoto);
        } catch (err) {
          console.error('Failed to save travel photo:', err);
        }
      }

      setDestinations((prev) => {
        const target = prev[destinationId];
        if (!target) return prev;
        const currentUrls = target.photoUrls;
        const newUrls = createdPhotos.map((p) => p.imageUrl);
        return {
          ...prev,
          [destinationId]: {
            ...target,
            photoUrls: [...currentUrls, ...newUrls],
          },
        };
      });

      setLoadedPhotos((prev) => [...prev, ...createdPhotos]);

      if (createdPhotos.length > 0) {
        if (onPhotosSaved) {
          onPhotosSaved(createdPhotos);
        } else if (onPhotoSaved) {
          createdPhotos.forEach((p) => onPhotoSaved(p));
        }
      }

      setTargetPhotoDestination(null);
    },
    [destinations, storage, onPhotoSaved, onPhotosSaved]
  );

  const handleSavePhoto = useCallback(
    async (
      destinationId: string,
      photoDataUrl: string,
      caption?: string,
      travelDate?: string
    ) => {
      await handleSavePhotos(destinationId, [photoDataUrl], caption, travelDate);
    },
    [handleSavePhotos]
  );

  const handleOpenAchievements = useCallback(() => {
    setIsAchievementsModalOpen(true);
  }, []);

  const handleCloseAchievements = useCallback(() => {
    setIsAchievementsModalOpen(false);
  }, []);

  const handleOpenRemoteModal = useCallback(() => {
    setIsRemoteModalOpen(true);
  }, []);

  const handleCloseRemoteModal = useCallback(() => {
    setIsRemoteModalOpen(false);
  }, []);

  const handleResetAll = useCallback(async () => {
    await storage.resetAll();
    setDestinations(createInitialDestinations());
    setLoadedPhotos([]);
    setSelectedStateCode(null);
    setRaffleNotification(null);
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
      raffleNotification,
      achievements,
      unlockedAchievementsCount,
      totalAchievementsCount,
      isAchievementsModalOpen,
      isRemoteModalOpen,
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
      handlePickRandomDestination,
      handleDismissRaffleNotification,
      handleOpenAchievements,
      handleCloseAchievements,
      handleOpenRemoteModal,
      handleCloseRemoteModal,
      handleResetAll,
    },
  };
}
