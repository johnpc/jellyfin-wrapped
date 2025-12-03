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
import { playbackReportingSqlRequest } from "../lib/queries/utils.js";

async function checkColumns() {
  await authenticateByUserName(process.env.VITE_JELLYFIN_SERVER_URL || "", "john", "getthejelly");
  
  const testQuery = `SELECT * FROM PlaybackActivity LIMIT 1`;
  const testData = await playbackReportingSqlRequest(testQuery);
  console.log("Available columns:", JSON.stringify(testData.colums, null, 2));
}

checkColumns();
