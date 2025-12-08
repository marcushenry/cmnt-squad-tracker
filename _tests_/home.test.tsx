import { render, screen } from "@testing-library/react";
import HomePage from "../pages/index";

test("renders the hero heading", () => {
  render(<HomePage />);

  const heading = screen.getByRole("heading", {
    level: 1, // specifically the <h1>
    name: /world cup squad locks/i, // text inside it (case-insensitive)
  });

  expect(heading).toBeInTheDocument();
});
