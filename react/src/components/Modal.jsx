import React, { useEffect, useRef } from "react";
// Custom hook that keeps keyboard focus trapped inside the modal
import useFocusTrap from "../hooks/useFocusTrap.js";

export default function Modal({ titleId, children, onClose, onConfirm }) {
  // Ref to the modal dialog element
  const dialogRef = useRef(null);

  // Activate the focus trap whenever this modal is open
  useFocusTrap(dialogRef, true);

  /**
   * Escape key handler:
   * - Attach an event listener to the whole document.
   * - If the user presses Escape, close the modal.
   * - Clean up by removing the listener when the modal unmounts.
   */
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /**
   * When the modal first mounts, move focus into it.
   * This ensures keyboard and screen reader users are "inside" the dialog.
   */
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    // Backdrop:
    // - role="presentation" means it’s just decoration (not announced to SRs).
    // - Clicking on the backdrop closes the modal.
    <div className="backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"             // ARIA role for a modal dialog
        aria-modal="true"         // tells SRs that content behind is not accessible
        aria-labelledby={titleId} // ties dialog name to an <h3> inside (titleId prop)
        tabIndex={-1}             // allows us to programmatically move focus here
        ref={dialogRef}           // ref so we can focus/trap
        onClick={(e) => e.stopPropagation()} // prevent backdrop click from closing
      >
        {/* The main body content (text, explanations, etc.) */}
        <div className="modal-body">{children}</div>

        {/* Modal actions: primary + secondary buttons */}
        <div className="modal-actions">
          <button type="button" class="v-button" onClick={onConfirm}>Confirm</button>
          <button type="button" class="v-button v-button-destructive v-button-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}