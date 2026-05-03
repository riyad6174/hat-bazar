---
name: Organic Minimalist Luxury
colors:
  surface: '#fff8f6'
  surface-dim: '#e7d6d3'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0ee'
  surface-container: '#fbeae7'
  surface-container-high: '#f6e4e1'
  surface-container-highest: '#f0dfdb'
  on-surface: '#221a18'
  on-surface-variant: '#504446'
  inverse-surface: '#382e2c'
  inverse-on-surface: '#feedea'
  outline: '#827476'
  outline-variant: '#d4c2c5'
  surface-tint: '#7b535c'
  primary: '#7b535c'
  on-primary: '#ffffff'
  primary-container: '#d8a7b1'
  on-primary-container: '#603b44'
  inverse-primary: '#ecb9c4'
  secondary: '#834f5d'
  on-secondary: '#ffffff'
  secondary-container: '#ffbdcc'
  on-secondary-container: '#7b4956'
  tertiary: '#685c54'
  on-tertiary: '#ffffff'
  tertiary-container: '#c1b1a8'
  on-tertiary-container: '#4f443d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e0'
  primary-fixed-dim: '#ecb9c4'
  on-primary-fixed: '#2f121a'
  on-primary-fixed-variant: '#613c45'
  secondary-fixed: '#ffd9e0'
  secondary-fixed-dim: '#f6b5c4'
  on-secondary-fixed: '#340e1a'
  on-secondary-fixed-variant: '#683945'
  tertiary-fixed: '#f1dfd6'
  tertiary-fixed-dim: '#d4c3ba'
  on-tertiary-fixed: '#231a14'
  on-tertiary-fixed-variant: '#50443e'
  background: '#fff8f6'
  on-background: '#221a18'
  surface-variant: '#f0dfdb'
typography:
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 64px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style
The design system is defined by a serene, sensorial aesthetic that bridges the gap between clinical efficacy and editorial luxury. It evokes a sense of "quiet luxury," focusing on tactile quality and visual breathing room. The target audience values ritual over routine, seeking products that feel as good on the shelf as they do on the skin.

The style is **Minimalist with Tactile influences**, utilizing heavy whitespace to create an atmosphere of calm. It borrows the soft, approachable curves of modern skincare disruptors while maintaining the architectural discipline of high-end apothecary brands. The interface should feel like a matte-finish paper magazine: sophisticated, intentional, and effortless.

## Colors
The palette is a sophisticated arrangement of skin-mimetic tones. **Warm Ivory** serves as the primary canvas, providing a softer, more premium alternative to pure white. **Soft Beige** is used to define internal surfaces and containers, creating subtle "matte" layering.

**Dusty Rose Pink** and **Nude Pink** act as the primary accents, used sparingly for calls to action, active states, and highlights to maintain a feminine but grounded warmth. **Charcoal Brown** replaces black for all typography to soften the visual contrast, while **Muted Taupe** provides secondary text hierarchy and delicate borders.

## Typography
The typographic strategy relies on the high-contrast pairing of an elegant serif and a functional sans-serif. **Cormorant Garamond** is used for all headlines and display text, set with generous leading to emphasize its literary, editorial roots. For display sizes, a lighter weight and tight letter spacing are preferred to achieve a "Vogue-like" sophistication.

**Inter** provides a clean, neutral balance for body copy and UI labels. It ensures legibility across digital product descriptions and ingredient lists. Labels should be set in uppercase with increased letter spacing to act as "tags" within the layout, echoing the typography found on luxury product packaging.

## Layout & Spacing
This design system utilizes a **fixed grid model** inspired by high-end editorial layouts. On desktop, content is contained within a 1280px max-width, with wide external margins (64px) to create a sense of exclusivity and focus. 

The spacing rhythm is based on an 8px scale, but "breathability" is the priority. Components should never feel crowded; vertical rhythm should favor larger gaps (48px, 64px, or 80px) between sections to allow the user to digest high-resolution product photography and minimal text blocks sequentially.

## Elevation & Depth
Depth is communicated through **ambient shadows and tonal layering** rather than traditional elevation. Surfaces use a "matte" aesthetic, where depth is felt through very diffused, low-opacity shadows tinted with the Charcoal Brown (#3B312F) or Muted Taupe (#8A7C74) rather than gray.

- **Primary Surfaces:** Use Warm Ivory (#FAF7F2).
- **Secondary Surfaces:** Use Soft Beige (#F2E8DF) to create a recessed or "nested" feel.
- **Shadows:** Highly diffused (blur radius 40px+), with opacity never exceeding 8%. This mimics the way light hits frosted glass or heavy paper.

## Shapes
The shape language is defined by **organic softness**. Following the 24px corner radius specification, all primary containers, buttons, and image masks utilize a `rounded-xl` (1.5rem/24px) value. This creates a friendly, "pebble-like" tactile quality that mimics the ergonomic design of physical skincare bottles.

Small components like chips or tags may use a pill-shaped radius to distinguish them from structural cards, but the 24px standard remains the core signature of the design system.

## Components
- **Buttons:** Primary buttons use a solid Dusty Rose Pink (#D8A7B1) with Charcoal Brown text. They feature a 24px corner radius and a subtle matte shadow on hover. Secondary buttons use a Muted Taupe outline or a ghost style.
- **Cards:** High-end product cards use Soft Beige (#F2E8DF) backgrounds with no borders. Images within cards should have the same 24px corner radius.
- **Input Fields:** Fields are rendered with a Soft Beige fill and a 1px Muted Taupe bottom border (minimalist underline style) or a fully rounded Soft Beige container. Focus states transition the border to Nude Pink.
- **Chips & Tags:** Small uppercase labels set in Soft Beige with Muted Taupe text, used for skin types (e.g., "DRY", "SENSITIVE").
- **Product Imagery:** Images are the hero. They should use soft-focus backgrounds and consistent "matte" lighting, often framed in editorial aspect ratios (4:5) with the system’s signature 24px rounded corners.
- **Navigation:** A minimal top bar with high transparency (Warm Ivory at 90% opacity) and a backdrop blur effect to maintain the soft layering aesthetic.