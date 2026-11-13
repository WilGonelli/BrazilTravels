import { StorageService } from './StorageService';
import { TravelPhoto } from '../models/TravelPhoto';

const UNLOCKED_KEY = 'brazil_travels_unlocked_ids';
const PHOTOS_KEY = 'brazil_travels_photos';

/**
 * Robust LocalStorage implementation of StorageService.
 * Handles storage quotas, fallback, and serialization.
 */
export class LocalStorageService implements StorageService {
  async getUnlockedDestinationIds(): Promise<Set<string>> {
    try {
      const raw = localStorage.getItem(UNLOCKED_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
      return new Set();
    } catch (error) {
      console.warn('Failed to read unlocked IDs from localStorage:', error);
      return new Set();
    }
  }

  async saveUnlockedDestinationId(id: string): Promise<void> {
    await this.saveUnlockedDestinationIds([id]);
  }

  async saveUnlockedDestinationIds(ids: string[]): Promise<void> {
    try {
      const current = await this.getUnlockedDestinationIds();
      for (const id of ids) {
        if (id) current.add(id);
      }
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(Array.from(current)));
    } catch (error) {
      console.error('Failed to save unlocked IDs to localStorage:', error);
    }
  }

  async getTravelPhotos(): Promise<TravelPhoto[]> {
    try {
      const raw = localStorage.getItem(PHOTOS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to read photos from localStorage:', error);
      return [];
    }
  }

  async saveTravelPhoto(photo: TravelPhoto): Promise<void> {
    try {
      const current = await this.getTravelPhotos();
      const updated = [photo, ...current];
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save travel photo to localStorage:', error);
    }
  }

  async resetAll(): Promise<void> {
    try {
      localStorage.removeItem(UNLOCKED_KEY);
      localStorage.removeItem(PHOTOS_KEY);
    } catch (error) {
      console.error('Failed to reset localStorage:', error);
    }
  }
}
