# Style Guide

This document defines the design and interaction rules for the radioter.io frontend.

## Interaction Rules

### 1. No Hover Effects
- **Rule**: No hover effects (e.g., `hover:bg-gray-50`, `hover:text-gray-800`) should be used anywhere in the UI.
- **Rationale**: Maintains a consistent, minimalistic appearance and prevents visual distractions.

### 2. Cursor Style
- **Rule**: Cursor is set globally to default arrow via CSS (`* { cursor: default; }`).
- **Rationale**: Consistent cursor behavior across the application. No need to add `cursor-default` classes.

### 3. No Transition Effects
- **Rule**: No `transition-colors` or other transition effects should be used.
- **Rationale**: Maintains static, minimalistic appearance.

---

## Design Principles

- Simple, minimalistic design
- Mobile-optimized (responsive)
- Gray color palette
- Consistent spacing and typography

---

## Color Palette

- Primary grays: `gray-50` to `gray-900`
- Status colors:
  - Green: `green-500` (Started)
  - Yellow: `yellow-500` (Paused)
  - Gray: `gray-400` (Stopped)
- Error colors: `red-50`, `red-200`, `red-300`, `red-600`, `red-700`
- **Note**: Use gray palette consistently. Avoid non-gray colors except for status indicators and errors.

## Shared Utilities

### Status Color
- Location: `src/common/status-color.ts`
- Function: `getStatusColor(status: string): string`
- Returns Tailwind class for status indicator background color

---

## Typography

- Font family: System fonts (Arial, Helvetica, sans-serif)
- Headings: `font-semibold` or `font-medium`
- Body text: Default weight
- Small text: `text-sm` or `text-xs`

---

## Spacing

- Mobile-optimized spacing
- Consistent padding and margins
- Touch targets: Minimum 44px height/width on mobile

---

## Components

### Input Fields
- Border: `border-gray-300`
- Background: `bg-white`
- Text color: `text-gray-900`
- Placeholder: `placeholder:text-gray-400`
- Focus: `focus:border-gray-500 focus:ring-1 focus:ring-gray-500`
- Error state: `border-red-300 bg-red-50`

### Buttons
- Border: `border-gray-300`
- Background: `bg-white`
- Text: `text-gray-900`
- Disabled: `disabled:bg-gray-100 disabled:text-gray-400`
- No hover effects, no transitions

### Cards/Panels
- Background: `bg-white` or `bg-gray-50`
- Border: `border-gray-200` (use instead of `shadow-lg` for consistency)
- Rounded corners: `rounded-lg`

---

## Layout

### Split Layouts
- Desktop: 50/50 split using `md:grid md:grid-cols-2`
- Mobile: Stacked layout (full width)

### Responsive Breakpoints
- Mobile: Default (< 768px)
- Desktop: `md:` prefix (≥ 768px)

---

## Notes

- This style guide is a living document and will be updated as needed.
- All developers should follow these guidelines when implementing new features or updating existing code.

