# Design System — Chefiyke Premium Control Platform

## Purpose
Premium personal authority platform + reusable business engine for Chefiyke. Mobile-first, conversion-ready, fast, secure. Authority, structure, calm power. Serves as both brand site and admin control hub.

## Visual Direction
Brutalist refined — deep charcoal (#0a0a0a–#111111) backgrounds, off-white foreground, deep muted gold (#B8960C) accents applied sparingly. Strong hierarchy, minimal decoration, editorial clarity. Masculine, intelligent, structured. Dark mode only. No heavy animations, smooth scroll, strong breathing space.

## Tone
Authoritative, trustworthy, structured. Premium without ostentation. Fast, intentional, zero clutter.

## Differentiation
Gold accent used sparingly on CTAs and premium moments. Strong vertical rhythm via intentional spacing (4rem sections, 1.5rem card padding). Dark overlay on hero imagery for readability. Editorial composition. Sidebar navigation, minimal header, clean admin control hub.

## Palette
| Token | OKLCH | Hex | Usage |
|---|---|---|---|
| Background | `0.07 0 0` | #0a0a0a | Deep charcoal page foundation |
| Card | `0.11 0 0` | #1a1a1a | Section containers, lifted depth |
| Foreground | `0.97 0.005 80` | #f8f5f0 | Body text, off-white warmth |
| Accent (Gold) | `0.58 0.14 69` | #B8960C | CTAs, highlights, premium borders |
| Muted | `0.2 0 0` | #333333 | Secondary text, disabled states |
| Border | `0.18 0 0` | #2d2d2d | Dividers, structural lines |

## Typography
| Layer | Font | Weight | Scale | Usage |
|---|---|---|---|---|
| Display | Bricolage Grotesque | 600–700 | 32–56px | Headlines, hero, section titles |
| Body | General Sans | 400–500 | 16–18px | Body copy, nav, CTAs, labels |
| Code | Geist Mono | 400 | 12–14px | Timestamps, system info, codes |

Type scale: 1.125x ratio. Line height: 1.5 body, 1.2 headlines.

## Structural Zones
| Zone | Background | Border | Shadow | Notes |
|---|---|---|---|---|
| Header | Card (0.11 L) | Bottom 1px border | Subtle shadow-premium | Sticky, minimal: Chefiyke + Control Center + Virtual Office button |
| Sidebar | Sidebar (0.11 L) | Right 1px border | None | Primary nav: 12 items, collapsible on mobile |
| Hero | Full bleed with dark overlay | None | None | Carousel, smooth fade, gold button accents |
| Pricing Section | Alternate background/card | None | card shadow on lifted items | Grid layout: landing offers, consultancy, bundles, giveaways |
| Contacts | Background with card borders | 1px border on contact items | Subtle on hover | Grid: 17 platforms, visibility-toggled, ordered |
| Testimonials | Card (0.11 L) | 1px border | shadow-card | Quote in white, author in gold, role in muted |
| Admin Control Hub | Sidebar (left) + Content (right) | Borders between zones | Subtle shadows on cards | Clean workspace, module tabs, fast navigation |
| Footer | Card (0.11 L) | Top 1px border | Subtle | Minimal, aligned, navigation button |

## Component Patterns
- **Buttons (Primary)**: Gold background (accent), near-black text. Hover: 92% opacity, subtle lift, shadow glow. No scale; lift only.
- **Buttons (Secondary)**: Transparent, subtle gold border. Hover: light gold background, lift.
- **Cards**: Card background, 1px border, shadow-premium. Hover: shadow-elevated, translateY(-2px), no scale.
- **Contact Links**: Grid items with platform icon, name, visibility toggle. Show only toggled ON items.
- **Links**: Subtle gold underline on hover, no color change on light text.
- **Inputs**: Input background, border outline, gold ring on focus.
- **Testimonials**: Quote in off-white, author in gold, role in muted, no quote marks, clean layout.
- **Admin Sidebar**: Sidebar color, border-right, sticky scroll, collapsible on mobile.
- **Pricing Grid**: 3-column on desktop (2-col tablet, 1-col mobile). Each item: card styling, visibility toggle ON/OFF.

## Spacing & Rhythm
- Base unit: 4px (Tailwind default)
- Section vertical: 4rem (64px) top/bottom padding (md: 6rem, lg: 7rem)
- Card padding: 1.5rem (24px)
- Gap between cards: 1.5rem–2rem (24–32px)
- Breathing space > dense layout; especially on mobile

## Motion
- **Default transition**: 0.3s cubic-bezier(0.4, 0, 0.2, 1) on interactive elements (transition-smooth)
- **Hero carousel**: 5–7s auto-slide, smooth fade (no bounce)
- **Card hover**: opacity + lift only (no scale jitter)
- **Scroll reveal**: lazy-loaded images, fade-in on viewport entry
- **Constraints**: No bounce, spin, or heavy animations; premium restraint on all devices

## Image Treatment
- All hero slides: dark overlay (rgba 0 0 0 / 0.4–0.65) for text readability
- Images: lazy-loaded, optimized WebP with JPEG fallback
- Hero aspect: Full bleed with object-fit cover, centered, dark overlay cinematic effect
- About image: 16:9 editorial, full-body visible, beside text split layout
- Presence image: Full-body, dark office background match (same style as hero), beside text or feature placement
- No galleries or repeated portraits; exactly 3 approved images used

## Constraints
- Gold chroma: locked at 0.14 (premium, never loud)
- Backgrounds: near-black only (#0a0a0a–#111111 range)
- No bright saturated colors or full-page gradients
- Shadows: subtle (premium, shadow-card 4px 12px; shadow-elevated 8px 24px on hover)
- Fonts: 2 active (Bricolage Grotesque display + General Sans body)
- Border radius: 0.625rem consistent (10px)
- Dark mode only (no light mode)
- Mobile-first responsive design (sm, md, lg breakpoints)
- Zero hard-coded content (all editable from backend)

## Navigation Architecture
- **Header**: Chefiyke (brand, text only) + Control Center label + Virtual Office button (right). Minimal, sticky, premium.
- **Sidebar**: Primary navigation (12 items): Overview, Competence, How I Help, Contact, Work With Me, Pricing, Testimonials, Images/Media, Affiliates, Content Editor, Contact Manager, Settings. Mobile-collapsible.
- **Frontend Pages**: Hero, Identity/Presence, About, Competence, How I Help, Testimonials, Pricing (editable offers), Contact (dynamic platforms), Affiliate CTA, Footer.
- **Admin Control Hub**: Sidebar (left) + main workspace (right). Modules: Dashboard, Pricing, Contact Manager, Media, Testimonials, Finance, Affiliates, Settings, Content Editor, Training, Staff, Leads.
- **Frontend vs Backend**: Marketing language (Become My Affiliate) vs management language (Affiliates).

## Accessibility & Performance
- Contrast: 7:1+ (off-white on gold buttons, WCAG AAA)
- Focus states: gold ring (0.58 0.14 69)
- ARIA labels: carousel, form fields, buttons, sidebars
- Semantic HTML: header, nav, main, section, article, aside, footer
- Font-display: swap (no FOIT)
- Images: lazy-load, responsive sizes, alt text
- CSS variables: minimal overhead, theme-aware
- Animations: GPU-accelerated (transform, opacity only)
- Target: <3s LCP, <100ms FID, <100ms CLS mobile 4G
