// components/LastClubGame.tsx

export type LastClubGameData = {
  date: string;
  opponent: string;

  competition?: string;
  minutes?: number;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  result?: string;
};

type LastClubGameProps = {
  lastClubGame?: LastClubGameData;
};

export function LastClubGame({ lastClubGame }: LastClubGameProps) {
  if (!lastClubGame) {
    return (
      <p className="last-game-empty">
        Last club match data coming soon.
      </p>
    );
  }

  const {
    date,
    opponent,
    competition,
    minutes,
    minutesPlayed,
    goals,
    assists,
    result,
  } = lastClubGame;

  const mins = minutes ?? minutesPlayed;

  return (
    <div className="last-game-card">
      <div className="player-tooltip-header">Last Club Match</div>

      {/* Date */}
      <p className="last-game-date">📅 {date}</p>

      {/* Opponent */}
      <p className="last-game-line">
        🏟️ vs <strong>{opponent}</strong>
        {competition && <> — {competition}</>}
      </p>

      {/* Minutes */}
      {mins != null && (
        <p className="last-game-line">
          ⏱️ {mins}&apos; played
        </p>
      )}

      {/* Goals */}
      {goals != null && (
        <p className="last-game-line">
          ⚽ {goals} G
        </p>
      )}

      {/* Assists */}
      {assists != null && (
        <p className="last-game-line">
          🎯 {assists} A
        </p>
      )}

      {/* Result */}
      {result && (
        <p className="last-game-line">
          🟢 {result}
        </p>
      )}

    </div>
  );
}
