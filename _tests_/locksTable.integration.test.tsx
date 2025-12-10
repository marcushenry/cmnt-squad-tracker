import { render, screen, within } from "@testing-library/react";
import HomePage from "../pages/index";
import players from "../data/players.json";

test("renders the correct number of lock players in the Locks Roster Table", () => {
  render(<HomePage />);

  // 1. Figure out how many players SHOULD be in this table
  const lockPlayers = players.filter((p) => p.status === "lock");

  // 2. Find the Locks Roster Table section by its heading
  const sectionHeading = screen.getByRole("heading", {
    level: 2,
    name: /locks roster table/i,
  });

  // assume the heading lives in or just above the section that contains the table
  const section = sectionHeading.closest("section") ?? sectionHeading.parentElement!;
  const utils = within(section);

  // 3. Get all rows in that specific table (header row + data rows)
  const rows = utils.getAllByRole("row");
  const dataRowCount = rows.length - 1; // subtract header row

  // 4. Compare what the UI shows vs what the data says
  expect(dataRowCount).toBe(lockPlayers.length);
});
