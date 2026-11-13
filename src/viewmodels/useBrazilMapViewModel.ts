import { useState, useEffect, useMemo, useCallback } from 'react';
import { Destination, BrazilStateCode } from '../models/Destination';
import { createInitialDestinations } from '../models/brazilDestinationsSeed';
import { StorageService } from '../services/StorageService';
import { createDefaultStorageService } from '../services/StorageFactory';
import { TravelPhoto } from '../models/TravelPhoto';
import { Achievement, calculateAchievements } from '../models/Achievement';
import { BRAZIL_GEO_PATHS } from '../models/brazilGeoPaths';

export interface RoutePoint {
  readonly id: string;
  readonly name: string;
  readonly stateCode: string;
  readonly x: number;
  readonly y: number;
}

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
  readonly isRouteLineVisible: boolean;
  readonly travelRoutePoints: readonly RoutePoint[];
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
  readonly handleToggleRouteLine: () => void;
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
 * Custom ViewModel hook orchestrating map state, dynamic sidebars, routes, achievements, and cascading unlock rules.
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
  const [isRouteLineVisible, setIsRouteLineVisible] = useState<boolean>(true);
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

  // Derived state: Ordered travel route points for SVG flight/road connection path
  const travelRoutePoints = useMemo<readonly RoutePoint[]>(() => {
    const unlockedList = Object.values(destinations).filter((d) => d.isUnlocked);
    // Sort deterministically: items with photos first, then by name
    const sorted = [...unlockedList].sort((a, b) => {
      if (a.photoUrls.length > 0 && b.photoUrls.length === 0) return -1;
      if (b.photoUrls.length > 0 && a.photoUrls.length === 0) return 1;
      return a.name.localeCompare(b.name);
    });

    const points: RoutePoint[] = [];
    const usedPositions = new Set<string>();

    for (const d of sorted) {
      const geo = BRAZIL_GEO_PATHS[d.stateCode];
      if (!geo) continue;

      let { x, y } = geo.center;

      // Deterministic slight offset for point destinations to avoid exact overlap with state center
      if (d.category !== 'State') {
        const hash = d.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const offsetX = ((hash % 15) - 7) * 1.8;
        const offsetY = (((hash >> 2) % 15) - 7) * 1.8;
        x = Number((x + offsetX).toFixed(1));
        y = Number((y + offsetY).toFixed(1));
      }

      const posKey = `${x},${y}`;
      if (!usedPositions.has(posKey)) {
        usedPositions.add(posKey);
        points.push({
          id: d.id,
          name: d.name,
          stateCode: d.stateCode,
          x,
          y,
        });
      }
    }

    return points;
  }, [destinations]);

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
    setSelectedStateCode(destination.stateCode);

    if (!destination.isUnlocked) {
      setPendingDestination(destination);
    }
  }, []);

  const handleConfirmUnlock = useCallback(async () => {
    if (!pendingDestination) return;

    const target = pendingDestination;
    const isTargetState = target.category === 'State';
    const stateId = `state-${target.stateCode}`;

    const idsToUnlock = [target.id];
    if (!isTargetState) {
      idsToUnlock.push(stateId);
    }

    setDestinations((prev) => {
      const next = { ...prev };
      for (const id of idsToUnlock) {
        if (next[id]) {
          next[id] = { ...next[id], isUnlocked: true };
        }
      }
      return next;
    });

    setPendingDestination(null);

    try {
      await storage.saveUnlockedDestinationIds(idsToUnlock);
    } catch (err) {
      console.error('Failed to persist unlock state:', err);
    }
  }, [pendingDestination, storage]);

  const handleCancelUnlock = useCallback(() => {
    setPendingDestination(null);
  }, []);

  const handleOpenPhotoUpload = useCallback((destination: Destination) => {
    setTargetPhotoDestination(destination);
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
      const dest = destinations[destinationId];
      if (!dest || photoDataUrls.length === 0) return;

      const newPhotos: TravelPhoto[] = photoDataUrls.map((url, index) => ({
        id: `photo-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        destinationId,
        destinationName: dest.name,
        stateCode: dest.stateCode,
        imageUrl: url,
        caption,
        travelDate,
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

      setLoadedPhotos((prev) => [...newPhotos, ...prev]);

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

  const handleToggleRouteLine = useCallback(() => {
    setIsRouteLineVisible((prev) => !prev);
  }, []);

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
      isRouteLineVisible,
      travelRoutePoints,
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
      handleToggleRouteLine,
      handleOpenAchievements,
      handleCloseAchievements,
      handleOpenRemoteModal,
      handleCloseRemoteModal,
      handleResetAll,
    },
  };
}
