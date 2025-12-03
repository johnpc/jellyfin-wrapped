/* eslint-disable */
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Mock alert for Node.js
(global as any).alert = (msg: string) => console.error("Alert:", msg);

// Mock window for Node.js environment
(global as any).window = {
  ENV: {
    JELLYFIN_SERVER_URL: process.env.VITE_JELLYFIN_SERVER_URL,
    JELLYFIN_API_KEY: process.env.VITE_JELLYFIN_API_KEY,
  }
};

// Mock localStorage for Node.js environment
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
};

(global as any).localStorage = localStorageMock;

// Set authentication credentials
localStorageMock.setItem("jellyfinUsername", "john");
localStorageMock.setItem("jellyfinPassword", "getthejelly");

import { authenticateByUserName } from "../lib/jellyfin-api.js";
import { listMovies } from "../lib/queries/movies.js";
import { listShows } from "../lib/queries/shows.js";
import { listFavoriteActors } from "../lib/queries/actors.js";
import { listAudio } from "../lib/queries/audio.js";
import { listLiveTvChannels } from "../lib/queries/livetv.js";
import { getTopGenre } from "../lib/genre-helpers.js";
import { getUnfinishedShows } from "../lib/queries/advanced.js";

async function validateData() {
  console.log("🔍 Validating data fetching...\n");
  console.log("Server URL:", process.env.VITE_JELLYFIN_SERVER_URL);

  try {
    console.log("🔐 Authenticating...");
    const authStart = performance.now();
    await authenticateByUserName(process.env.VITE_JELLYFIN_SERVER_URL || "", "john", "getthejelly");
    const authTime = ((performance.now() - authStart) / 1000).toFixed(2);
    console.log(`✅ Authenticated (${authTime}s)\n`);

    console.log("📽️  Fetching movies...");
    const moviesStart = performance.now();
    const movies = await listMovies();
    const moviesTime = ((performance.now() - moviesStart) / 1000).toFixed(2);
    console.log(`✅ Movies: ${movies.length} items (${moviesTime}s)\n`);

    console.log("📺 Fetching shows...");
    const showsStart = performance.now();
    const shows = await listShows();
    const showsTime = ((performance.now() - showsStart) / 1000).toFixed(2);
    console.log(`✅ Shows: ${shows.length} items (${showsTime}s)\n`);

    console.log("🎭 Fetching favorite actors...");
    const actorsStart = performance.now();
    const actors = await listFavoriteActors();
    const actorsTime = ((performance.now() - actorsStart) / 1000).toFixed(2);
    console.log(`✅ Actors: ${actors.length} items (${actorsTime}s)\n`);

    console.log("🎵 Fetching audio...");
    const audioStart = performance.now();
    const audio = await listAudio();
    const audioTime = ((performance.now() - audioStart) / 1000).toFixed(2);
    console.log(`✅ Audio: ${audio.length} items (${audioTime}s)\n`);

    console.log("📡 Fetching live TV channels...");
    const liveTvStart = performance.now();
    const liveTv = await listLiveTvChannels();
    const liveTvTime = ((performance.now() - liveTvStart) / 1000).toFixed(2);
    console.log(`✅ Live TV: ${liveTv.length} items (${liveTvTime}s)\n`);

    console.log("🎬 Fetching top genre...");
    const genreStart = performance.now();
    console.log(`   Debug: Movies with genres: ${movies.filter(m => m.genres?.length).length}`);
    console.log(`   Debug: Shows with genres: ${shows.filter(s => s.item?.genres?.length).length}`);
    console.log(`   Debug: Sample movie genres:`, movies[0]?.genres);
    console.log(`   Debug: Sample show genres:`, shows[0]?.item?.genres);
    const topGenre = getTopGenre(movies, shows.map(s => s.item));
    const genreTime = ((performance.now() - genreStart) / 1000).toFixed(2);
    console.log(`✅ Top Genre: ${topGenre?.genre || 'None'} with ${topGenre?.items.length || 0} items (${genreTime}s)\n`);

    console.log("📺 Fetching unfinished shows...");
    const unfinishedStart = performance.now();
    const unfinishedShows = await getUnfinishedShows();
    const unfinishedTime = ((performance.now() - unfinishedStart) / 1000).toFixed(2);
    console.log(`✅ Unfinished Shows: ${unfinishedShows.length} items (${unfinishedTime}s)\n`);

    console.log("✨ All data validation passed!");
    console.log("\n📊 Performance Summary:");
    console.log(`   Movies: ${moviesTime}s ${parseFloat(moviesTime) > 10 ? '⚠️  SLOW' : '✓'}`);
    console.log(`   Shows: ${showsTime}s ${parseFloat(showsTime) > 10 ? '⚠️  SLOW' : '✓'}`);
    console.log(`   Actors: ${actorsTime}s ${parseFloat(actorsTime) > 10 ? '⚠️  SLOW' : '✓'}`);
    console.log(`   Audio: ${audioTime}s ${parseFloat(audioTime) > 10 ? '⚠️  SLOW' : '✓'}`);
    console.log(`   Live TV: ${liveTvTime}s ${parseFloat(liveTvTime) > 10 ? '⚠️  SLOW' : '✓'}`);
    console.log(`   Genre: ${genreTime}s ${parseFloat(genreTime) > 10 ? '⚠️  SLOW' : '✓'}`);
    console.log(`   Unfinished Shows: ${unfinishedTime}s ${parseFloat(unfinishedTime) > 10 ? '⚠️  SLOW' : '✓'}`);
  } catch (error) {
    console.error("❌ Validation failed:", error);
    throw error;
  }
}

validateData();
