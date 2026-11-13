import { StorageService } from './StorageService';
import { LocalStorageService } from './LocalStorageService';
import { TravelPhoto } from '../models/TravelPhoto';

/**
 * Pure type guard verifying if an item is a valid TravelPhoto object.
 */
function isValidTravelPhoto(item: unknown): item is TravelPhoto {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as TravelPhoto).id === 'string' &&
    typeof (item as TravelPhoto).imageUrl === 'string' &&
    typeof (item as TravelPhoto).destinationName === 'string'
  );
}

/**
 * Hybrid StorageService implementation backed by Google Sheets / Drive and local device API.
 *
 * Implements non-destructive optimistic caching using LocalStorageService for instant offline reads,
 * local network synchronization for Raspberry Pi totems (/api/), and remote cloud persistence
 * via Google Apps Script.
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
   * Retrieves unlocked destination IDs.
   * Merges remote data with local cache without destructive wipes.
   */
  async getUnlockedDestinationIds(): Promise<Set<string>> {
    const localIds = await this.fallbackService.getUnlockedDestinationIds();
    const merged = new Set<string>(localIds);

    // 1. Try local host API (/api/unlocked) if running on Pi or local network
    if (typeof window !== 'undefined') {
      try {
        const localApiRes = await fetch('/api/unlocked', {
          headers: { Accept: 'application/json' },
        });
        if (localApiRes.ok) {
          const apiIds = await localApiRes.json();
          if (Array.isArray(apiIds)) {
            apiIds.forEach((id) => {
              if (typeof id === 'string' && id) merged.add(id);
            });
          }
        }
      } catch {
        // Silently continue if local API is unavailable
      }
    }

    // 2. Fetch from Google Sheets if configured
    if (this.scriptUrl) {
      try {
        const response = await fetch(`${this.scriptUrl}?action=getUnlocked`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            data.forEach((id) => {
              if (typeof id === 'string' && id) merged.add(id);
            });

            // Sync any local IDs that are missing from remote
            const missingOnRemote = Array.from(localIds).filter((id) => !data.includes(id));
            if (missingOnRemote.length > 0) {
              this.saveUnlockedDestinationIds(missingOnRemote).catch((err) =>
                console.warn('Background sync to Google Sheets failed:', err)
              );
            }
          }
        }
      } catch (error) {
        console.warn('Google Sheets offline or unreachable; using local cache:', error);
      }
    }

    // Keep local fallback synchronized with the merged truth
    await this.fallbackService.saveUnlockedDestinationIds(Array.from(merged));
    return merged;
  }

  /**
   * Persists an unlocked destination ID.
   */
  async saveUnlockedDestinationId(id: string): Promise<void> {
    await this.saveUnlockedDestinationIds([id]);
  }

  /**
   * Persists multiple unlocked destination IDs atomically to local storage, local API, and Google Sheets.
   */
  async saveUnlockedDestinationIds(ids: string[]): Promise<void> {
    const validIds = Array.from(new Set(ids.filter(Boolean)));
    if (validIds.length === 0) return;

    // 1. Immediate optimistic local cache update
    await this.fallbackService.saveUnlockedDestinationIds(validIds);

    // 2. Local network API update
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/unlocked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: validIds }),
        });
      } catch {
        // Ignore if local API unavailable
      }
    }

    // 3. Asynchronous remote updates to Google Sheets in parallel
    if (this.scriptUrl) {
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
  }

  /**
   * Retrieves travel photos from local device API, Google Sheets / Drive, or local storage.
   */
  async getTravelPhotos(): Promise<TravelPhoto[]> {
    // 1. Try local host API (/api/photos)
    if (typeof window !== 'undefined') {
      try {
        const localApiRes = await fetch('/api/photos', {
          headers: { Accept: 'application/json' },
        });
        if (localApiRes.ok) {
          const apiPhotos = await localApiRes.json();
          if (Array.isArray(apiPhotos)) {
            const valid = apiPhotos.filter(isValidTravelPhoto);
            if (valid.length > 0 || apiPhotos.length === 0) {
              try {
                localStorage.setItem('brazil_travels_photos', JSON.stringify(valid));
              } catch {
                // Ignore storage quota
              }
              return valid;
            }
          }
        }
      } catch {
        // Continue to cloud/fallback
      }
    }

    // 2. Try Google Sheets / Drive Web App if configured
    if (this.scriptUrl) {
      try {
        const response = await fetch(`${this.scriptUrl}?action=getPhotos`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const valid = data.filter(isValidTravelPhoto);
            if (valid.length > 0) {
              return valid;
            }
          }
        }
      } catch (error) {
        console.warn('Google Sheets photo fetch failed; falling back to local cache:', error);
      }
    }

    // 3. Fallback to local storage
    return this.fallbackService.getTravelPhotos();
  }

  /**
   * Persists a commemorative travel photo to local storage, local network device, and Google Drive / Sheets.
   */
  async saveTravelPhoto(photo: TravelPhoto): Promise<void> {
    // 1. Save to local browser storage
    await this.fallbackService.saveTravelPhoto(photo);

    // 2. Save to local device API (/api/photos)
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photo),
        });
      } catch (err) {
        console.warn('Failed to save photo to local device API:', err);
      }
    }

    // 3. Persist to Google Sheets / Drive
    if (this.scriptUrl) {
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
  }

  /**
   * Removes a travel photo across local fallback, device API, and cloud storage.
   */
  async deleteTravelPhoto(photoId: string): Promise<void> {
    // 1. Delete from local cache
    await this.fallbackService.deleteTravelPhoto(photoId);

    // 2. Delete from local device API (/api/photos/delete)
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/photos/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: photoId }),
        });
        if (!res.ok) {
          await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
        }
      } catch (err) {
        console.warn('Failed to delete photo from local device API:', err);
      }
    }

    // 3. Delete from Google Sheets if configured
    if (this.scriptUrl) {
      try {
        await fetch(this.scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'deletePhoto',
            photoId,
          }),
        });
      } catch (error) {
        console.error('Failed to delete travel photo from Google Sheets:', error);
      }
    }
  }

  /**
   * Updates an existing travel photo across local fallback, device API, and cloud storage.
   */
  async updateTravelPhoto(photo: TravelPhoto): Promise<void> {
    // 1. Update local cache
    await this.fallbackService.updateTravelPhoto(photo);

    // 2. Update local device API (/api/photos)
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(photo),
        });
      } catch (err) {
        console.warn('Failed to update photo on local device API:', err);
      }
    }

    // 3. Update Google Sheets if configured
    if (this.scriptUrl) {
      try {
        await fetch(this.scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'updatePhoto',
            photo,
          }),
        });
      } catch (error) {
        console.error('Failed to sync updated travel photo to Google Sheets:', error);
      }
    }
  }

  /**
   * Clears all local storage records.
   */
  async resetAll(): Promise<void> {
    await this.fallbackService.resetAll();
  }
}
