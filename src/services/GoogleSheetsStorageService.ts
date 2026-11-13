import { StorageService } from './StorageService';
import { LocalStorageService } from './LocalStorageService';
import { TravelPhoto } from '../models/TravelPhoto';

/**
 * Serverless StorageService implementation backed by Google Sheets & Google Drive
 * via Google Apps Script Web App.
 *
 * Implements optimistic caching using LocalStorageService for instant offline reads
 * and seamless synchronization with the user's personal Google Drive.
 */
export class GoogleSheetsStorageService implements StorageService {
  private readonly scriptUrl: string;
  private readonly fallbackService: StorageService;

  /**
   * @param scriptUrl - Deployed Google Apps Script Web App URL.
   * @param fallbackService - Local caching fallback service.
   */
  constructor(scriptUrl: string, fallbackService: StorageService = new LocalStorageService()) {
    this.scriptUrl = scriptUrl.trim();
    this.fallbackService = fallbackService;
  }

  /**
   * Retrieves unlocked destination IDs from Google Sheets.
   * Merges remote data with local cache without destructive wipes.
   */
  async getUnlockedDestinationIds(): Promise<Set<string>> {
    const localIds = await this.fallbackService.getUnlockedDestinationIds();

    if (!this.scriptUrl) {
      return localIds;
    }

    try {
      const response = await fetch(`${this.scriptUrl}?action=getUnlocked`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error fetching from Google Sheets: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        // Union merge: never discard local progress if remote is lagging
        const merged = new Set<string>([...localIds, ...data]);

        // Keep local fallback synchronized with the merged truth
        await this.fallbackService.saveUnlockedDestinationIds(Array.from(merged));

        // Sync local IDs that are missing from remote
        const missingOnRemote = Array.from(localIds).filter((id) => !data.includes(id));
        if (missingOnRemote.length > 0) {
          this.saveUnlockedDestinationIds(missingOnRemote).catch((err) =>
            console.warn('Background sync to Google Sheets failed:', err)
          );
        }

        return merged;
      }

      return localIds;
    } catch (error) {
      console.warn('Google Sheets offline or unreachable; falling back to local storage:', error);
      return localIds;
    }
  }

  /**
   * Persists an unlocked destination ID to Google Sheets and local storage cache.
   */
  async saveUnlockedDestinationId(id: string): Promise<void> {
    await this.saveUnlockedDestinationIds([id]);
  }

  /**
   * Persists multiple unlocked destination IDs atomically to local storage and remote Google Sheets.
   */
  async saveUnlockedDestinationIds(ids: string[]): Promise<void> {
    const validIds = Array.from(new Set(ids.filter(Boolean)));
    if (validIds.length === 0) return;

    // 1. Immediate optimistic local cache update
    await this.fallbackService.saveUnlockedDestinationIds(validIds);

    if (!this.scriptUrl) return;

    // 2. Asynchronous remote updates to Google Sheets in parallel
    try {
      await Promise.allSettled(
        validIds.map((id) =>
          fetch(this.scriptUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
              action: 'unlock',
              destinationId: id,
              timestamp: new Date().toISOString(),
            }),
          })
        )
      );
    } catch (error) {
      console.error('Failed to sync unlock events to Google Sheets:', error);
    }
  }

  /**
   * Retrieves travel photos from Google Sheets / Drive.
   */
  async getTravelPhotos(): Promise<TravelPhoto[]> {
    if (!this.scriptUrl) {
      return this.fallbackService.getTravelPhotos();
    }

    try {
      const response = await fetch(`${this.scriptUrl}?action=getPhotos`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP error fetching photos: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data as TravelPhoto[];
      }

      return this.fallbackService.getTravelPhotos();
    } catch (error) {
      console.warn('Google Sheets photo fetch failed; falling back to local cache:', error);
      return this.fallbackService.getTravelPhotos();
    }
  }

  /**
   * Persists a commemorative travel photo to Google Drive / Sheets.
   */
  async saveTravelPhoto(photo: TravelPhoto): Promise<void> {
    await this.fallbackService.saveTravelPhoto(photo);

    if (!this.scriptUrl) return;

    try {
      await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'savePhoto',
          photo,
        }),
      });
    } catch (error) {
      console.error('Failed to sync travel photo to Google Sheets/Drive:', error);
    }
  }

  /**
   * Clears all local storage records.
   */
  async resetAll(): Promise<void> {
    await this.fallbackService.resetAll();
  }
}
