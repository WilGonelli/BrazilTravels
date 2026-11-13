import { Destination, BrazilianRegion } from './Destination';
import { TravelPhoto } from './TravelPhoto';

/**
 * Traveler achievement category.
 */
export type AchievementCategory = 'milestone' | 'nature' | 'culture' | 'geography' | 'photos';

/**
 * Traveler badge / achievement entity.
 */
export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: AchievementCategory;
  readonly isUnlocked: boolean;
  readonly currentCount: number;
  readonly requiredCount: number;
  readonly progressPercentage: number;
}

/**
 * Pure domain function to evaluate traveler achievements from unlocked destinations and photos.
 *
 * @param destinations - Current dictionary of all destinations.
 * @param photos - Current collection of recorded travel photos.
 * @returns Evaluated list of achievements with progress metrics.
 */
export function calculateAchievements(
  destinations: Record<string, Destination>,
  photos: readonly TravelPhoto[]
): Achievement[] {
  const allDestinations = Object.values(destinations);
  const unlocked = allDestinations.filter((d) => d.isUnlocked);
  const unlockedPoints = unlocked.filter((d) => d.category !== 'State');

  // Counts by category
  const beachCount = unlockedPoints.filter((d) => d.category === 'Beach').length;
  const waterfallCount = unlockedPoints.filter((d) => d.category === 'Waterfall').length;
  const cultureCount = unlockedPoints.filter((d) => d.category === 'FamousCity' || d.category === 'TouristSpot').length;

  // Unlocked regions
  const unlockedRegions = new Set<BrazilianRegion>(unlocked.map((d) => d.region));

  // Midwest count
  const midwestCount = unlocked.filter((d) => d.region === 'Centro-Oeste').length;

  // Photo counts
  const totalPhotos = photos.length;
  const favoritePhotos = photos.filter((p) => Boolean(p.isFavorite)).length;

  // Total points progress
  const totalPoints = allDestinations.filter((d) => d.category !== 'State').length;
  const explorerPercentage = totalPoints > 0 ? (unlockedPoints.length / totalPoints) * 100 : 0;

  const rawBadges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    current: number;
    required: number;
  }> = [
    {
      id: 'first-step',
      title: 'Primeiro Passo',
      description: 'Desbloqueie seu primeiro estado ou destino turístico.',
      icon: '🇧🇷',
      category: 'milestone',
      current: unlocked.length > 0 ? 1 : 0,
      required: 1,
    },
    {
      id: 'sea-master',
      title: 'Mestre das Águas',
      description: 'Visite pelo menos 5 praias brasileiras.',
      icon: '🌊',
      category: 'nature',
      current: beachCount,
      required: 5,
    },
    {
      id: 'waterfall-hunter',
      title: 'Caçador de Cachoeiras',
      description: 'Visite e desbrave pelo menos 3 cachoeiras paradisíacas.',
      icon: '🏞️',
      category: 'nature',
      current: waterfallCount,
      required: 3,
    },
    {
      id: 'culture-historian',
      title: 'Historiador Cultural',
      description: 'Visite pelo menos 5 cidades históricas ou monumentos culturais.',
      icon: '🏛️',
      category: 'culture',
      current: cultureCount,
      required: 5,
    },
    {
      id: 'cerrado-explorer',
      title: 'Desbravador do Centro-Oeste',
      description: 'Visite e desbloqueie pelo menos 3 pontos turísticos no Centro-Oeste.',
      icon: '🌿',
      category: 'geography',
      current: midwestCount,
      required: 3,
    },
    {
      id: 'five-regions',
      title: 'Expedição 5 Regiões',
      description: 'Desbloqueie pelo menos 1 destino em cada uma das 5 regiões do Brasil.',
      icon: '🧭',
      category: 'geography',
      current: unlockedRegions.size,
      required: 5,
    },
    {
      id: 'memory-keeper',
      title: 'Guardião de Memórias',
      description: 'Cadastre pelo menos 5 fotos de viagens inesquecíveis.',
      icon: '📸',
      category: 'photos',
      current: totalPhotos,
      required: 5,
    },
    {
      id: 'golden-favorites',
      title: 'Coleção Dourada',
      description: 'Marque pelo menos 3 fotos memoráveis como favoritas.',
      icon: '⭐',
      category: 'photos',
      current: favoritePhotos,
      required: 3,
    },
    {
      id: 'grand-explorer',
      title: 'Grande Explorador',
      description: 'Desbloqueie pelo menos 25% de todos os pontos turísticos catalogados.',
      icon: '👑',
      category: 'milestone',
      current: Math.round(explorerPercentage),
      required: 25,
    },
  ];

  return rawBadges.map((badge) => {
    const isUnlocked = badge.current >= badge.required;
    const progressPercentage = Math.min(100, Math.round((badge.current / badge.required) * 100));

    return {
      id: badge.id,
      title: badge.title,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      isUnlocked,
      currentCount: Math.min(badge.current, badge.required),
      requiredCount: badge.required,
      progressPercentage,
    };
  });
}
