# Requirements Analysis & Architecture Specification
## Brazil Travel Scratch-Off Map & Showcase Web Application

- **Document Version**: 1.0.0
- **Status**: Approved / Ready for Architecture & Implementation
- **Target Stack**: React 19, TypeScript 5, Vite, Strict MVVM, Tailwind CSS / Vanilla CSS, Vitest + RTL
- **Reference Assets**:
  - Reference Visual: [`Gemini_Generated_Image_cxemzjcxemzjcxem.jpg`](file:///C:/projects/estudos/BrazilTravels/Gemini_Generated_Image_cxemzjcxemzjcxem.jpg)
  - UI Screen Mockup (PNG): [`ui-mockup.png`](file:///C:/projects/estudos/BrazilTravels/ui-mockup.png)
  - UI Scalable Vector Mockup (SVG): [`ui-mockup.svg`](file:///C:/projects/estudos/BrazilTravels/ui-mockup.svg)
  - Official Geographic Boundaries (IBGE): [`brazil_states.json`](file:///C:/projects/estudos/BrazilTravels/brazil_states.json)

---

## 1. Executive Summary & Project Vision

The **Brazil Travel Scratch-Off Map** is an interactive, web-based digital travel tracker inspired by physical scratch-off travel posters (such as the reference poster provided in [`Gemini_Generated_Image_cxemzjcxemzjcxem.jpg`](file:///C:/projects/estudos/BrazilTravels/Gemini_Generated_Image_cxemzjcxemzjcxem.jpg)). 

In this application:
1. **Scratch-Off Metaphor**: Initially, all 26 Brazilian States + Federal District, along with famous cities, coastal beaches, landmark islands, and tourist points, appear in a matte silver-gray "scratch-off" layer with black typography.
2. **Interactive Unlocking**: When a user clicks or activates any state, beach, or landmark, a confirmation dialog appears asking if the user has visited and wants to unlock that destination.
3. **Color Reveal & Photo Registration**: Upon confirmation, the destination reveals its vibrant regional color scheme (Green for North, Red/Coral for Northeast, Violet for Center-West, Orange for Southeast, and Cyan/Blue for South) and prompts the user to upload commemorative trip photos.
4. **Dual Display / Portrait Kiosk Layout**: The application is tailored specifically for vertical screens (portrait orientation, e.g., 1080×1920 or 9:16 aspect ratio), where:
   - **Upper Section**: An automated, interactive photo slideshow showcases registered travel photos with captions and dates.
   - **Lower Section**: The complete interactive Brazil scratch-off map with state flags, beaches, and tourist lists.
   - The application also provides responsive adaptability for standard desktop/landscape displays (split side-by-side view).

---

## 2. Visual Reference & Layout Mockup

### 2.1. Screen Layout Architecture (Portrait 1080×1920)

```
+-------------------------------------------------------------------------+
| [TOP SECTION ~35% of viewport height]                                    |
|  TRAVEL MEMORIES - SLIDESHOW & GALLERY CAROUSEL                          |
|  +-------------------------------------+  +---------------------------+  |
|  | [Active Hero Photo Card]            |  | [Destination Thumbnails]  |  |
|  |  * High-res uploaded travel photo   |  |  * Lençóis Maranhenses    |  |
|  |  * Destination badge & timestamp    |  |  * Cristo Redentor        |  |
|  |  * Author / Memory notes            |  |  * Cataratas do Iguaçu    |  |
|  +-------------------------------------+  +---------------------------+  |
+-------------------------------------------------------------------------+
| [BOTTOM SECTION ~65% of viewport height]                                 |
|  INTERACTIVE BRAZIL SCRATCH-OFF MAP POSTER                               |
|  Progress: [ 5 / 27 States Unlocked • 18% ]                              |
|  +----------------+  +--------------------------+  +------------------+  |
|  | CATEGORIES     |  | VECTOR MAP OF BRAZIL     |  | PRINCIPAIS PRAIAS|  |
|  |  - Ilhas       |  |  * Unlocked: Vibrant RGB |  |  * Sancho (PE)   |  |
|  |  - Cidades     |  |  * Locked: Silver-Gray   |  |  * Copacabana    |  |
|  |  - Pontos Tur. |  |  * Hover & focus rings   |  |  * Jericoacoara  |  |
|  +----------------+  +--------------------------+  +------------------+  |
|  +--------------------------------------------------------------------+  |
|  | STATE FLAGS BAR: [AM][BA][MA][PE][RJ][PR][..locked silver flags..] |  |
|  +--------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
| [MODAL OVERLAY (Triggered on Click)]                                    |
|  "Unlock Destination: Ceará (CE)?"                                      |
|  [Photo Upload Dropzone]  •  [Cancel]  •  [Confirm & Unlock]            |
+-------------------------------------------------------------------------+
```

A preview of the layout is shown below:

![Screen Layout Mockup](file:///C:/projects/estudos/BrazilTravels/ui-mockup.png)

---

## 3. Functional Requirements (FR)

### 3.1. Map Visualization & Regional Palette
- **FR-01 (Authentic Geographic Vector Map - IBGE)**: The Brazil map must be rendered using authentic, official geographic boundary vector paths (IBGE GIS datasets / GeoJSON polygons and multipolygons) representing the real contours of all 26 States + Federal District, coastlines, and oceanic islands. Stylized or geometric polygon approximations are explicitly prohibited to ensure fidelity to the real map of Brazil.
- **FR-02 (Scratch-Off Visual State)**:
  - By default, all unvisited states must be rendered in a metallic silver-gray fill (`#9ca3af` to `#d1d5db` gradient) with high-contrast black typography (`#111827`) representing the scratch-off surface.
  - When unlocked, states must transition smoothly (CSS transition) into their official regional palette:
    - **North (Norte)**: Shades of Emerald Green (`#10b981`, `#047857`).
    - **Northeast (Nordeste)**: Shades of Coral Red & Crimson (`#ef4444`, `#dc2626`).
    - **Center-West (Centro-Oeste)**: Shades of Violet & Purple (`#8b5cf6`, `#6d28d9`).
    - **Southeast (Sudeste)**: Shades of Amber & Warm Orange (`#f97316`, `#ea580c`).
    - **South (Sul)**: Shades of Cyan & Ocean Blue (`#06b6d4`, `#0284c7`).

### 3.2. Points of Interest (POIs) & Dynamic Sidebars
- **FR-03 (Categories & Weighted State Distribution)**:
  - **Supported Categories**: *Beaches*, *Famous Cities*, *Tourist Landmarks*, *Waterfalls (Cachoeiras)*, and *Islands*.
  - **State Density Weighting**:
    - **High Density**: State of **São Paulo (SP)** and adjacent states (**Rio de Janeiro - RJ**, **Minas Gerais - MG**, **Paraná - PR**, **Mato Grosso do Sul - MS**, **Goiás - GO / DF**) feature the greatest variety and volume of beaches, waterfalls, historical towns, and ecotourism landmarks.
    - **Curated Density**: All other 21 Brazilian states feature their most iconic, nationally celebrated landmarks, beaches, and waterfalls.
  - **Global Unlocked Mode (Default / No State Selected - `selectedState === null`)**:
    - When no state is clicked or selected on the map, the lateral sidebars exclusively display destinations that have **already been unlocked** across Brazil.
    - If no destinations have been unlocked yet, a subtle guide message invites the user to click any state on the map.
  - **State-Filtered Mode (State Selected - `selectedState !== null`)**:
    - When the user clicks a specific state on the map, the sidebars dynamically filter to show **all points, beaches, and waterfalls belonging to that selected state**.
    - Clicking the map background or clicking the active state again returns the sidebars to the global unlocked overview.

### 3.3. Destination Unlocking, Cascading Rules & Minimalist Modal
- **FR-04 (Cascading State Unlock Rule)**:
  - **Unlocking 1 Point Unlocks the Entire State**: When the user unlocks any individual point of interest (a beach, famous city, tourist spot, or island) belonging to a state, the parent state is **automatically unlocked as well**, immediately turning from the silver scratch-off layer to its vibrant regional color on the map!
- **FR-05 (Minimalist Unlock Confirmation Modal)**:
  - The confirmation modal must be strictly minimal and straightforward:
    - **Prompt Question**: *"Deseja realmente liberar este destino?"* (*"Do you really want to unlock this destination?"*).
    - **Destination Name**: Clearly highlights the target location (e.g., *"Praia do Sancho - Fernando de Noronha, PE"*).
    - **Binary Action Buttons**:
      - **"Confirmar"** (*Confirm*): Unlocks the point (and cascades to unlock the parent state if not already unlocked).
      - **"Cancelar"** (*Cancel*): Dismisses the modal without altering state (`Escape` key supported).
    - The unlock modal does not force or present complex photo upload forms upfront, keeping the unlock interaction instantaneous and friction-free.
- **FR-06 (Post-Unlock Add Photo Action - `+` SVG Button)**:
  - Once any point of interest is unlocked, its card/badge in the sidebar displays an accessible **`+` SVG icon button** (`<button aria-label="Adicionar fotos para [Nome do Ponto]"> <svg>+</svg> </button>`).
  - Clicking this `+` button opens a dedicated photo upload modal/drawer to attach travel memories, which are immediately synchronized with the top slideshow.
- **FR-07 (State Reversion / Management)**:
  - Users can inspect unlocked destinations, upload multiple photos over time via the `+` button, or reset a destination's status if clicked unintentionally.

### 3.4. Photo Upload & Slideshow Showcase
- **FR-08 (Image Upload & Optimization via '+' Button)**:
  - Triggered exclusively by clicking the `+` SVG button on any unlocked destination.
  - Accepts image formats: `image/jpeg`, `image/png`, `image/webp`.
  - Client-side image resizing and thumbnail generation via Canvas to ensure fast loading and prevent local storage quota exhaustion.
  - Support for drag-and-drop or file picker input.
- **FR-09 (Automated Presentation Slideshow)**:
  - Located in the upper section of the portrait layout.
  - Cycles through all uploaded travel photos automatically every 5 to 8 seconds (customizable).
  - Provides playback controls: Pause on hover/focus, Previous (`<`), Next (`>`), and direct thumbnail navigation.
  - Displays destination name, travel date, and photo caption in a high-contrast card overlay.
  - When no photos are uploaded yet, displays an inspiring placeholder illustration inviting the user to scratch their first state.

### 3.5. Persistence & Data Storage
- **FR-10 (Client-Side Offline Persistence)**:
  - All unlocked states, POIs, notes, and uploaded photos (as Blob/Base64) must be stored locally in the browser using `IndexedDB`.
  - Application works 100% offline without requiring external internet access or servers.
- **FR-11 (Optional Backend API Integration)**:
  - A clean abstraction layer (`StorageService`) allows running the app either pure client-side (IndexedDB) or connecting to a lightweight REST backend (Node.js/Express) to persist images on local disk (`/uploads`) for multi-device sync or kiosk deployment.
- **FR-12 (Data Backup & Reset)**:
  - Single-click "Export Travel Log" (JSON download including images or references).
  - Single-click "Import Travel Log" to restore state.
  - "Reset All Scratch Layers" with double-confirmation.

---

## 4. Non-Functional Requirements (NFR)

### 4.1. Accessibility (WCAG 2.1 AA Compliance)
- **NFR-01 (Semantic Structure)**: The application must use standard semantic HTML (`<header>`, `<main>`, `<section>`, `<nav>`, `<dialog>`, `<button>`).
- **NFR-02 (Keyboard Navigation)**: All interactive states on the map and POI lists must be focusable (`tabIndex={0}`) and operable using `Enter` and `Space`.
- **NFR-03 (Screen Reader Compatibility)**:
  - Every state SVG element must include `role="button"`, `aria-label="[State Name], [Region] - [Unlocked / Locked]"`, and `aria-pressed={isUnlocked}`.
  - Modal dialogs must trap focus, handle `Escape` to close, and use `aria-labelledby` and `aria-modal="true"`.
- **NFR-04 (Color Contrast)**: Text rendered over silver-gray locked areas and colored unlocked areas must maintain a contrast ratio of at least 4.5:1 against its background.

### 4.2. Display & Layout Specifications
- **NFR-05 (Portrait Monitor Target)**:
  - Optimized for vertical orientation displays: 1080×1920 (9:16 aspect ratio).
  - Fixed-ratio or fluid layout scaling: Upper 35% reserved for Slideshow, Lower 65% for the Scratch Map canvas.
- **NFR-06 (Responsive Adaptation)**:
  - On horizontal screens (1920×1080 desktop), the layout seamlessly switches to a 2-column grid: Slideshow and recent memories on the left (40%), Map poster on the right (60%).
  - Fully functional on touchscreens (kiosk touch monitors, tablets, iPads).

### 4.3. Performance & Quality
- **NFR-07 (Instant Vector Interactivity)**: Vector map interactions (hover, click, reveal animation) must run at 60 FPS without layout shifts (CLS = 0).
- **NFR-08 (Zero Untested Code)**: All ViewModel hooks and View components must be covered by automated unit tests using Vitest and React Testing Library.

---

## 5. Architectural Pattern: Strict MVVM

Following frontend engineering rules, the codebase strictly separates concerns into **Model**, **View**, and **ViewModel**:

```
src/
├── models/                     # Pure TypeScript domain models (Zero React / JSX)
│   ├── Destination.ts          # State, City, Beach, Landmark domain entities
│   ├── TravelLog.ts            # Visit record, date, photo metadata
│   ├── RegionColor.ts          # Color palettes and visual styles
│   └── schemas/                # Zod runtime validation schemas
│
├── services/                   # Pure TypeScript services & storage
│   ├── StorageService.ts       # Interface for persistence
│   ├── IndexedDBStorage.ts     # Client-side IndexedDB implementation
│   ├── ApiStorage.ts           # Optional backend REST implementation
│   └── ImageCompressor.ts      # Canvas-based client photo optimizer
│
├── viewmodels/                 # Custom React hooks (Zero JSX, Zero HTML/CSS)
│   ├── useBrazilMapViewModel.ts       # Map states, selection, reveal logic
│   ├── useSlideshowViewModel.ts       # Carousel rotation, timing, photo index
│   └── useUnlockModalViewModel.ts     # Modal dialog state, file upload handler
│
├── views/                      # Pure React functional components (JSX/TSX)
│   ├── AppView.tsx                    # Root layout (Portrait Kiosk / Desktop)
│   ├── components/
│   │   ├── slideshow/
│   │   │   ├── PhotoSlideshow.tsx     # Hero photo viewer & thumbnail carousel
│   │   │   └── SlideshowControls.tsx  # Play/pause/step controls
│   │   ├── map/
│   │   │   ├── BrazilMapPoster.tsx    # Poster frame container
│   │   │   ├── BrazilMapSvg.tsx       # 27 state SVG paths & pins
│   │   │   ├── CategorySidebar.tsx    # Ilhas, Cidades, Praias lists
│   │   │   └── StateFlagsBar.tsx      # Bottom ribbon with 27 state flags
│   │   └── modal/
│   │       ├── UnlockDestinationModal.tsx # Confirmation & upload dialog
│   │       └── PhotoDropzone.tsx          # Accessible file uploader
│
└── tests/                      # Synchronized unit tests (Vitest + RTL)
    ├── models/
    ├── viewmodels/
    └── views/
```

---

## 6. Domain Model & TypeScript Contracts

```typescript
/**
 * Brazilian official geographic regions.
 */
export type BrazilianRegion = 
  | 'North' 
  | 'Northeast' 
  | 'Center-West' 
  | 'Southeast' 
  | 'South';

/**
 * Two-letter Federative Unit code.
 */
export type BrazilStateCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';

/**
 * Category of destination or point of interest.
 */
export type DestinationCategory = 
  | 'State' 
  | 'Beach' 
  | 'FamousCity' 
  | 'TouristSpot' 
  | 'Island';

/**
 * Core destination entity.
 */
export interface Destination {
  readonly id: string;
  readonly code?: BrazilStateCode;
  readonly name: string;
  readonly category: DestinationCategory;
  readonly region: BrazilianRegion;
  readonly stateCode: BrazilStateCode;
  readonly isUnlocked: boolean;
  readonly unlockedAt?: string; // ISO 8601
  readonly unlockedColor: string; // Regional hex color
  readonly coordinates?: { readonly x: number; readonly y: number };
}

/**
 * Uploaded photo record attached to an unlocked destination.
 */
export interface TravelPhoto {
  readonly id: string;
  readonly destinationId: string;
  readonly dataUrl: string; // Base64 data URL or local object URL
  readonly fileName: string;
  readonly caption?: string;
  readonly travelDate?: string;
  readonly createdAt: string;
}

/**
 * Complete travel log dataset for export/import.
 */
export interface TravelLogDataset {
  readonly schemaVersion: '1.0.0';
  readonly unlockedDestinationIds: string[];
  readonly photos: TravelPhoto[];
  readonly lastModified: string;
}
```

---

## 7. ViewModel Contracts

### 7.1. Map ViewModel (`useBrazilMapViewModel`)

```typescript
export interface BrazilMapState {
  readonly destinations: Record<string, Destination>;
  readonly selectedStateCode: BrazilStateCode | null; // null = global view; string = focused state
  readonly displayedDestinations: Destination[]; // Computed: all unlocked POIs if null, or POIs of selected state
  readonly unlockedCount: number;
  readonly totalStatesCount: number;
  readonly progressPercentage: number;
  
  // Minimalist Unlock Modal state
  readonly isUnlockModalOpen: boolean;
  readonly pendingUnlockDestination: Destination | null;

  // Dedicated Photo Upload Modal state (opened via '+' SVG button)
  readonly isPhotoModalOpen: boolean;
  readonly targetPhotoDestination: Destination | null;
}

export interface BrazilMapActions {
  /**
   * Selects a state on the vector map to filter the sidebars, or passes null to deselect.
   */
  readonly handleSelectState: (stateCode: BrazilStateCode | null) => void;

  /**
   * Requests opening the minimalist confirmation modal for a given destination.
   */
  readonly handleRequestUnlock: (destination: Destination) => void;

  /**
   * Confirms the unlock: unlocks the destination and cascades to unlock the parent state!
   */
  readonly handleConfirmUnlock: () => Promise<void>;

  /**
   * Cancels the unlock modal.
   */
  readonly handleCancelUnlock: () => void;

  /**
   * Opens the dedicated photo upload modal for an unlocked destination (via '+' button).
   */
  readonly handleOpenPhotoUpload: (destination: Destination) => void;

  /**
   * Closes the photo upload modal.
   */
  readonly handleClosePhotoModal: () => void;

  /**
   * Saves uploaded travel photos and registers them in IndexedDB and the slideshow.
   */
  readonly handleSavePhoto: (destinationId: string, photo: File, caption?: string) => Promise<void>;

  /**
   * Resets a destination or resets all scratch layers.
   */
  readonly handleResetDestination: (destinationId: string) => Promise<void>;
  readonly handleResetAll: () => Promise<void>;
}

export interface BrazilMapViewModelContract {
  readonly state: BrazilMapState;
  readonly actions: BrazilMapActions;
}
```

### 7.2. Slideshow ViewModel (`useSlideshowViewModel`)

```typescript
export interface SlideshowState {
  readonly photos: TravelPhoto[];
  readonly activeIndex: number;
  readonly activePhoto: TravelPhoto | null;
  readonly isPlaying: boolean;
  readonly durationMs: number;
}

export interface SlideshowActions {
  readonly handleNext: () => void;
  readonly handlePrevious: () => void;
  readonly handleSelectIndex: (index: number) => void;
  readonly handleTogglePlayPause: () => void;
}

export interface SlideshowViewModelContract {
  readonly state: SlideshowState;
  readonly actions: SlideshowActions;
}
```

---

## 8. Technology Stack & Decision Matrix

| Dimension | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 + TypeScript 5** | Declarative component model, strict typing, high performance for dynamic SVG rendering. |
| **Bundler & Tooling** | **Vite 6** | Ultra-fast HMR, instant build times, native ES module support. |
| **Architecture** | **Strict MVVM** | Decouples business & persistence logic from React rendering; enables isolated unit testing. |
| **Map Rendering** | **Custom Interactive SVG Paths** | Vector scalability, precise bounding boxes, zero external mapping library overhead (e.g. Leaflet/Mapbox not required for poster style). |
| **Storage (Default)** | **IndexedDB (via `idb` / Dexie)** | Local, zero-cost, persistent storage supporting high-resolution image blobs up to several gigabytes. |
| **Storage (Optional Server)** | **Node.js / Express or Fastify** | Optional 1-file backend if users choose to store photos on a local disk directory for a public totem kiosk. |
| **Styling** | **Tailwind CSS + CSS Modules** | Utility-first responsive design, hardware-accelerated transitions, dark theme poster aesthetics. |
| **Testing** | **Vitest + React Testing Library** | Fast testing with JSDOM and `@testing-library/user-event` testing accessible roles. |

---

## 9. Implementation Roadmap

1. **Phase 1: Project Setup & Models**
   - Initialize Vite + React + TypeScript project with strict linting and Vitest test harness.
   - Implement `models/`, Zod schemas, and `IndexedDBStorage` service with unit tests.
2. **Phase 2: Vector Brazil Map & Scratch-Off Engine**
   - Import and optimize Brazil 27-state SVG coordinates.
   - Implement `useBrazilMapViewModel` hook with locked (silver) and unlocked (color) states.
   - Build `<BrazilMapPoster />`, `<BrazilMapSvg />`, and `<CategorySidebar />`.
3. **Phase 3: Confirmation Dialog & Image Upload**
   - Implement `<UnlockDestinationModal />` and `<PhotoDropzone />`.
   - Implement client-side image compression and IndexedDB photo storage.
4. **Phase 4: Upper Slideshow Presentation**
   - Implement `useSlideshowViewModel` with auto-play, timer, and smooth cross-fade transitions.
   - Build `<PhotoSlideshow />` hero view and thumbnail strip.
5. **Phase 5: Responsive Portrait / Landscape Polishing & WCAG Audit**
   - Calibrate layout for 1080×1920 vertical display.
   - Full keyboard navigation and screen reader verification (WCAG 2.1 AA+).
   - Export / Import travel dataset functionality.
