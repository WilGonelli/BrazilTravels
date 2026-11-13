import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleSheetsStorageService } from '../services/GoogleSheetsStorageService';
import { StorageService } from '../services/StorageService';
import { TravelPhoto } from '../models/TravelPhoto';

class MockLocalFallback implements StorageService {
  public unlocked = new Set<string>();
  public photos: TravelPhoto[] = [];

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

describe('GoogleSheetsStorageService', () => {
  let fallback: MockLocalFallback;
  const mockScriptUrl = 'https://script.google.com/macros/s/test-app-script-id/exec';

  beforeEach(() => {
    fallback = new MockLocalFallback();
    vi.restoreAllMocks();
  });

  it('falls back to local storage when scriptUrl is empty', async () => {
    fallback.unlocked.add('state-SP');
    const service = new GoogleSheetsStorageService('', fallback);

    const result = await service.getUnlockedDestinationIds();
    expect(result.has('state-SP')).toBe(true);
  });

  it('fetches unlocked destinations from Google Sheets and synchronizes local fallback', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ['sp-maresias', 'state-SP'],
    } as Response);

    const service = new GoogleSheetsStorageService(mockScriptUrl, fallback);
    const result = await service.getUnlockedDestinationIds();

    expect(fetchSpy).toHaveBeenCalledWith(
      `${mockScriptUrl}?action=getUnlocked`,
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.has('sp-maresias')).toBe(true);
    expect(result.has('state-SP')).toBe(true);
    expect(fallback.unlocked.has('sp-maresias')).toBe(true);
  });

  it('gracefully falls back to local storage when fetch rejects (offline resilience)', async () => {
    fallback.unlocked.add('rj-copacabana');
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'));

    const service = new GoogleSheetsStorageService(mockScriptUrl, fallback);
    const result = await service.getUnlockedDestinationIds();

    expect(result.has('rj-copacabana')).toBe(true);
  });

  it('posts unlock event to Google Sheets and saves locally', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
    } as Response);

    const service = new GoogleSheetsStorageService(mockScriptUrl, fallback);
    await service.saveUnlockedDestinationId('ba-salvador');

    expect(fallback.unlocked.has('ba-salvador')).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      mockScriptUrl,
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"destinationId":"ba-salvador"'),
      })
    );
  });

  it('merges local and remote unlocked IDs without wiping local progress', async () => {
    // Existing locally (e.g. Praia do Félix was unlocked locally before reload)
    fallback.unlocked.add('sp-ubatuba-felix');

    // Remote has state-SP
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ['state-SP'],
    } as Response);

    const service = new GoogleSheetsStorageService(mockScriptUrl, fallback);
    const result = await service.getUnlockedDestinationIds();

    // Both should be preserved!
    expect(result.has('sp-ubatuba-felix')).toBe(true);
    expect(result.has('state-SP')).toBe(true);
    expect(fallback.unlocked.has('sp-ubatuba-felix')).toBe(true);
    expect(fallback.unlocked.has('state-SP')).toBe(true);
  });

  it('safely filters out non-photo items (e.g. string arrays) and falls back to local storage', async () => {
    fallback.photos.push({
      id: 'local-photo',
      destinationId: 'sp-ubatuba-felix',
      destinationName: 'Praia do Félix',
      stateCode: 'SP',
      imageUrl: 'data:image/jpeg;base64,valid',
      createdAt: '2026-11-13',
    });

    // Remote returns array of strings (destination IDs, not photos!)
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ['state-SP', 'test-point', 'sp-ubatuba-felix'],
    } as Response);

    const service = new GoogleSheetsStorageService(mockScriptUrl, fallback);
    const photos = await service.getTravelPhotos();

    // Must return the valid local fallback photo and not strings!
    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe('local-photo');
    expect(photos[0].destinationName).toBe('Praia do Félix');
  });

  it('retrieves valid TravelPhoto objects when returned by remote', async () => {
    const validRemotePhotos: TravelPhoto[] = [
      {
        id: 'remote-1',
        destinationId: 'sp-ubatuba-felix',
        destinationName: 'Praia do Félix',
        stateCode: 'SP',
        imageUrl: 'data:image/jpeg;base64,remote1',
        createdAt: '2026-11-13',
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => validRemotePhotos,
    } as Response);

    const service = new GoogleSheetsStorageService(mockScriptUrl, fallback);
    const photos = await service.getTravelPhotos();

    expect(photos).toHaveLength(1);
    expect(photos[0].id).toBe('remote-1');
  });
});
