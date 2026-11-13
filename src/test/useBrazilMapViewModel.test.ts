import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBrazilMapViewModel } from '../viewmodels/useBrazilMapViewModel';
import { StorageService } from '../services/StorageService';
import { TravelPhoto } from '../models/TravelPhoto';

class MockStorageService implements StorageService {
  private unlocked = new Set<string>();
  private photos: TravelPhoto[] = [];

  get savedPhotos(): TravelPhoto[] {
    return this.photos;
  }

  async getUnlockedDestinationIds(): Promise<Set<string>> {
    return new Set(this.unlocked);
  }

  async saveUnlockedDestinationId(id: string): Promise<void> {
    this.unlocked.add(id);
  }

  async saveUnlockedDestinationIds(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.unlocked.add(id);
    }
  }

  async getTravelPhotos(): Promise<TravelPhoto[]> {
    return [...this.photos];
  }

  async saveTravelPhoto(photo: TravelPhoto): Promise<void> {
    this.photos.push(photo);
  }

  async deleteTravelPhoto(photoId: string): Promise<void> {
    this.photos = this.photos.filter((p) => p.id !== photoId);
  }

  async updateTravelPhoto(photo: TravelPhoto): Promise<void> {
    this.photos = this.photos.map((p) => (p.id === photo.id ? photo : p));
  }

  async resetAll(): Promise<void> {
    this.unlocked.clear();
    this.photos = [];
  }
}

