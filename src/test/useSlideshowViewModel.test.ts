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
  async deleteTravelPhoto(photoId: string): Promise<void> {
    this.photos = this.photos.filter((p) => p.id !== photoId);
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

  it('adds multiple photos and sets the latest photo active', async () => {
    const { result } = renderHook(() => useSlideshowViewModel(mockStorage));
    await act(async () => {});

    expect(result.current.state.photos).toHaveLength(2);
    expect(result.current.state.intervalMs).toBe(10000);

    const newPhotos: TravelPhoto[] = [
      {
        id: 'new-1',
        destinationId: 'sp-ubatuba-felix',
        destinationName: 'Praia do Félix',
        stateCode: 'SP',
        imageUrl: 'data:image/jpeg;base64,sample1',
        createdAt: '2026-11-13',
      },
      {
        id: 'new-2',
        destinationId: 'sp-ubatuba-felix',
        destinationName: 'Praia do Félix',
        stateCode: 'SP',
        imageUrl: 'data:image/jpeg;base64,sample2',
        createdAt: '2026-11-13',
      },
    ];

    act(() => {
      result.current.actions.handleAddPhotos(newPhotos);
    });

    expect(result.current.state.photos).toHaveLength(4);
    expect(result.current.state.activeIndex).toBe(0);
    expect(result.current.state.activePhoto?.id).toBe('new-1');
  });

  it('controls gallery modal open/close and deletes photos via handleDeletePhoto', async () => {
    const { result } = renderHook(() => useSlideshowViewModel(mockStorage));
    await act(async () => {});

    expect(result.current.state.isGalleryOpen).toBe(false);

    // Open gallery
    act(() => {
      result.current.actions.handleOpenGallery();
    });
    expect(result.current.state.isGalleryOpen).toBe(true);

    // Delete photo-1
    await act(async () => {
      await result.current.actions.handleDeletePhoto('photo-1');
    });

    // Gallery remains open after delete!
    expect(result.current.state.isGalleryOpen).toBe(true);
    expect(result.current.state.photos).toHaveLength(1);
    expect(result.current.state.photos[0].id).toBe('photo-2');

    // Close gallery
    act(() => {
      result.current.actions.handleCloseGallery();
    });
    expect(result.current.state.isGalleryOpen).toBe(false);
  });
});
