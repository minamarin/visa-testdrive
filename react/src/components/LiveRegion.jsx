import React from "react";

// Simple polite live region for SR announcements (add/delete/clear)
export default function LiveRegion({ message }) {
  return (
    <p
      aria-live="polite"
      className="sr-only"
      data-testid="live-region"
    >
      {message}
    </p>
  );
}