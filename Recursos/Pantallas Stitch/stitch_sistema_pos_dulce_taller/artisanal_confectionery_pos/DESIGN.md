---
name: Artisanal Confectionery POS
colors:
  surface: '#fff8f2'
  surface-dim: '#e1d9cf'
  surface-bright: '#fff8f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2e8'
  surface-container: '#f5ede3'
  surface-container-high: '#efe7dd'
  surface-container-highest: '#e9e1d7'
  on-surface: '#1e1b15'
  on-surface-variant: '#57423a'
  inverse-surface: '#343029'
  inverse-on-surface: '#f8f0e5'
  outline: '#8a7269'
  outline-variant: '#dec0b6'
  surface-tint: '#a23f10'
  primary: '#9d3c0c'
  on-primary: '#ffffff'
  primary-container: '#bd5324'
  on-primary-container: '#fff9f7'
  inverse-primary: '#ffb599'
  secondary: '#7c5641'
  on-secondary: '#ffffff'
  secondary-container: '#fdc9af'
  on-secondary-container: '#79533e'
  tertiary: '#446147'
  on-tertiary: '#ffffff'
  tertiary-container: '#5c7a5e'
  on-tertiary-container: '#ebffe8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#eebca2'
  on-secondary-fixed: '#2f1405'
  on-secondary-fixed-variant: '#623e2b'
  tertiary-fixed: '#caebc9'
  tertiary-fixed-dim: '#aecfae'
  on-tertiary-fixed: '#05210c'
  on-tertiary-fixed-variant: '#314d34'
  background: '#fff8f2'
  on-background: '#1e1b15'
  surface-variant: '#e9e1d7'
  surface-cream: '#FDFBF7'
  espresso-dark: '#1C120C'
  espresso-subtle: '#221610'
  powder-blush: '#E8C8BE'
  caramel-glow: '#D97736'
  table-free: '#5E7C60'
  table-occupied: '#BD5324'
  table-bill: '#D99B26'
  table-reserved: '#7A6882'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.25rem
  margin: 1rem
  margin-tablet: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system translates the warmth, precision, and sensory delight of an artisanal boutique pastry atelier and specialty coffee shop into a high-performance touch screen POS and floor management interface. The audience consists of busy baristas, floor servers, and pastry chefs who need to execute swift orders under natural, bustling cafe lighting. 

The aesthetic is **Warm Tactile Minimalism**: pairing editorial European confectionery elegance with pragmatic, ergonomic point-of-sale efficiency. Instead of cold utilitarian corporate software, the UI evokes parchment paper, stone countertops, whipped mascarpone, and rich roasted coffee beans. Every interaction prioritizes rapid tactile recognition, generous tap targets, visual calm during rush hours, and instantly scannable status cues.

## Colors

The palette balances warm gourmand tones with functional status semantics:
- **Primary (`#BD5324` - Terracotta Glaze):** Directs the primary flow, high-intent action buttons (e.g., "Cobrar", "Enviar Comanda"), and active occupancy indicators.
- **Secondary (`#5A3825` - Roasted Cocoa):** Delivers grounded structural weight for navigation bars, category headers, and high-emphasis icons.
- **Tertiary (`#5E7C60` - Sage Mint):** Represents calm availability ("Mesa Libre", fresh order batches, success confirmations).
- **Neutral (`#F3EBE1` - Warm Vanilla Butter):** Provides soft structural cards, divider borders, and container tiers without harsh stark-white glare.
- **Surface Cream (`#FDFBF7`):** Acts as the canvas base, offering a natural linen parchment warmth under indoor cafe lighting.
- **Espresso Dark (`#1C120C`):** Ensures high-contrast legibility (WCAG AAA) for prices, order names, and seat counters.

State signaling for floor management utilizes dedicated tactile chromatic tokens:
- **table-free (`#5E7C60`):** Soft sage green with high contrast against the vanilla background.
- **table-occupied (`#BD5324`):** Warm terracotta for active orders currently dining.
- **table-bill (`#D99B26`):** Honeyed caramel to notify staff of pending payment requests.
- **table-reserved (`#7A6882`):** Muted lavender slate for scheduled reservations.

## Typography

