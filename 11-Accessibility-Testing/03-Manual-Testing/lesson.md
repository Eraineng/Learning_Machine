# Lesson 3 — Manual Accessibility Testing (the other 60%)

📂 Code: `a11y-project/tests/02-keyboard-and-semantics.spec.ts` (automating what can be automated)

## 1. The keyboard test — do this first, it takes 2 minutes
Put the mouse away and use only: `Tab`, `Shift+Tab`, `Enter`, `Space`, arrow keys, `Esc`.

| Check | Fail example |
|-------|--------------|
| Can you reach **every** interactive element? | A clickable `<div>` is skipped |
| Is the **focus indicator visible** at all times? | `outline: none` in the CSS |
| Is the **order logical** (matches visual order)? | Focus jumps from header to footer to middle |
| Can you **activate** everything (Enter/Space)? | A div "button" ignores Enter |
| Can you always get **out**? (no keyboard trap) | A modal or iframe traps focus forever |
| Does a **modal** trap focus *inside* while open, close on `Esc`, and return focus to the trigger? | Focus stays behind the modal |
| Is there a **skip link** to jump past navigation? | 40 nav links before the content, every page |
| Do dropdowns/menus work with **arrow keys**? | Mouse-only custom select |

Automatable parts: tab order, `toBeFocused()`, computed outline, skip link (see our tests).

## 2. Screen reader test
You don't need to be an expert. Learn 10 keys and try the main flows.

### NVDA (free, Windows) — recommended
Download from nvaccess.org. Start with `Ctrl+Alt+N`, stop with `Insert+Q`.
| Key | Action |
|-----|--------|
| `Insert + Down` | Read from here |
| `Tab` / `Shift+Tab` | Next/previous interactive element |
| `H` / `1`–`6` | Next heading / heading level |
| `D` | Next landmark |
| `F` | Next form field |
| `K` | Next link |
| `Insert + F7` | List all links/headings/landmarks ⭐ great overview |
| `Ctrl` | Stop talking |

VoiceOver (Mac): `Cmd+F5`; navigate with `Ctrl+Option+Arrow`. Mobile: TalkBack / VoiceOver with swipe gestures.

### What to listen for
- Does every control announce a **meaningful name, role and state**? ("Sign up, button" not "clickable")
- Are images described usefully, and decorative ones silent?
- Do headings form a sensible outline of the page?
- Are errors and dynamic updates **announced** (`role="alert"`, `aria-live`)?
- Is form guidance read out (`aria-describedby`)?
- Does the reading order make sense?

## 3. Visual checks
| Check | How |
|-------|-----|
| **Contrast** ≥ 4.5:1 (normal text), 3:1 (large text/UI components) | Chrome DevTools colour picker, WebAIM Contrast Checker, axe |
| **Colour alone** isn't the only signal | Turn on greyscale mode: are required fields/errors/links still identifiable? |
| **Zoom to 200%** (and 400% at 320px width) | `Ctrl` + `+`; nothing cut off, no horizontal scroll, nothing overlapping |
| **Text spacing** override | Bookmarklet that increases line height/letter spacing: does text get clipped? |
| **Reduced motion** respected | OS setting "reduce motion" → `prefers-reduced-motion` should stop animations |
| **Dark mode / high contrast (Windows)** | Content still visible? |

## 4. Content and cognition
- Plain language; explain jargon
- Clear, specific error messages that say **how to fix** it ("Enter a date in DD/MM/YYYY", not "Invalid input")
- Consistent navigation and naming
- No time limits that can't be extended
- Nothing that flashes more than 3 times per second (seizure risk)
- Captions/transcripts for audio and video

## 5. A practical 15-minute audit checklist
1. Run axe (extension or test)
2. Tab through the whole page
3. Check focus visibility and order
4. Zoom to 200%
5. Greyscale the page
6. Turn on NVDA and complete the main task
7. Check headings with `Insert+F7`
8. Test one form with errors

## Reporting accessibility bugs
Include: **WCAG criterion** (e.g. 1.4.3 Contrast (Minimum), AA), who it affects and how badly, steps to
reproduce with the assistive tech used, and a concrete fix suggestion. Severity is about **user impact**:
blocking a screen reader user from checkout is critical, even if it looks like "just a missing label".

## Try it
1. Open `pages/inaccessible.html` in a browser. Tab through it. How many controls can you reach? Now try `accessible.html`.
2. Install **NVDA** and listen to both pages. Which one can you actually complete?
3. Run the 15-minute audit on a real site (your bank, a shop). Write up the top 3 issues with WCAG references.
4. Use Chrome DevTools → Rendering → "Emulate vision deficiencies" (protanopia, blurred vision) on both pages.
