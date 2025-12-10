// tools/fetch-api-ids.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFile, writeFile } from "fs/promises";
import path from "path";

const API_BASE = "https://v3.football.api-sports.io";
const PLAYERS_PATH = path.join(process.cwd(), "data", "players.json");

// -----------------------------
// Mapping helpers
// -----------------------------

// Fix club names that API-Football stores differently
const teamNameMap: Record<string, string> = {
  "OGC Nice": "Nice",
  "U.S. Sassuolo Calcio": "Sassuolo",
  // add more overrides here if needed
};

// Basic shape of your players.json objects
type PlayerJson = {
  id?: number | string;
  name: string;
  clubTeam?: string;
  apiTeamId?: number;
  apiPlayerId?: number; // now only ever set manually
  [key: string]: any;
};

// -----------------------------
// Low-level API helper
// -----------------------------
async function apiGet(pathWithQuery: string) {
  const res = await fetch(`${API_BASE}${pathWithQuery}`, {
    headers: {
      "x-apisports-key": process.env.FOOTBALL_API_KEY!, // from .env.local
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${pathWithQuery}`);
  }

  const data = await res.json();
  return data;
}

// -----------------------------
// Team lookup helper
// -----------------------------
async function findTeamIdByName(clubTeam: string): Promise<number | null> {
  const searchName = teamNameMap[clubTeam] ?? clubTeam;

  const data = await apiGet(
    `/teams?search=${encodeURIComponent(searchName)}`
  );

  if (!data.response || data.response.length === 0) {
    console.warn(`⚠️ No team found for "${clubTeam}" (search="${searchName}")`);
    return null;
  }

  const team = data.response[0].team;
  console.log(`✅ Found team ${team.name} (id ${team.id}) for "${clubTeam}"`);
  return team.id as number;
}

// -----------------------------
// Main script
// -----------------------------
async function main() {
  console.log("📄 Reading players.json...");
  const file = await readFile(PLAYERS_PATH, "utf-8");
  const players: PlayerJson[] = JSON.parse(file);

  const updated: PlayerJson[] = [];

  for (const p of players) {
    if (!p.clubTeam) {
      console.warn(`⚠️ Player ${p.name} has no clubTeam, skipping`);
      updated.push(p);
      continue;
    }

    // 1) Resolve team ID (either existing on the object, or via API)
    const teamId: number | undefined =
      p.apiTeamId ?? (await findTeamIdByName(p.clubTeam)) ?? undefined;

    // 2) Player ID is now manual-only: keep whatever is already set
    const playerId: number | undefined = p.apiPlayerId ?? undefined;

    updated.push({
      ...p,
      ...(teamId !== undefined ? { apiTeamId: teamId } : {}),
      ...(playerId !== undefined ? { apiPlayerId: playerId } : {}),
    });
  }

  console.log("💾 Writing updated players.json with API IDs...");
  await writeFile(PLAYERS_PATH, JSON.stringify(updated, null, 2), "utf-8");

  console.log(
    "✅ Done. Check data/players.json for apiTeamId + apiPlayerId fields."
  );
}

main().catch((err) => {
  console.error("❌ Error fetching API IDs:", err);
  process.exit(1);
});
