import { FastifyInstance } from 'fastify';

export interface AppConfig {
  jellyfinServerUrl: string;
  jellyfinApiKey: string;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

export interface JwtPayload {
  jti: string;
  userId: string;
  username: string;
}

// Session stored in memory
export interface Session {
  jellyfinUserId: string;
  jellyfinToken: string;
  username: string;
  createdAt: number;
}

// Simplified item DTO matching frontend
export interface SimpleItemDto {
  id?: string;
  parentId?: string | null;
  name?: string | null;
  date?: string | null;
  communityRating?: number | null;
  productionYear?: number | null;
  people?: PersonDto[] | null;
  genres?: string[] | null;
  genreItems?: { Name?: string; Id?: string }[] | null;
  durationSeconds?: number;
}

export interface PersonDto {
  Name?: string;
  Id?: string;
  Role?: string;
  Type?: string;
  PrimaryImageTag?: string;
}

// Movie with playback stats
export interface MovieWithStats extends SimpleItemDto {
  playCount: number;
  completedWatches: number;
  totalWatchTimeSeconds: number;
}

// Show with episode stats
export interface ShowWithStats {
  showName: string;
  episodeCount: number;
  playbackTime: number;
  item: SimpleItemDto;
}

// Device stats
export interface DeviceStats {
  deviceUsage: { name: string; count: number }[];
  browserUsage: { name: string; count: number }[];
  osUsage: { name: string; count: number }[];
}

// Punch card data
export interface PunchCardData {
  dayOfWeek: number;
  hour: number;
  count: number;
}

// Calendar data
export interface CalendarData {
  value: number;
  day: string;
}

// Live TV channel
export interface LiveTvChannel {
  channelName: string;
  duration: number;
}

// Monthly show stats
export interface MonthlyShowStats {
  month: string; // ISO date string
  topShow: {
    item: SimpleItemDto;
    watchTimeMinutes: number;
  };
  totalWatchTimeMinutes: number;
}

// Unfinished show
export interface UnfinishedShow {
  item: SimpleItemDto;
  watchedEpisodes: number;
  totalEpisodes: number;
  lastWatchedDate: string; // ISO date string
}

// Actor with appearances
export interface ActorStats {
  name: string;
  count: number;
  details: PersonDto;
  seenInMovies: SimpleItemDto[];
  seenInShows: SimpleItemDto[];
}

// Timeframe for queries
export interface Timeframe {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
