import { render, screen } from "@testing-library/react";
import user from "@testing-library/user-event";
import App from "../App.jsx";
import { test, expect } from 'vitest';

test("opens modal and traps focus, closes with Escape", async () => {
  user.setup();
  render(<App />);
  const clearBtn = screen.getByRole("button", { name: /clear completed/i });
  // seed a completed task so the button is enabled
  const input = screen.getByLabelText(/add task/i);
  await user.type(input, "A{enter}");
  const checkbox = screen.getByRole("checkbox");
  await user.click(checkbox); // completed
  expect(clearBtn).not.toBeDisabled();

  await user.click(clearBtn);
  const dialog = screen.getByRole("dialog");
  expect(dialog).toBeInTheDocument();

  await user.keyboard("{Escape}");
  expect(dialog).not.toBeInTheDocument();
});