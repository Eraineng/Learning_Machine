# Lesson 1 — Accessibility Fundamentals

## Who are we testing for?
| Disability | Examples | Assistive technology / need |
|------------|----------|-----------------------------|
| **Visual** | Blindness, low vision, colour blindness (~8% of men) | Screen readers, magnification, high contrast, don't rely on colour |
| **Motor** | Tremor, paralysis, RSI, one-handed use | Keyboard only, switch devices, voice control, large tap targets |
| **Hearing** | Deaf, hard of hearing | Captions, transcripts, visual alerts |
| **Cognitive** | Dyslexia, ADHD, memory, autism | Clear language, consistency, no time pressure, no flashing |
| **Situational / temporary** | Broken arm, bright sunlight, holding a baby, noisy train | Everyone benefits! |

**Curb-cut effect:** features built for disabled users help everyone — captions in a noisy room, keyboard shortcuts for power users, good contrast outdoors.

## Assistive technologies to know
- **Screen readers:** NVDA (free, Windows), JAWS (paid, Windows), VoiceOver (macOS/iOS), TalkBack (Android)
- **Magnifiers, high-contrast modes, browser zoom**
- **Voice control:** Dragon, Voice Control (Apple), Voice Access (Android)
- **Switch devices / eye tracking** for severe motor impairments

## WCAG: the standard
**Web Content Accessibility Guidelines** (W3C). Current: **WCAG 2.2** (2.1 is most commonly required; WCAG 3 is in draft).

### Conformance levels
| Level | Meaning |
|-------|---------|
| **A** | Minimum. Without it, some people simply cannot use the product |
| **AA** | ⭐ The usual legal/target level (contrast 4.5:1, focus visible, etc.) |
| **AAA** | Highest; rarely required for a whole site |

### POUR — the 4 principles
| Principle | Means | Examples of requirements |
|-----------|-------|--------------------------|
| **P**erceivable | Users can perceive the content | Alt text for images, captions for video, contrast ≥ 4.5:1, don't use colour alone, content reflows at 320px |
| **O**perable | Users can operate the interface | Everything works by keyboard, no keyboard traps, visible focus, enough time, no flashing (seizures), skip links, target size ≥ 24×24 (2.2) |
| **U**nderstandable | Content and behavior make sense | Page language set, consistent navigation, clear labels, helpful error messages with suggestions |
| **R**obust | Works with current and future assistive tech | Valid HTML, correct roles/names/values (use semantic elements!), status messages announced |

## The #1 rule: use semantic HTML
```html
<div class="button" onclick="submit()">Sign up</div>   <!-- ❌ not focusable, no role, no Enter/Space -->
<button type="submit">Sign up</button>                 <!-- ✅ free: focus, keyboard, role, announcement -->
```
Native elements give you keyboard support, roles, states and screen reader announcements **for free**.

> **First rule of ARIA: don't use ARIA if a native HTML element will do.**
> Bad ARIA is worse than no ARIA.

### When ARIA *is* needed
```html
<button aria-expanded="false" aria-controls="menu">Menu</button>  <!-- state -->
<nav aria-label="Main">                                            <!-- distinguish landmarks -->
<p role="alert" aria-live="assertive">Error: …</p>                 <!-- announce dynamic changes -->
<input aria-describedby="pw-hint" aria-invalid="true">             <!-- extra description / state -->
<img src="deco.png" alt="">                                        <!-- decorative: hide from AT -->
```

## Accessible name
What a screen reader announces for an element. It comes from (in order): `aria-labelledby` → `aria-label` →
native label (`<label for>`, `alt`, `<caption>`) → text content → `title`.

That's exactly what Playwright's `getByRole('button', { name: 'Sign up' })` uses — **your Playwright tests
are already partly accessibility tests**.

## Most common real-world failures (WebAIM Million survey, year after year)
1. Low contrast text
2. Missing alt text
3. Empty links / buttons (icon-only with no name)
4. Missing form labels
5. Missing document language
6. Wrong heading structure

Fixing just these six would transform most websites.

## Check yourself
1. What does POUR stand for?
2. Which conformance level is usually legally required?
3. Why is `<button>` better than a clickable `<div>`?
4. What is an "accessible name" and where does it come from?
5. Name 3 situational disabilities.
