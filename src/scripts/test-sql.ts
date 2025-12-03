/* eslint-disable */
import { config } from "dotenv";
config();

(global as any).alert = (msg: string) => console.error("Alert:", msg);
(global as any).window = {
  ENV: {
    JELLYFIN_SERVER_URL: process.env.VITE_JELLYFIN_SERVER_URL,
    JELLYFIN_API_KEY: process.env.VITE_JELLYFIN_API_KEY,
  }
};

const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) { return this.store[key] || null; },
  setItem(key: string, value: string) { this.store[key] = value; },
  removeItem(key: string) { delete this.store[key]; },
};

(global as any).localStorage = localStorageMock;
localStorageMock.setItem("jellyfinUsername", "john");
localStorageMock.setItem("jellyfinPassword", "getthejelly");

import { authenticateByUserName } from "../lib/jellyfin-api.js";
import { playbackReportingSqlRequest, getCurrentUserId, getStartDate, getEndDate, formatDateForSql } from "../lib/queries/utils.js";

async function testSQL() {
  await authenticateByUserName(process.env.VITE_JELLYFIN_SERVER_URL || "", "john", "getthejelly");
  
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  console.log("\n📊 Testing PlaybackActivity for different ItemTypes...\n");

  // Test Episodes
  const episodeQuery = `
    SELECT COUNT(*) as count FROM PlaybackActivity 
    WHERE UserId = "${userId}" 
    AND ItemType = "Episode"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
  `;
  const episodeData = await playbackReportingSqlRequest(episodeQuery);
  console.log("Episodes:", episodeData.results[0]);

  // Test Seasons
  const seasonQuery = `
    SELECT COUNT(*) as count FROM PlaybackActivity 
    WHERE UserId = "${userId}" 
    AND ItemType = "Season"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
  `;
  const seasonData = await playbackReportingSqlRequest(seasonQuery);
  console.log("Seasons:", seasonData.results[0]);

  // Test Series
  const seriesQuery = `
    SELECT COUNT(*) as count FROM PlaybackActivity 
    WHERE UserId = "${userId}" 
    AND ItemType = "Series"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
  `;
  const seriesData = await playbackReportingSqlRequest(seriesQuery);
  console.log("Series:", seriesData.results[0]);

  console.log("\n✅ Test complete!");
}

testSQL();
