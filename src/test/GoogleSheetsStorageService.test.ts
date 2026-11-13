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

  async getTravelPhotos(): Promise<TravelPhoto[]> {
    return [...this.photos];
  }

  async saveTravelPhoto(photo: TravelPhoto): Promise<void> {
    this.photos.push(photo);
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
});
