import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSlideshowViewModel } from '../viewmodels/useSlideshowViewModel';
import { StorageService } from '../services/StorageService';
import { TravelPhoto } from '../models/TravelPhoto';

class MockStorageService implements StorageService {
  private photos: TravelPhoto[] = [
    {
      id: 'photo-1',
      destinationId: 'sancho-pe',
      destinationName: 'Baía do Sancho',
      stateCode: 'PE',
      imageUrl: 'data:image/png;base64,sample1',
      createdAt: '2026-10-01',
    },
    {
      id: 'photo-2',
      destinationId: 'cristo-rj',
      destinationName: 'Cristo Redentor',
      stateCode: 'RJ',
      imageUrl: 'data:image/png;base64,sample2',
      createdAt: '2026-10-02',
    },
  ];

  async getUnlockedDestinationIds(): Promise<Set<string>> {
    return new Set();
  }
  async saveUnlockedDestinationId(): Promise<void> {}
  async saveUnlockedDestinationIds(): Promise<void> {}
  async getTravelPhotos(): Promise<TravelPhoto[]> {
    return [...this.photos];
  }
  async saveTravelPhoto(photo: TravelPhoto): Promise<void> {
    this.photos.push(photo);
  }
  async resetAll(): Promise<void> {
    this.photos = [];
  }
}

describe('useSlideshowViewModel', () => {
  let mockStorage: MockStorageService;

  beforeEach(() => {
    mockStorage = new MockStorageService();
  });

  it('loads photos on mount and sets the first photo as active', async () => {
    const { result } = renderHook(() => useSlideshowViewModel(mockStorage));

    // Wait for effect to load photos
    await act(async () => {});

    expect(result.current.state.photos).toHaveLength(2);
    expect(result.current.state.activeIndex).toBe(0);
    expect(result.current.state.activePhoto?.destinationName).toBe('Baía do Sancho');
  });

  it('cycles to the next and previous photos via actions', async () => {
    const { result } = renderHook(() => useSlideshowViewModel(mockStorage));
    await act(async () => {});

    // Next
    act(() => {
      result.current.actions.handleNext();
    });
    expect(result.current.state.activeIndex).toBe(1);
    expect(result.current.state.activePhoto?.destinationName).toBe('Cristo Redentor');

    // Next again wraps around
    act(() => {
      result.current.actions.handleNext();
    });
    expect(result.current.state.activeIndex).toBe(0);

    // Previous wraps around
    act(() => {
      result.current.actions.handlePrevious();
    });
    expect(result.current.state.activeIndex).toBe(1);
  });

  it('toggles play/pause state', async () => {
    const { result } = renderHook(() => useSlideshowViewModel(mockStorage));
    await act(async () => {});
    expect(result.current.state.isPlaying).toBe(true);

    act(() => {
      result.current.actions.handleTogglePlayPause();
    });
    expect(result.current.state.isPlaying).toBe(false);

    act(() => {
      result.current.actions.handleTogglePlayPause();
    });
    expect(result.current.state.isPlaying).toBe(true);
  });
});
