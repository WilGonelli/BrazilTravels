import { StorageService } from './StorageService';
import { LocalStorageService } from './LocalStorageService';
import { GoogleSheetsStorageService } from './GoogleSheetsStorageService';

/**
 * Creates the appropriate StorageService instance based on environment configuration.
 *
 * Checks `import.meta.env.VITE_STORAGE_MODE` and `import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL`.
 * If configured for Google Sheets / Drive, instantiates `GoogleSheetsStorageService`.
 * Otherwise, defaults to `LocalStorageService`.
 */
export function createDefaultStorageService(): StorageService {
  const mode = import.meta.env.VITE_STORAGE_MODE || 'local';
  const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

  if ((mode === 'sheets' || mode === 'drive') && scriptUrl) {
    return new GoogleSheetsStorageService(scriptUrl);
  }

  return new LocalStorageService();
}
