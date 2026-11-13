/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_STORAGE_MODE?: 'local' | 'sheets' | 'drive';
  readonly VITE_GOOGLE_APPS_SCRIPT_URL?: string;
  readonly VITE_GOOGLE_API_KEY?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID?: string;
  readonly VITE_GOOGLE_SHEETS_SPREADSHEET_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
