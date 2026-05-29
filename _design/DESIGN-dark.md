---
name: Geist-Neural High Contrast
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c3c5d9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8d90a2'
  outline-variant: '#434656'
  surface-tint: '#b7c4ff'
  primary: '#b7c4ff'
  on-primary: '#002583'
  primary-container: '#0051ff'
  on-primary-container: '#dee2ff'
  inverse-primary: '#004bee'
  secondary: '#a2e7ff'
  on-secondary: '#003642'
  secondary-container: '#00d2fd'
  on-secondary-container: '#005669'
  tertiary: '#ffb4a1'
  on-tertiary: '#611300'
  tertiary-container: '#bf2f02'
  on-tertiary-container: '#ffdcd4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b7'
  secondary-fixed: '#b4ebff'
  secondary-fixed-dim: '#3cd7ff'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#891e00'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered for developers and high-performance technical environments. It prioritizes clarity, precision, and functional density. The brand personality is technical and sophisticated, favoring a "tools, not toys" philosophy.

The style is **Geist-inspired Minimalism**, blending a systematic utilitarian approach with modern high-contrast elements. It utilizes deep blacks, vibrant electric blues, and subtle monochromatic layering to create a sense of focused depth. The UI evokes a feeling of control and professional reliability, ensuring that complex data remains legible and actionable.

## Colors

This design system utilizes a high-contrast dark-first palette. The primary color, `#0051ff`, is preserved for critical actions and brand recognition, while a secondary cyan is used for success states and accent data points.

In **Dark Mode**, the background is a pure black (`#000000`) to maximize contrast and reduce eye strain in low-light environments. Hierarchy is established through "Surface" and "Surface-Container" tiers rather than heavy shadows. In **Light Mode**, the system flips to a clean, gallery-white aesthetic with soft grey containers. Semantic colors (Success, Warning, Error) must maintain a contrast ratio of at least 4.5:1 against their respective backgrounds.

## Typography

Typography is the backbone of the interface. We use a dual-font strategy: **Geist** for all prose and structural headings to maintain a modern, geometric feel, and **JetBrains Mono** for labels, data, and technical metadata to reinforce the developer-centric aesthetic.

Headlines should use tight tracking and leading for a compact, authoritative look. Body text prioritizes readability with generous line heights. All monospaced labels should be set in uppercase when used for navigation or section headers to distinguish them from interactive body elements.

## Layout & Spacing

The design system employs a **fixed-fluid hybrid grid**. Content is contained within a max-width of 1440px on desktop, centered with 64px margins. On mobile, margins scale down to 16px.

We use a strict 4px baseline grid. All spacing between components and within elements must be a multiple of this base unit. Internal component padding typically follows an `md` (16px) or `sm` (8px) rhythm to maintain a high-density information display without feeling cluttered.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layering** and **Low-Contrast Outlines**.

Depth is communicated by the brightness of the surface:
1.  **Level 0 (Background):** Pure Black.
2.  **Level 1 (Surface):** Subtle elevation for sidebars or secondary navigation.
3.  **Level 2 (Surface-Container):** Used for primary cards and modals.

To further define boundaries in dark mode, elements should use a 1px solid border (`#262626`). Interactive states (hover/focus) are signaled by increasing the border brightness or applying a subtle inner glow using the primary color at 10% opacity.

## Shapes

The shape language is "Soft-Technical." Elements use a 0.25rem (4px) base radius to soften the clinical feel of the monochrome palette while remaining structural. Large containers like cards or modals may scale up to 0.75rem (12px) to provide a clear visual distinction from smaller utility components like buttons or inputs.

## Components

### Buttons
Primary buttons use a solid `#0051ff` fill with white text. Secondary buttons use a transparent background with a 1px border and the surface-container background on hover. Label text is always weight 500.

### Cards & Containers
Cards must use the `surface-container` background token. They are defined by a 1px border. There is no drop shadow; instead, use a subtle 1px highlight on the top border for "floating" elements like popovers.

### Input Fields
Inputs use the `surface` background with a subtle border. On focus, the border color transitions to the primary brand color with a 2px outer ring at 20% opacity. Placeholder text uses the `text-secondary` token.

### Chips & Badges
Chips are styled with a monospaced font (`label-sm`). They use a low-contrast background (10% of the primary or semantic color) and a high-contrast text color for maximum readability.

### Lists
List items are separated by subtle 1px dividers. Hover states should apply a 4% white overlay (in dark mode) or a 4% black overlay (in light mode) to the background to indicate interactivity.