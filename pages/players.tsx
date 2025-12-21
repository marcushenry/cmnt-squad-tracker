// pages/players.tsx
import fs from "fs";
import path from "path";

type Player = {
  id: string | number;
  name: string;
  position: string;
  club: string;
  status: string;
  health?: string;
};

type Props = {
  players: Player[];
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "data", "players.json");
  const raw = fs.readFileSync(filePath, "utf8");
  const players = JSON.parse(raw);

  return {
    props: { players },
  };
}

export default function Players({ players }: Props) {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Canada Men's National Team</h1>
      <p>Current core players for the 2026 World Cup cycle:</p>

      <ul style={{ marginTop: "1.5rem", lineHeight: "1.8" }}>
        {players.map((player) => (
          <li key={player.id}>
            <strong>{player.name}</strong> — {player.position} at {player.club}

            {/* Locked tag */}
            <span
              style={{
                padding: "2px 6px",
                marginLeft: "8px",
                backgroundColor: "#333",
                borderRadius: "4px",
                fontSize: "0.8rem",
                color: "#fff",
              }}
            >
              {player.status}
            </span>

            {/* Injury tag — ONLY if injured */}
            {player.health === "Injured" && (
              <span
                style={{
                  padding: "2px 6px",
                  marginLeft: "8px",
                  backgroundColor: "#8b0000",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  color: "#fff",
                  cursor: "default",
                }}
                title="Currently injured"
              >
                Injured
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
