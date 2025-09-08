import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import App from "../App.jsx";
import { test, expect } from 'vitest';

test("adds a task with Enter key", async () => {
  user.setup();
  render(<App />);
  const input = screen.getByLabelText(/add task/i);
  await user.type(input, "Buy milk{enter}");
  expect(screen.getByText("Buy milk")).toBeInTheDocument();
});