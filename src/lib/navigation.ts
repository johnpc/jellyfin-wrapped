// Navigation configuration - defines all possible pages and their order
export const ALL_PAGES = [
  { path: "/TopTen", name: "Top 10", dataKey: "topTen" },
  { path: "/movies", name: "Movies", dataKey: "movies" },
  { path: "/shows", name: "TV Shows", dataKey: "shows" },
  { path: "/audio", name: "Music", dataKey: "audio" },
  { path: "/music-videos", name: "Music Videos", dataKey: "musicVideos" },
  { path: "/actors", name: "Favorite Actors", dataKey: "actors" },
  { path: "/genres", name: "Genres", dataKey: "genres" },
  { path: "/tv", name: "Live TV", dataKey: "liveTv" },
  { path: "/critically-acclaimed", name: "Critically Acclaimed", dataKey: "criticallyAcclaimed" },
  { path: "/oldest-movie", name: "Oldest Movie", dataKey: "oldestMovie" },
  { path: "/oldest-show", name: "Oldest Show", dataKey: "oldestShow" },
  { path: "/holidays", name: "Holiday Watching", dataKey: "holidays" },
  { path: "/show-of-the-month", name: "Show of the Month", dataKey: "showOfTheMonth" },
  { path: "/unfinished-shows", name: "Unfinished Shows", dataKey: "unfinishedShows" },
  { path: "/device-stats", name: "Device Stats", dataKey: "deviceStats" },
  { path: "/punch-card", name: "Activity Calendar", dataKey: "punchCard" },
] as const;

export type PageDataKey = typeof ALL_PAGES[number]["dataKey"];

// Storage key for available pages
const AVAILABLE_PAGES_KEY = "jellyfin-wrapped-available-pages";

// Set which pages have content (called from LoadingPage after data is fetched)
export function setAvailablePages(availableDataKeys: PageDataKey[]) {
  const availablePaths = ALL_PAGES
    .filter(page => availableDataKeys.includes(page.dataKey))
    .map(page => page.path);
  
  sessionStorage.setItem(AVAILABLE_PAGES_KEY, JSON.stringify(availablePaths));
}

// Get the list of available page paths
export function getAvailablePages(): string[] {
  const stored = sessionStorage.getItem(AVAILABLE_PAGES_KEY);
  if (!stored) {
    // Default to all pages if not set
    return ALL_PAGES.map(page => page.path);
  }
  return JSON.parse(stored) as string[];
}

// Get the next page with content
export function getNextPage(currentPath: string): string | null {
  const availablePages = getAvailablePages();
  const currentIndex = availablePages.indexOf(currentPath);
  
  if (currentIndex === -1 || currentIndex === availablePages.length - 1) {
    return null; // No next page or current page not found
  }
  
  return availablePages[currentIndex + 1];
}

// Get the previous page with content
export function getPreviousPage(currentPath: string): string | null {
  const availablePages = getAvailablePages();
  const currentIndex = availablePages.indexOf(currentPath);
  
  if (currentIndex <= 0) {
    return null; // No previous page or current page not found
  }
  
  return availablePages[currentIndex - 1];
}

// Check if a page should be shown (has content)
export function isPageAvailable(path: string): boolean {
  const availablePages = getAvailablePages();
  return availablePages.includes(path);
}

// Get navigation items for the menu (only pages with content)
export function getNavigationItems() {
  const availablePages = getAvailablePages();
  return ALL_PAGES.filter(page => availablePages.includes(page.path));
}