Typography establishes an intentional cadence between editorial elegance and rapid transactional clarity:
- **Headlines (`Playfair Display`):** Utilized for section headlines, table zone names ("Salón Principal", "Terraza Jardín"), total invoice balances, and welcome greetings. It reinforces the craft of hand-made boutique pastry.
- **Operational Data (`Plus Jakarta Sans`):** Powers product grids, ticket itemization, modifier lists, numbers, and quick-action buttons. Its generous x-height and open apertures prevent misreading pastry names (e.g., "Croissant de Almendras", "Pain au Chocolat") under rapid touch interactions.
- **Numbers & Prices:** Always rendered with `Plus Jakarta Sans` in semi-bold or bold weights with tabular numbers enabled to maintain clean alignment down receipt columns.

## Layout & Spacing

The spatial architecture is designed around horizontal tablet ergonomics (the primary POS device) with flexible responsive stacking for mobile management:
- **Tablet Landscape Layout (10"-13"):** A split-pane architecture. The left 60% contains a categorized product catalog or interactive floor plan. The right 40% is dedicated to a persistent, sticky order ticket and summary drawer.
- **Grid Structure:** A fluid 12-column grid system with 16px to 20px gutters. Touch targets for all interactive surface tiles adhere strictly to a minimum touch area of `52px x 52px` (ideally `64px+` for table cards and common product additions).
- **Rhythm:** Dense yet breathable padding inside product tiles (`space-md`) balances high inventory density with swift recognition.

## Elevation & Depth

To avoid digital fatigue during long shifts, the system bypasses heavy, harsh drop shadows in favor of **warm tonal layering** and subtle ambient warmth:
- **Level 0 (Canvas):** `#FDFBF7` serves as the foundation.
- **Level 1 (Cards, Floor Tiles, Order Item Rows):** `#FFFFFF` or `#F3EBE1` with a fine border (`1px solid rgba(90, 56, 37, 0.08)`). Soft ambient contact shadow: `0 2px 8px -2px rgba(34, 22, 16, 0.05)`.
- **Level 2 (Active Table, Selected Card, Floating Modals):** Lifted with `0 8px 24px -4px rgba(34, 22, 16, 0.10)` and an accented terracotta edge highlight.
- **Level 3 (Payment Overlays & Emergency Modifiers):** Tinted dark backdrop (`rgba(28, 18, 12, 0.45)`) with centered elevation cards displaying `0 16px 36px -8px rgba(34, 22, 16, 0.20)`.

## Shapes

The design language uses roundedness level 2:
- Base touch targets and cards use `0.5rem` (8px) for structural crispness.
- Product cards, table tiles, and large surface sheets use `1rem` (16px) for an inviting, warm tactile feel.
- Pill badges and dynamic counter buttons take full rounded treatments (`9999px`) to indicate touchable state tags and modifier incrementers.

## Components

### Buttons
- **Primary Transactional ("Cobrar", "Confirmar Pedido"):** Full-width or prominent touch height (min 54px). Background in `#BD5324`, text in `#FFFFFF`, font `Plus Jakarta Sans` 16px Bold. Tactile press state scales to `0.98` with a warm glow.
- **Secondary Actions ("Guardar Comanda", "Dividir Cuenta"):** Background in `#F3EBE1`, text in `#5A3825`, border `1px solid rgba(90, 56, 37, 0.12)`.
- **Quick Modifiers (+ / - Quantity):** Circular 44px tap targets with solid rounded pills, high-contrast iconography.

### Table Status Cards (Floor Plan)
- Modular square/rectangular tiles displaying table identifier (e.g., "Mesa 04"), guest count badge, elapsed order time, and current subtotal.
- **Header Status Stripe:** 6px top indicator or pill badge matching table status (`#5E7C60` Libre, `#BD5324` Ocupada, `#D99B26` Pidiendo Cuenta, `#7A6882` Reservada).
- Active state renders a subtle 2px ring in `#BD5324`.

### Product & Pastry Catalog Tiles
- Integrated image slot (flaky pastries, latte art) with high visual fidelity, accompanied by a readable product name and price badge.
- Stock badge ("Agotado" / "Últimas 2 unid.") overlays top-right with semi-opaque powder-blush backing.

### Order Ticket Drawer
- Right-hand persistent sidebar. Line items feature clear hierarchical styling: item title, quantity badge, variant details (e.g., "Leche de Avena", "Tibia"), and individual line total.
- Swipe-to-delete or tactile tap-to-modify with instant feedback.

### Input Fields & Search
- Quick search bar for catalog items: padded with `14px 18px`, clear clear-button ('×'), warm tinted background `#F3EBE1`, focused border in `#BD5324`.