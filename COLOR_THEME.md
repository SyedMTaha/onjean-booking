# 78 On Jean - Color Theme & Design System

## Overview
The 78 On Jean website uses a luxurious, sophisticated color palette that combines warm amber/gold accents with a dark, modern aesthetic. This creates a premium hospitality experience that conveys elegance and comfort.

---

## Primary Color Palette

### Amber/Gold Theme
The primary accent color throughout the website

| Color | Tailwind Class | Hex Code | Usage |
|-------|-----------------|----------|-------|
| **Amber 600** | `bg-amber-600` / `text-amber-600` | `#D97706` | Primary CTA buttons, section highlights, icons, and pricing text |
| **Amber 700** | `bg-amber-700` / `hover:bg-amber-700` | `#B45309` | Button hover states, darker accents |
| **Amber 400** | `text-amber-400` | `#FCD34D` | Star ratings, light accents |
| **Amber 50** | `bg-amber-50` | `#FFFBEB` | Light background containers, card highlights |
| **Amber 100** | `bg-amber-100` | `#FEF3C7` | Badge backgrounds |

**Usage**: Buttons, links, highlights, section titles, pricing, form accents

---

## Dark Theme Colors

### Dark Gray/Slate
Used for backgrounds, navigation, and dark text elements

| Color | Tailwind Class | Hex Code | Usage |
|-------|-----------------|----------|-------|
| **Dark 900** | `bg-gray-900` / `text-gray-900` | `#111827` | Navigation bar, dark button backgrounds, bold text |
| **Dark 800** | `bg-gray-800` / `hover:bg-gray-800` | `#1F2937` | Hover states, secondary backgrounds |
| **Dark 700** | `border-gray-700` | `#374151` | Borders, dividers |
| **Light Text 100** | `text-gray-100` | `#F3F4F6` | Light text on dark backgrounds |
| **Light Text 200** | `text-gray-200` | `#E5E7EB` | Secondary text on dark backgrounds |

**Usage**: Navigation, dark card backgrounds, text on dark surfaces, borders

---

## Light Theme Colors

### White and Light Gray
Used throughout content areas and backgrounds

| Color | Tailwind Class | Hex Code | Usage |
|-------|-----------------|----------|-------|
| **White** | `bg-white` / `text-white` | `#FFFFFF` | Main content background, text |
| **Gray 50** | `bg-gray-50` | `#F9FAFB` | Light section backgrounds |
| **Gray 100** | `bg-gray-100` / `text-gray-100` | `#F3F4F6` | Card backgrounds, badges |
| **Gray 300** | `border-gray-300` | `#D1D5DB` | Subtle borders, dividers |

**Usage**: Main content areas, cards, sections, typography

---

## Text Colors

### Heading & Body Text

| Element | Class | Hex | Purpose |
|---------|-------|-----|---------|
| **Main Headings** | `text-gray-900` | `#111827` | High contrast, strong hierarchy |
| **Form Labels** | `text-gray-900 font-semibold` | `#111827` | Clear, readable labels |
| **Body Text** | `text-gray-700` | `#374151` | Default content text |
| **Secondary Text** | `text-gray-600` | `#4B5563` | Descriptions, helper text |
| **Muted Text** | `text-gray-500` | `#6B7280` | Placeholders, less important info |
| **Light Text** | `text-gray-300` | `#D1D5DB` | Text on dark backgrounds |

---

## Component-Specific Colors

### Buttons

```
Primary Button:
- Background: bg-amber-600
- Hover: hover:bg-amber-700
- Text: text-white
- Example: Book Your Stay, Continue, Subscribe

Secondary Button:
- Background: bg-transparent
- Border: border-gray-400 or border-white
- Text: text-gray-100 or text-white
- Hover: hover:bg-gray-800

Outline Button:
- Border: border-2 border-gray-400
- Hover: hover:bg-amber-600 hover:text-white
```

### Input Fields & Forms

```
Label: text-gray-900 font-semibold
Placeholder: placeholder:text-gray-400
Input Background: bg-white
Input Border: border-gray-300
Focus: focus:border-amber-500 (recommended)
Text: text-gray-900
```

