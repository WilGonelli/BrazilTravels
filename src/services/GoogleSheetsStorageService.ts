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
   * Falls back to local storage if network is offline or unconfigured.
   */
  async getUnlockedDestinationIds(): Promise<Set<string>> {
    if (!this.scriptUrl) {
      return this.fallbackService.getUnlockedDestinationIds();
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
        const ids = new Set<string>(data);
        // Synchronize authoritative remote data to local fallback cache
        await this.fallbackService.resetAll();
        for (const id of ids) {
          await this.fallbackService.saveUnlockedDestinationId(id);
        }
        return ids;
      }

      return this.fallbackService.getUnlockedDestinationIds();
    } catch (error) {
      console.warn('Google Sheets offline or unreachable; falling back to local storage:', error);
      return this.fallbackService.getUnlockedDestinationIds();
    }
  }

  /**
   * Persists an unlocked destination ID to Google Sheets and local storage cache.
   */
  async saveUnlockedDestinationId(id: string): Promise<void> {
    // 1. Optimistic local cache update
    await this.fallbackService.saveUnlockedDestinationId(id);

    if (!this.scriptUrl) return;

    // 2. Asynchronous remote update to Google Sheets
    try {
      await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'unlock',
          destinationId: id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to sync unlock event to Google Sheets:', error);
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
