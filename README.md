# Mora

**A minimalist focus app built for deep, intentional work.**

Mora strips away everything that doesn't help you show up and start. It gives you a single task, a quiet timer, and a workspace that deepens with every session — from a blank canvas to a lived-in record of what you've built.

---

## What it does

- **Focus sessions** — pick a task, set a timer (5–60 min), begin. Extend when you're in flow.
- **Project whiteboard** — draw freehand, build a mind map, drop sticky notes, and track your work state. Opens fullscreen for a real workspace feel.
- **Focus status** — broadcast to yourself (and anyone watching): 🎯 Deep Focus, 💭 Thinking, 🚧 Blocked, ✍️ Taking Notes, ☕ Short Break.
- **XP + wins** — every session earns XP and a win entry. Twenty sessions unlocks your Focus Profile.
- **Idea garden** — capture loose thoughts between sessions and turn them into work when ready.
- **Focus profile** — after 20 sessions, a generated profile of your patterns and streaks.

---

## Free vs Mora Plus

| Feature | Free | Plus ($15/yr) |
|---|---|---|
| Focus sessions (5 min) | ✓ | ✓ |
| Custom session length (up to 60 min) | — | ✓ |
| Mind map & sticky notes | ✓ | ✓ |
| Focus status widget | ✓ | ✓ |
| Fullscreen whiteboard | ✓ | ✓ |
| Pen colors & sizes | — | ✓ |
| Sticky note colors | — | ✓ |
| Image uploads to board | — | ✓ |
| Export board as PNG | — | ✓ |
| XP, wins & idea garden | ✓ | ✓ |
| Focus profile (after 20 sessions) | ✓ | ✓ |

---

## Tech stack

- **React 19** — functional components, hooks, context
- **React Router 7** — client-side routing with animated transitions
- **Framer Motion** — page and component animations
- **Tailwind CSS 3** — utility-first styling with a custom design token palette
- **Vite 6** — fast dev server and bundler
- **Tabler Icons** — consistent icon set
- **Stripe Payment Links** — subscription handling via `?stripe=success` redirect
- **localStorage** — all state persists client-side, no backend required

---

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

The app runs entirely in the browser with no server. Drop your Stripe Payment Link into `.env`:

```env
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-link-here
```

---

## Project structure

```
src/
  pages/
    Landing.jsx          # Marketing / pricing page
    Onboarding.jsx        # 3-step first-run flow
    Home.jsx              # Task management + wins + upgrade card
    Session.jsx           # Timer + whiteboard
    WhiteboardPage.jsx    # Fullscreen whiteboard route
    Feed.jsx              # Wins feed
    Profile.jsx           # Focus profile (unlocks at 20 sessions)
  components/
    SessionWhiteboard.jsx # Whiteboard: draw, sticky notes, mind map, focus status
    FocusScreenTools.jsx  # In-session ambient tools
    StripeModal.jsx       # Upgrade modal → Stripe redirect
    Nav.jsx               # Bottom nav (hidden on session + whiteboard routes)
    Page.jsx              # Animated page wrapper
    XPBar.jsx             # XP progress bar
    WinCard.jsx           # Win card component
  context/
    MoraContext.jsx        # Global localStorage-backed state
```

---

## Collaborators

| Name | Role |
|---|---|
| **BreadTan** (breadtan@e.ntu.edu.sg) | Developer & designer |
| **Claude** (Anthropic) | AI pair programmer — architecture, bug fixes, feature implementation |

---

## License

Private — all rights reserved.
