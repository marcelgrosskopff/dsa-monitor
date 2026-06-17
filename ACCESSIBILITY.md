# Accessibility — WCAG 2.1 AA

DSA-Monitor is built to meet WCAG 2.1 AA. This documents what is implemented in code and the
manual screen-reader testing that must be completed before sign-off (offer commitment).

## Implemented in code

- **Semantic landmarks + skip link.** Every page renders `<nav aria-label="Primary">`, a
  single `<main id="main-content">`, and `<footer>`. A keyboard-reachable "Skip to content"
  link (`.skip-link`) is the first focusable element and is visible on focus.
- **One `<h1>` per page.** Verified across Home, Publications, report detail, Resources, About,
  Impressum, Privacy, 404.
- **Colour is never the only signal.** Topic identity is carried by colour **+ text label +
  geometric `CategoryShape`**. Downloads vs outbound links differ by icon + label, not colour
  alone (`↓ Download · PDF` vs `↗ External site`).
- **Visible focus.** Brand-blue focus ring with offset on all interactive elements (design-system
  `base.css`); the only rounded element is the 2px focus ring.
- **No hover-only content.** Email, descriptions, and affordances are always visible (footer
  shows `research@oiat.at` as plain text; "Read report" labels are persistent).
- **Filter chips are real buttons** with `aria-pressed`; the live result count is announced via
  `role="status" aria-live="polite"`. Pagination is a labelled `<nav>` with `aria-current`.
- **Downloads** carry an accessible name including language · format · size; outbound new-tab
  links announce "(opens in new tab)".
- **Tables** (report bodies) render inside a focusable, horizontally-scrollable region with an
  `aria-label` (mobile fallback, locked §9.5).
- **Touch targets** ≥ 44px on filter chips and pager controls.
- **Reduced motion.** The design-system tokens honour `prefers-reduced-motion` (skeleton and
  transition animations collapse).
- **Decorative SVG** (`CategoryShape`, `ConcentricField`) is `aria-hidden`.
- **Responsive** down to 375px (single-column reflow) with no loss of content or function.

## Manual testing checklist (to complete before sign-off)

Run on the deployed preview, not just local:

- [ ] **NVDA + Firefox (Windows):** tab through Home → Publications → filter a topic → open a
      report → download buttons → back. Confirm headings, landmarks, chip state, and link
      purposes are announced correctly.
- [ ] **VoiceOver + Safari (macOS):** repeat the same path; verify rotor landmarks/headings.
- [ ] **Keyboard-only:** every interactive element reachable and operable; visible focus
      throughout; skip link works; no focus traps (mobile nav).
- [ ] **Zoom 200%:** no loss of content or horizontal scrolling of body text.
- [ ] **Contrast:** spot-check text/background pairs with a contrast checker (the locked palette
      is designed to pass; verify the long-tail neutral chip and `hl-sky` highlight).
- [ ] **Lighthouse / axe:** run on each route; target Lighthouse a11y ≥ 95, zero axe criticals.

Record results and remediation in this file before handover.
