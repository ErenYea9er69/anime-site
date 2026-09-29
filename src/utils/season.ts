export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface SeasonInfo {
  season: AnimeSeason;
  year: number;
  label: string;
}

export function getCurrentSeasonInfo(): SeasonInfo {
  const now = new Date();
  const month = now.getMonth(); // 0 to 11
  const year = now.getFullYear();

  let season: AnimeSeason;
  if (month >= 0 && month <= 2) {
    season = 'WINTER';
  } else if (month >= 3 && month <= 5) {
    season = 'SPRING';
  } else if (month >= 6 && month <= 8) {
    season = 'SUMMER';
  } else {
    season = 'FALL';
  }

  const label = `${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`;
  return { season, year, label };
}
