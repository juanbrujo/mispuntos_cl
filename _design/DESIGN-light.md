---
name: Andino Rewards
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#434656'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004bee'
  primary: '#003dc7'
  on-primary: '#ffffff'
  primary-container: '#0051ff'
  on-primary-container: '#dee2ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006a62'
  on-secondary: '#ffffff'
  secondary-container: '#79f4e5'
  on-secondary-container: '#006f66'
  tertiary: '#952200'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf2f02'
  on-tertiary-container: '#ffdcd4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b7'
  secondary-fixed: '#7cf6e7'
  secondary-fixed-dim: '#5ddacb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#891e00'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The brand personality is **utilitarian, precise, and authoritative**, designed to function as a high-utility fintech tool for the Chilean market. It targets savvy consumers who optimize their spending across multiple loyalty ecosystems. The emotional response should be one of **clarity and confidence**—removing the "guesswork" from complex point conversions.

The design style is **Corporate Modern with a High-Contrast edge**. It utilizes a systematic approach to whitespace and information density, ensuring that financial data is legible at a glance. It borrows the clean structure of modern SaaS while employing vibrant, program-specific color hits to help users visually categorize their different reward balances quickly.

## Colors

The palette is anchored by **Trustworthy Blue** (Stability) and **Professional Teal** (Growth). These serve as the system's "operating" colors for navigation, logic, and primary actions. 

This design system employs a **semantic program-theming engine**. When a user interacts with a specific rewards program, the UI should adopt that program's specific signature colors for progress bars, icons, and card accents to provide instant mental mapping.

**Dark Mode Strategy:**
- Surfaces use a deep navy-tinted charcoal instead of pure black to maintain "Fintech" depth.
- Contrast ratios for program-specific colors must be checked; use "Vibrant" variants for dark mode to ensure legibility.

## Typography

The system uses a dual-font strategy. **Montserrat** is used for headlines and currency displays to provide a bold, geometric, and modern feel. **Public Sans** is utilized for all body copy, inputs, and data tables due to its exceptional legibility and neutral, institutional character.

**Key Rules:**
- All currency values and point totals should use `Montserrat` with medium or bold weights.
- `label-sm` is strictly for overlines or small technical metadata (e.g., "LAST UPDATED").
- Line heights are generous to ensure readability during rapid scrolling on mobile devices.

## Layout & Spacing

The design system follows a **4px baseline grid** with a fluid layout model. On mobile, it uses a 4-column grid with 16px margins. On desktop, it scales to a 12-column centered grid.

**Layout Philosophy:**
- **Stack-First:** Since this is a utility calculator, information is presented in a vertical stack of high-contrast cards.
- **Tight Grouping:** Use `sm` (8px) spacing for related items within a card (e.g., a label and its value).
- **Section Breathing:** Use `xl` (32px) to separate major functional blocks, such as the "Input Section" and the "Results Section."

## Elevation & Depth

This design system uses **Tonal Layers and Low-Contrast Outlines** to create depth without visual clutter. 

- **Level 0 (Background):** Solid neutral color (`#F8F9FA` in Light, `#121416` in Dark).
- **Level 1 (Cards):** White or deep grey surfaces with a subtle 1px border (`#E9ECEF`). No shadows are used here to keep the "clean fintech" aesthetic.
- **Level 2 (Active/Interactive):** Elements being touched or focused receive a soft, ambient shadow (12px blur, 10% opacity) to suggest they are "lifted" above the calculation stack.
- **Micro-elevation:** Buttons use a slight 2px vertical offset to feel "pressable" but remain flat in overall style.

## Shapes

The shape language is **Rounded**, using 0.5rem (8px) as the standard corner radius. This strikes a balance between the "friendly" nature of rewards and the "serious" nature of financial tools.

- **Standard Radius:** 8px (Buttons, Input Fields, Small Cards).
- **Large Radius:** 16px (Main Program Dashboard Cards).
- **Full Radius (Pill):** Used exclusively for status chips (e.g., "Best Value," "Expiring Soon") to distinguish them from actionable buttons.

## Components

**Buttons:**
- **Primary:** Solid fill (Trustworthy Blue), white text, 8px radius. High-active state with 10% darkening.
- **Program-Specific:** When calculating for a specific program (e.g., CMR), the primary button should adopt the program's primary color.

**Input Fields:**
- Use a large, clear focus state with a 2px teal border. 
- Prefix inputs with currency symbols or program icons to reduce cognitive load.

**Reward Cards:**
- High-contrast white background. 
- Left-aligned program icon.
- Right-aligned "Resulting Points" in Montserrat Bold.
- A 4px vertical "color strip" on the left edge of the card using the program's specific accent color.

**Calculation Sliders:**
- Custom-styled track with a chunky 24x24px handle for easy thumb interaction on mobile.

**Chips:**
- Small, pill-shaped labels used for "Point Value" ratings (e.g., "Low Value," "Great Deal"). Use a background tint of the program color at 15% opacity.