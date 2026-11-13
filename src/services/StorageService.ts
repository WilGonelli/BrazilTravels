import { TravelPhoto } from '../models/TravelPhoto';

/**
 * Interface contract for persisting travel destinations and photos.
 * Decoupled from concrete storage (LocalStorage, IndexedDB, or Google Sheets).
 */
export interface StorageService {
  /**
   * Retrieves the set of unlocked destination IDs.
   */
  getUnlockedDestinationIds(): Promise<Set<string>>;

  /**
   * Saves an unlocked destination ID.
   */
  saveUnlockedDestinationId(id: string): Promise<void>;

  /**
   * Retrieves all registered travel photos.
   */
  getTravelPhotos(): Promise<TravelPhoto[]>;

  /**
   * Saves a new travel photo.
   */
  saveTravelPhoto(photo: TravelPhoto): Promise<void>;

  /**
   * Resets all progress.
   */
  resetAll(): Promise<void>;
}
