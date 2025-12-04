// Backend API client for secure communication with the proxy server

import { getCacheValue, setCacheValue } from "./cache";
import { getCurrentTimeframe } from "./timeframe";

export const BACKEND_JWT_CACHE_KEY = "backendJwt";
export const BACKEND_USER_CACHE_KEY = "backendUser";

// Types matching backend responses
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

export interface MovieWithStats extends SimpleItemDto {
  playCount: number;
  completedWatches: number;
  totalWatchTimeSeconds: number;
}

export interface ShowWithStats {
  showName: string;
  episodeCount: number;
  playbackTime: number;
  item: SimpleItemDto;
}

export interface DeviceStats {
  deviceUsage: { name: string; count: number }[];
  browserUsage: { name: string; count: number }[];
  osUsage: { name: string; count: number }[];
}

export interface PunchCardData {
  dayOfWeek: number;
  hour: number;
  count: number;
}

export interface CalendarData {
  value: number;
  day: string;
}

export interface LiveTvChannel {
  channelName: string;
  duration: number;
}

export interface MonthlyShowStats {
  month: string;
  topShow: {
    item: SimpleItemDto;
    watchTimeMinutes: number;
  };
  totalWatchTimeMinutes: number;
}

export interface UnfinishedShow {
  item: SimpleItemDto;
  watchedEpisodes: number;
  totalEpisodes: number;
  lastWatchedDate: string;
}

export interface ActorStats {
  name: string;
  count: number;
  details: PersonDto;
  seenInMovies: SimpleItemDto[];
  seenInShows: SimpleItemDto[];
}

// Get backend URL from environment
export const getBackendUrl = (): string => {
  // Check for runtime environment (Docker)
  if (typeof window !== "undefined" && "ENV" in window) {
    const env = (window as { ENV?: Record<string, string> }).ENV;
    if (env?.BACKEND_URL) {
      return env.BACKEND_URL;
    }
  }
  // Fallback to Vite env (development)
  const url = import.meta.env.VITE_BACKEND_URL || "";
  if (!url) {
    console.error("BACKEND_URL is not configured. Set VITE_BACKEND_URL (dev) or BACKEND_URL (production).");
  }
  return url;
};

// Get stored JWT token
export const getJwt = (): string | null => {
  return getCacheValue(BACKEND_JWT_CACHE_KEY);
};

// Store JWT token
export const setJwt = (token: string): void => {
  setCacheValue(BACKEND_JWT_CACHE_KEY, token);
};

// Clear JWT token (logout)
export const clearJwt = (): void => {
  localStorage.removeItem(BACKEND_JWT_CACHE_KEY);
  localStorage.removeItem(BACKEND_USER_CACHE_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getJwt();
};

// Login with username and password
export const login = async (
  username: string,
  password: string
): Promise<{ id: string; name: string }> => {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }

  const response = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Login failed" }));
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json() as {
    token: string;
    user: { id: string; name: string };
  };

  setJwt(data.token);
  setCacheValue(BACKEND_USER_CACHE_KEY, JSON.stringify(data.user));

  return data.user;
};

// Logout
export const logout = async (): Promise<void> => {
  const backendUrl = getBackendUrl();
  const jwt = getJwt();

  if (backendUrl && jwt) {
    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
    } catch {
      // Ignore errors during logout
    }
  }

  clearJwt();
};

// Verify current session
export const verifySession = async (): Promise<boolean> => {
  const backendUrl = getBackendUrl();
  const jwt = getJwt();

  if (!backendUrl || !jwt) {
    return false;
  }

  try {
    const response = await fetch(`${backendUrl}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      clearJwt();
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Make authenticated request to backend
export const backendFetch = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const backendUrl = getBackendUrl();
  const jwt = getJwt();

  if (!backendUrl) {
    throw new Error("Backend URL is not configured");
  }

  if (!jwt) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (response.status === 401) {
    clearJwt();
    throw new Error("Session expired");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
};

// Helper to build query string with timeframe
function buildTimeframeQuery(): string {
  const timeframe = getCurrentTimeframe();
  const startDate = timeframe.startDate.toISOString().split('T')[0];
  const endDate = timeframe.endDate.toISOString().split('T')[0];
  return `?startDate=${startDate}&endDate=${endDate}`;
}

// API Functions

export const getCurrentUser = async (): Promise<{ id: string; name: string }> => {
  return backendFetch('/api/user');
};

export const fetchMovies = async (): Promise<MovieWithStats[]> => {
  return backendFetch(`/api/movies${buildTimeframeQuery()}`);
};

export const fetchShows = async (): Promise<ShowWithStats[]> => {
  return backendFetch(`/api/shows${buildTimeframeQuery()}`);
};

export const fetchAudio = async (): Promise<SimpleItemDto[]> => {
  return backendFetch(`/api/audio${buildTimeframeQuery()}`);
};

export const fetchMusicVideos = async (): Promise<SimpleItemDto[]> => {
  return backendFetch(`/api/music-videos${buildTimeframeQuery()}`);
};

export const fetchLiveTv = async (): Promise<LiveTvChannel[]> => {
  return backendFetch(`/api/live-tv${buildTimeframeQuery()}`);
};

export const fetchDeviceStats = async (): Promise<DeviceStats> => {
  return backendFetch(`/api/device-stats${buildTimeframeQuery()}`);
};

export const fetchPunchCard = async (): Promise<PunchCardData[]> => {
  return backendFetch(`/api/punch-card${buildTimeframeQuery()}`);
};

export const fetchCalendar = async (): Promise<CalendarData[]> => {
  return backendFetch('/api/calendar');
};

export const fetchMonthlyShows = async (): Promise<MonthlyShowStats[]> => {
  return backendFetch(`/api/monthly-shows${buildTimeframeQuery()}`);
};

export const fetchUnfinishedShows = async (): Promise<UnfinishedShow[]> => {
  return backendFetch(`/api/unfinished-shows${buildTimeframeQuery()}`);
};

export const fetchActors = async (): Promise<ActorStats[]> => {
  return backendFetch(`/api/actors${buildTimeframeQuery()}`);
};

export const fetchWatchedOnDate = async (date: string): Promise<SimpleItemDto[]> => {
  return backendFetch(`/api/watched-on-date?date=${date}`);
};
