export interface Episode {
  id: number;
  title: string;
  filmUrlHls: string;
  bannerUrl: string;
  episodeNumber: number;
  trailerUrlHls: string | null;
  isLock?: boolean;
}

export interface Category {
  id: number;
  color: string | null;
  textColor: string | null;
  title: string;
}

export interface VipMovie {
  id: number;
  posterUrl: string;
  title: string;
  description: string;
  statusRelease: string;
  releaseDate: string;
  favoriteNumber: number;
  episodeCount: number;
  watchFreeDate: string | null;
  languageSupport: string[];
  isFavorite?: boolean;
  episodes: Episode[];
  category: Category[];
}

export interface VipMoviesResponse {
  statusCode: number;
  reqId: string;
  message: string;
  data: VipMovie[];
}
