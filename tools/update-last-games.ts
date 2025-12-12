// tools/update-last-games.ts

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { LastClubGameData } from "../components/LastClubGame";

const API_BASE = "https://v3.football.api-sports.io";
const PLAYERS_PATH = path.join(process.cwd(), "data", "players.json");

type Player = {
  id?: string | number;
  name: string;
  clubTeam?: string;
  apiTeamId?: number;
  apiPlayerId?: number;
  lastClubGame?: LastClubGameData;
  [key: string]: any;
};

// shared API helper
async function apiGet(pathWithQuery: string) {
  const res = await fetch(`${API_BASE}${pathWithQuery}`, {
    headers: {
      "x-apisports-key": process.env.FOOTBALL_API_KEY!,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("API error payload:", data);
    throw new Error(`API error ${res.status} for ${pathWithQuery}`);
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.warn("⚠️ API reported errors:", data.errors);
  }

  return data;
}

/**
 * Paid-plan helper: get the most recent *played* fixture for a team.
 * We request `status=FT` to avoid returning the next scheduled match.
 */
async function getLastPlayedFixtureForTeam(teamId: number): Promise<any | null> {
  const data = await apiGet(`/fixtures?team=${teamId}&last=1&status=FT`);

  if (!data.response || data.response.length === 0) {
    return null;
  }

  return data.response[0];
}


/**
 * Helper: get the most recent fixture for a team in a given season,
 * using either the `last` parameter (paid plans) or a season-based fallback.
 */
async function getLatestFixtureForTeam(
  teamId: number,
  season: number
): Promise<any | null> {
  const data = await apiGet(
    `/fixtures?team=${teamId}&season=${season}`
  );

  if (!data.response || data.response.length === 0) {
    console.warn(
      `⚠️ No fixtures for team ${teamId} in season=${season}`
    );
    return null;
  }

  const fixtures: any[] = data.response.slice();

  fixtures.sort(
    (a, b) =>
      new Date(b.fixture.date).getTime() -
      new Date(a.fixture.date).getTime()
  );

  return fixtures[0];
}

/**
 * Fetch last club match for a given player:
 *  1) Find latest team fixture (current season, then previous).
 *  2) Pull this player's stats for that fixture.
 */
async function fetchLastClubGameForPlayer(
  player: Player
): Promise<LastClubGameData | null> {
  if (!player.apiPlayerId || !player.apiTeamId) {
    console.warn(
      `⚠️ Skipping ${player.name} – missing apiPlayerId or apiTeamId`
    );
    return null;
  }

  const currentYear = new Date().getFullYear();
  let fixture: any | null = null;

  console.log(
    `🔍 Fetching latest fixture for ${player.name} (team ${player.apiTeamId})...`
  );

  // 1) First try paid-plan shortcut (most recent completed match)
  fixture = await getLastPlayedFixtureForTeam(player.apiTeamId);

  // 2) Season-based fallback (works even if `last` is unavailable for any reason)
  if (!fixture) {
    fixture = await getLatestFixtureForTeam(player.apiTeamId, currentYear);
  }

  // 3) If none, try previous season as a fallback
  if (!fixture) {
    fixture = await getLatestFixtureForTeam(player.apiTeamId, currentYear - 1);
  }

  if (!fixture) {
    console.warn(
      `⚠️ Still no recent fixtures found for ${player.name}`
    );
    return null;
  }

  const fixtureId = fixture.fixture?.id;
  const rawDate: string | undefined = fixture.fixture?.date;
  const leagueName: string | undefined = fixture.league?.name;

  const home = fixture.teams?.home;
  const away = fixture.teams?.away;
  const goals = fixture.goals ?? {};

  const isHome = home?.id === player.apiTeamId;
  const teamGoals = isHome ? goals.home : goals.away;
  const oppGoals = isHome ? goals.away : goals.home;
  const opponentName = isHome ? away?.name : home?.name;

  let result: string | undefined;
  if (
    typeof teamGoals === "number" &&
    typeof oppGoals === "number"
  ) {
    let letter: string;
    if (teamGoals > oppGoals) letter = "W";
    else if (teamGoals < oppGoals) letter = "L";
    else letter = "D";

    result = `${letter} ${teamGoals}-${oppGoals}`;
  }

  // 2) Pull THIS PLAYER'S stats for that fixture
  let minutes: number | undefined;
  let goalsScored: number | undefined;
  let assists: number | undefined;

  if (fixtureId && player.apiTeamId) {
    const playersData = await apiGet(
      `/fixtures/players?fixture=${fixtureId}&team=${player.apiTeamId}`
    );

    const teamBlock = playersData.response?.[0];
    const playerEntry = teamBlock?.players?.find(
      (p: any) => p.player?.id === player.apiPlayerId
    );

    const stats = playerEntry?.statistics?.[0];
    minutes = stats?.games?.minutes;
    goalsScored = stats?.goals?.total;
    const assists = stats?.goals?.assists;


  }

  const formattedDate =
    rawDate && typeof rawDate === "string"
      ? rawDate.slice(0, 10) // YYYY-MM-DD
      : undefined;

  const lastGame: LastClubGameData = {
    date: formattedDate ?? "Unknown date",
    opponent: opponentName ?? "Unknown opponent",
    competition: leagueName,
    minutes,
    goals: goalsScored,
    assists,
    result,
  };

  console.log(`✅ Built lastClubGame for ${player.name}:`, lastGame);
  return lastGame;
}

async function main() {
  console.log("📄 Reading players.json...");
  const file = await readFile(PLAYERS_PATH, "utf-8");
  const players: Player[] = JSON.parse(file);

  const updated: Player[] = [];

  for (const p of players) {
    const lastGame = await fetchLastClubGameForPlayer(p);

    if (lastGame) {
      updated.push({ ...p, lastClubGame: lastGame });
    } else {
      updated.push(p);
    }
  }

  console.log("💾 Writing updated players.json...");
  await writeFile(PLAYERS_PATH, JSON.stringify(updated, null, 2), "utf-8");

  console.log("✨ Done updating last club games!");
}

main().catch((err) => {
  console.error("❌ Error updating last club games:", err);
  process.exit(1);
});