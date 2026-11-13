/**
 * Uploaded travel photo entity for the slideshow showcase.
 */
export interface TravelPhoto {
  readonly id: string;
  readonly destinationId: string;
  readonly destinationName: string;
  readonly stateCode: string;
  readonly imageUrl: string;
  readonly caption?: string;
  readonly travelDate?: string;
  readonly createdAt: string;
}

/**
 * Complete serializable travel dataset.
 */
export interface TravelLogDataset {
  readonly schemaVersion: '1.2.0';
  readonly unlockedDestinationIds: string[];
  readonly photos: TravelPhoto[];
  readonly lastModified: string;
}
