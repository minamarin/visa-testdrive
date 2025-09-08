import { useEffect } from "react";

export default function useFocusTrap(containerRef, active = true) {
  useEffect(() => {
    // If not active, do nothing
    if (!active) return;

    // Grab the DOM element from the ref (the modal container, usually)
    const el = containerRef.current;
    if (!el) return;

    // CSS selector string: all things you can Tab to
    const selectors =
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    let focusables = [];

    // Helper function: find all focusable elements inside the modal
    const getFocusables = () =>
      (focusables = Array.from(el.querySelectorAll(selectors)).filter(
        (n) =>
          !n.hasAttribute("disabled") && // ignore disabled elements
          !n.getAttribute("aria-hidden") // ignore hidden-from-AT elements
      ));

    // Run it once on mount
    getFocusables();

    // Keydown handler for Tab/Shift+Tab
    function handleKeydown(e) {
      if (e.key !== "Tab") return; // only care about Tab key

      getFocusables(); // refresh in case DOM changed

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;

      // If Shift+Tab from the *first* element → wrap focus to the last
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      // If Tab from the *last* element → wrap focus to the first
      else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Attach listener to the modal
    el.addEventListener("keydown", handleKeydown);

    // Cleanup: remove listener when unmounted or deps change
    return () => el.removeEventListener("keydown", handleKeydown);
  }, [containerRef, active]);
}