describe('useBrazilMapViewModel', () => {
  let mockStorage: MockStorageService;

  beforeEach(() => {
    mockStorage = new MockStorageService();
  });

  it('initializes with all destinations locked and 0% progress', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.unlockedStatesCount).toBe(0);
    expect(result.current.state.progressPercentage).toBe(0);
    expect(result.current.state.unlockedPointsCount).toBe(0);
    expect(result.current.state.pointsProgressPercentage).toBe(0);
    expect(result.current.state.totalStatesCount).toBe(27);
    expect(result.current.state.selectedStateCode).toBeNull();
    // In global view with nothing unlocked, displayedDestinations is empty
    expect(result.current.state.displayedDestinations).toHaveLength(0);
  });

  it('filters sidebars to a specific state when a state is selected', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    // Select Ceará ('CE')
    act(() => {
      result.current.actions.handleSelectState('CE');
    });

    expect(result.current.state.selectedStateCode).toBe('CE');
    // Should contain points from Ceará (like Jericoacoara and Fortaleza)
    const ceDestinations = result.current.state.displayedDestinations;
    expect(ceDestinations.length).toBeGreaterThan(0);
    expect(ceDestinations.every((d) => d.stateCode === 'CE')).toBe(true);

    // Clicking 'CE' again deselects it back to global view
    act(() => {
      result.current.actions.handleSelectState('CE');
    });

    expect(result.current.state.selectedStateCode).toBeNull();
  });

  it('cascades unlock: unlocking a point automatically unlocks its parent state', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    // Find Jericoacoara (Beach in CE)
    const destinations = result.current.state.destinations;
    const jeri = destinations['ce-jericoacoara'];
    expect(jeri).toBeDefined();
    expect(jeri.isUnlocked).toBe(false);
    expect(destinations['state-CE'].isUnlocked).toBe(false);

    // Request unlock (opens modal)
    act(() => {
      result.current.actions.handleRequestUnlock(jeri);
    });

    expect(result.current.state.isUnlockModalOpen).toBe(true);
    expect(result.current.state.pendingDestination?.id).toBe('ce-jericoacoara');

    // Confirm unlock
    await act(async () => {
      await result.current.actions.handleConfirmUnlock();
    });

    // Both Jericoacoara and the State of Ceará ('state-CE') are now unlocked!
    const updated = result.current.state.destinations;
    expect(updated['ce-jericoacoara'].isUnlocked).toBe(true);
    expect(updated['state-CE'].isUnlocked).toBe(true);
    expect(result.current.state.unlockedStatesCount).toBe(1);
    expect(result.current.state.isUnlockModalOpen).toBe(false);
  });

  it('handles cancel unlock without mutating state', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    const jeri = result.current.state.destinations['ce-jericoacoara'];

    act(() => {
      result.current.actions.handleRequestUnlock(jeri);
    });
    expect(result.current.state.isUnlockModalOpen).toBe(true);

    act(() => {
      result.current.actions.handleCancelUnlock();
    });
    expect(result.current.state.isUnlockModalOpen).toBe(false);
    expect(result.current.state.destinations['ce-jericoacoara'].isUnlocked).toBe(false);
  });

  it('saves multiple photos simultaneously and associates them with the destination', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    await act(async () => {
      await result.current.actions.handleSavePhotos(
        'ce-jericoacoara',
        ['data:image/jpeg;base64,photo1', 'data:image/jpeg;base64,photo2'],
        'Férias no Ceará'
      );
    });

    const jeri = result.current.state.destinations['ce-jericoacoara'];
    expect(jeri.photoUrls).toHaveLength(2);
    expect(mockStorage.savedPhotos).toHaveLength(2);
    expect(mockStorage.savedPhotos[0].destinationName).toContain('Jericoacoara');
  });

  it('filters destination search results and handles selection', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    expect(result.current.state.searchQuery).toBe('');
    expect(result.current.state.searchResults).toEqual([]);

    // Single character query should not trigger search
    act(() => {
      result.current.actions.handleSearchChange('f');
    });
    expect(result.current.state.searchQuery).toBe('f');
    expect(result.current.state.searchResults).toHaveLength(0);

    // Search for 'felix' (Praia do Félix in SP)
    act(() => {
      result.current.actions.handleSearchChange('felix');
    });
    expect(result.current.state.searchResults.length).toBeGreaterThan(0);
    expect(result.current.state.searchResults[0].name).toContain('Félix');

    // Select search result
    const selected = result.current.state.searchResults[0];
    act(() => {
      result.current.actions.handleSelectSearchResult(selected);
    });

    // Query cleared, state selected, and unlock modal triggered for locked item
    expect(result.current.state.searchQuery).toBe('');
    expect(result.current.state.selectedStateCode).toBe('SP');
    expect(result.current.state.isUnlockModalOpen).toBe(true);
    expect(result.current.state.pendingDestination?.id).toBe(selected.id);

    // Clear search action
    act(() => {
      result.current.actions.handleSearchChange('ubatuba');
    });
    expect(result.current.state.searchQuery).toBe('ubatuba');
    act(() => {
      result.current.actions.handleClearSearch();
    });
    expect(result.current.state.searchQuery).toBe('');
    expect(result.current.state.searchResults).toHaveLength(0);
  });

  it('manages achievements modal and remote modal states', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    // Achievements modal open/close
    expect(result.current.state.isAchievementsModalOpen).toBe(false);
    act(() => {
      result.current.actions.handleOpenAchievements();
    });
    expect(result.current.state.isAchievementsModalOpen).toBe(true);
    act(() => {
      result.current.actions.handleCloseAchievements();
    });
    expect(result.current.state.isAchievementsModalOpen).toBe(false);

    // Remote modal open/close
    expect(result.current.state.isRemoteModalOpen).toBe(false);
    act(() => {
      result.current.actions.handleOpenRemoteModal();
    });
    expect(result.current.state.isRemoteModalOpen).toBe(true);
    act(() => {
      result.current.actions.handleCloseRemoteModal();
    });
    expect(result.current.state.isRemoteModalOpen).toBe(false);
  });

  it('raffles destination across all Brazil when no state is selected, excluding visited ones', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    expect(result.current.state.selectedStateCode).toBeNull();
    expect(result.current.state.pendingDestination).toBeNull();

    let drawnDestination: any = null;
    act(() => {
      drawnDestination = result.current.actions.handlePickRandomDestination();
    });

    expect(drawnDestination).not.toBeNull();
    expect(drawnDestination.isUnlocked).toBe(false);
    expect(drawnDestination.category).not.toBe('State');
    // Contextually selects the state of the drawn destination and opens unlock dialog
    expect(result.current.state.selectedStateCode).toBe(drawnDestination.stateCode);
    expect(result.current.state.pendingDestination).toEqual(drawnDestination);
    expect(result.current.state.isUnlockModalOpen).toBe(true);
  });

  it('raffles destination specifically from selected state, excluding visited ones', async () => {
    const { result } = renderHook(() => useBrazilMapViewModel(mockStorage));
    await act(async () => {});

    // Select Acre ('AC')
    act(() => {
      result.current.actions.handleSelectState('AC');
    });

    let drawnDestination: any = null;
    act(() => {
      drawnDestination = result.current.actions.handlePickRandomDestination();
    });

    expect(drawnDestination).not.toBeNull();
    expect(drawnDestination.stateCode).toBe('AC');
    expect(drawnDestination.isUnlocked).toBe(false);
    expect(result.current.state.pendingDestination).toEqual(drawnDestination);

    // Unlock this destination
    await act(async () => {
      await result.current.actions.handleConfirmUnlock();
    });

    // Check if raffle now picks remaining unvisited in AC or notifies when exhausted
    const allAc = Object.values(result.current.state.destinations).filter(
      (d) => d.stateCode === 'AC' && d.category !== 'State'
    );
    // Unlock remaining in AC
    for (const d of allAc) {
      act(() => {
        result.current.actions.handleRequestUnlock(d);
      });
      await act(async () => {
        await result.current.actions.handleConfirmUnlock();
      });
    }

    // Now all in AC are visited; raffling in AC should notify and return null
    let exhaustedDrawn: any = null;
    act(() => {
      exhaustedDrawn = result.current.actions.handlePickRandomDestination();
    });

    expect(exhaustedDrawn).toBeNull();
    expect(result.current.state.raffleNotification).toContain('Todos os destinos de AC já foram visitados');

    // Dismiss notification
    act(() => {
      result.current.actions.handleDismissRaffleNotification();
    });
    expect(result.current.state.raffleNotification).toBeNull();
  });
});
