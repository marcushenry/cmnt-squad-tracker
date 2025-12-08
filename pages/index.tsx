// pages/index.tsx
import Head from "next/head";
import playersData from "../data/players.json";

type Player = {
  id?: string | number;
  name: string;
  position: string;
  jerseyNumber?: number;
  age?: number;
  clubTeam?: string;
  injured?: string;
  status?: string;
  lock?: boolean;
  imageUrl?: string;
};

const allPlayers: Player[] = playersData as unknown as Player[];


// helper to sort by position order then jersey #
const POSITION_ORDER: Record<string, number> = {
  GK: 0,
  DF: 1,
  MF: 2,
  FW: 3,
};

function sortPlayers(a: Player, b: Player) {
  const posA = POSITION_ORDER[a.position] ?? 99;
  const posB = POSITION_ORDER[b.position] ?? 99;
  if (posA !== posB) return posA - posB;

  const numA = a.jerseyNumber ?? 999;
  const numB = b.jerseyNumber ?? 999;
  return numA - numB;
}

const HomePage = () => {
  const locks = allPlayers
    .filter((p) => p.status === "lock" || p.lock === true)
    .sort(sortPlayers);

  const lastUpdated = "2025-12-09"; // update manually when you change locks

  return (
    <>
      <Head>
        <title>CMNT World Cup Squad Locks</title>
        <meta
          name="description"
          content="My current locked-in picks for the Canada Men's National Team World Cup squad."
        />
      </Head>

      <main className="page">
        {/* Top bar */}
        <div className="top-row">
          <div className="brand">
            <span className="brand-pill" />

            <div className="brand-main">
              <span className="brand-canada">Canada</span>
              <span className="brand-sub">Men&apos;s National Team</span>
              <span className="brand-sub brand-sub-tracker">Squad Tracker</span>
            </div>
          </div>

          <div className="updated">Last updated: {lastUpdated}</div>
        </div>

        {/* Hero (unchanged from before) */}
        <section className="hero">
          <div className="hero-header">
            <div className="hero-title-block">
              <h1>World Cup Squad Locks</h1>
              <p>
                This page tracks the players I consider{" "}
                <strong>virtual locks</strong> for the next World Cup squad
                based on current form, usage, and squad history. Everyone below feels
                extremely hard to leave off a healthy roster.
              </p>
            </div>

            <div className="hero-tag">
              <span className="hero-tag-dot" />
              Live shortlist
            </div>
          </div>

          <div className="hero-meta">
            <span>
              <span className="dot-divider" /> 26-man projection baseline
            </span>
            <span>
              <span className="dot-divider" /> Injuries &amp; form can still
              change
            </span>
            <span>
              <span className="dot-divider" /> Personal opinion, not predictive
              model
            </span>
          </div>
        </section>

        {/* Locks table */}
        <section className="locks-section">
          <header className="locks-header">
            <h2>Locks Roster Table</h2>
            <span className="locks-count">
              {locks.length} player{locks.length !== 1 && "s"}
            </span>
          </header>

          <div className="locks-table-wrapper">
            <table className="locks-table">
              <thead>
                <tr>
                  <th className="col-player">Player</th>
                  <th>Jersey #</th>
                  <th>Position</th>
                  <th>Age</th>
                  <th>Club Team</th>
                  <th>Player Status</th>
                </tr>
              </thead>
              <tbody>
                {locks.map((p, idx) => (
                  <tr key={p.id ?? idx}>
                    <td className="cell-player">
                      <div className="player-cell">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="player-avatar"
                          />
                        ) : (
                          <div className="player-avatar placeholder">
                            {initials(p.name)}
                          </div>
                        )}
                        <span className="player-name">{p.name}</span>
                      </div>
                    </td>
                    <td>{p.jerseyNumber ?? "—"}</td>
                    <td>{positionLabel(p.position)}</td>
                    <td>{p.age ?? "—"}</td>
                    <td>{p.clubTeam ?? "—"}</td>
                    <td>
                      <div className="status-pill-container">
                        {p.status === "lock" && (
                          <span className="status-pill status-lock">LOCK</span>
                        )}

                        {p.injured && (
                          <span className="status-pill status-injured">INJURED</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="locks-note">
            * This table only includes players marked as locks in my opinion.
            Bubble/ fringe players will live on a separate page.
          </p>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>
            Methodology: this is a{" "}
            <strong>&quot;if the World Cup started tomorrow&quot;</strong> view.
            Locks are players I expect on essentially any realistic squad
            scenario.
          </p>
        </footer>
      </main>
    </>
  );
};

function positionLabel(code: string) {
  switch (code?.toUpperCase()) {
    case "GK":
      return "Goalkeeper";
    case "DF":
      return "Defender";
    case "MF":
      return "Midfielder";
    case "FW":
      return "Forward";
    default:
      return code || "—";
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default HomePage;
