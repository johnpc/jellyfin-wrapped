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

async function listTables() {
  await authenticateByUserName(process.env.VITE_JELLYFIN_SERVER_URL || "", "john", "getthejelly");
  
  console.log("\n📊 Listing available SQL tables...\n");

  // SQLite query to list all tables
  const query = `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`;
  const data = await playbackReportingSqlRequest(query);
  
  console.log("Available tables:");
  data.results.forEach((row: string[]) => {
    console.log("  -", row[0]);
  });

  console.log("\n✅ Done!");
}

listTables();