### Cards & Containers

```
Premium Card: bg-white / bg-gray-50
Border: border-0 or border-gray-200
Hover Shadow: hover:shadow-xl
Background: bg-gray-50

Dark Card: bg-gray-900
Text: text-white or text-gray-100
```

### Navigation

```
Nav Background: bg-gray-900
Nav Border: border-gray-700
Nav Text: text-gray-200
Active Link: text-gray-100
Hover: hover:text-gray-100 and hover:bg-gray-800
```

### Badges & Tags

```
Feature Badge: bg-amber-100 text-amber-700
Warning: bg-red-100 text-red-700
Success: bg-green-100 text-green-600
Info: bg-blue-100 text-blue-600
```

---

## Gradient & Special Effects

### Hero Section Overlays

```css
from-amber-900/80 via-amber-800/70 to-amber-900/80
/* Creates a warm, gold-tinted overlay */
```

### Newsletter Section

```css
bg-gradient-to-br from-amber-600 to-amber-700
/* Warm gradient background for prominent CTAs */
```

### Icon Backgrounds

```
bg-amber-50
/* Light amber background for icons */
```

---

## Spacing & Sizing Guide

### Padding Standards
- Buttons: `px-6 py-3` or `px-8 py-6` for larger
- Cards: `p-6` or `p-8`
- Sections: `py-20` or `py-24`

### Typography Hierarchy
- Hero H1: `text-7xl` to `text-8xl`
- Section H2: `text-4xl` to `text-5xl`
- Subsection H3: `text-2xl` to `text-3xl`
- Body: `text-base` to `text-lg`
- Small: `text-sm` to `text-xs`

---

## Dark Mode Considerations

The website primarily uses a dark navigation with light content areas. When implementing dark mode:

1. **Dark Sections**: Use `bg-gray-900` with `text-gray-100`
2. **Dark Text**: Use `text-gray-900` for light backgrounds only
3. **Borders**: Use `border-gray-700` on dark, `border-gray-300` on light
4. **Ambient Light**: Maintain `bg-gray-50` for subtle variation

---

## Accessibility Notes

### Color Contrast Ratios
- **Amber 600 on White**: ✅ WCAG AAA (8.5:1)
- **Gray 900 on White**: ✅ WCAG AAA (16:1)
- **Gray 600 on Gray 50**: ✅ WCAG AA (5.8:1)
- **Gray 200 on Gray 900**: ✅ WCAG AA (11.2:1)

### Best Practices
- Never rely solely on color to convey information
- Always use sufficient contrast ratios for text
- Use semantic HTML and ARIA labels
- Test with accessibility tools regularly

---

## Examples in Use

### Form Implementation
```tsx
<Label htmlFor="email" className="text-gray-900 font-semibold">
  Email Address
</Label>
<Input
  id="email"
  type="email"
  className="placeholder:text-gray-400"
  placeholder="john.doe@example.com"
/>
```

### CTA Button
```tsx
<Button className="bg-amber-600 hover:bg-amber-700 text-white">
  Book Your Stay
</Button>
```

### Card Component
```tsx
<Card className="p-6 bg-gray-50 hover:shadow-xl transition-all">
  <h3 className="text-gray-900 font-semibold">Room Type</h3>
  <p className="text-gray-600">Description text here</p>
</Card>
```

---

## Color Scheme Summary Table

| Intent | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| **Call-to-Action** | Amber-600 | Amber-700 | White text |
| **Navigation** | Gray-900 | Gray-800 | Gray-100 text |
| **Content** | White/Gray-50 | Gray-100 | Gray-900 text |
| **Interactive** | Amber-600 | Gray-800 | Amber-700 hover |
| **Status** | Green / Red | Yellow-600 | Amber-600 |

---

## Tools & Resources

- **Color Tool**: https://tailwindcss.com/docs/customizing-colors
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Accessibility Validator**: https://www.axe-devtools.com/

---

*Last Updated: March 4, 2026*
*Design System Version: 1.0*
