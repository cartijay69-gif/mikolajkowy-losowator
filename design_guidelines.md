# Design Guidelines: Mikołajkowy Losowator (Secret Santa Draw)

## Design Approach
**Utility-Focused Holiday Application** - A single-purpose tool with festive personality. Draw inspiration from simple, delightful micro-apps like Google's holiday doodles - functional but charming.

## Layout Structure

### Single-Page Centered Layout
- Vertically and horizontally centered container (max-w-md)
- Content naturally stacked in single column
- Generous vertical spacing between elements (space-y-8 to space-y-12)
- Full viewport height with flex centering for balanced presentation

### Component Hierarchy (Top to Bottom)
1. **Header Section**: Christmas emoji + title + subtitle
2. **Form Section**: Input field + submit button
3. **Result Display**: Dynamic message area (initially hidden)

## Typography

### Font Selection
- **Primary Font**: 'Poppins' or 'Inter' (Google Fonts) - modern, friendly, readable
- **Accent Font**: 'Fredoka' or 'Quicksand' for the title - playful holiday feel

### Type Scale
- **Title**: text-4xl to text-5xl, font-bold
- **Subtitle/Instructions**: text-lg, font-normal
- **Input Label**: text-sm, font-medium
- **Result Message**: text-xl, font-semibold
- **Button Text**: text-lg, font-semibold

## Spacing System
Use Tailwind spacing: **4, 6, 8, 12** as primary units
- Container padding: p-8 to p-12
- Element spacing: space-y-6 to space-y-8
- Input padding: px-4 py-3
- Button padding: px-8 py-4

## Component Design

### Input Field
- Large, prominent text input
- Rounded corners (rounded-xl)
- Substantial height (h-14)
- Visible border with increased width on focus
- Placeholder text: "np. Anna, Marek..."
- Full width of container

### Submit Button
- Bold, prominent call-to-action
- Rounded corners matching input (rounded-xl)
- Full width of container
- Substantial height (h-14)
- Transform scale on hover (scale-105)
- Smooth transitions (transition-all duration-200)

### Result Display Container
- Rounded card appearance (rounded-2xl)
- Generous padding (p-8)
- Initially hidden (controlled by JavaScript)
- Success state: Celebratory message with gift emoji
- Error state: Gentle error message with warning emoji

## Visual Elements

### Christmas Decorations
- Festive emoji in header (🎅, 🎄, 🎁)
- Optional: Subtle snowflake icons scattered decoratively
- Keep decorations minimal to maintain functionality

### Shadows & Depth
- Input field: subtle shadow (shadow-sm) that deepens on focus (shadow-md)
- Button: medium shadow (shadow-md) that lifts on hover (shadow-lg)
- Result container: soft shadow (shadow-lg)

## Images

**Background Treatment**: 
- Use a subtle, festive background pattern or gradient
- Option 1: Diagonal stripes pattern in holiday colors
- Option 2: Soft snowfall illustration (non-distracting)
- Option 3: Blurred bokeh lights effect
- Implementation: CSS gradient or SVG pattern (not a large image file)

**No Hero Image Required** - This is a simple utility app, not a marketing page. The focus should remain on the form and functionality.

## Responsive Design
- Single column layout works for all screen sizes
- Container max-width: max-w-md (perfectly readable on all devices)
- Mobile (sm): Reduce text sizes by one step, padding to p-6
- Desktop: Maintain generous spacing and comfortable reading width

## Interaction States

### Input Field States
- Default: Clear border, placeholder visible
- Focus: Border emphasis, remove placeholder
- Filled: Maintain visual feedback
- Error: Shake animation on invalid submission

### Button States
- Default: Solid appearance with shadow
- Hover: Slight scale increase, shadow lift
- Active: Slight scale decrease
- Loading (optional): Spinner or "Losowanie..." text

### Result Display Animation
- Slide down from top or fade in (0.3s ease)
- Success: Gentle pulse or confetti effect (very subtle)
- Error: Gentle shake animation

## Accessibility
- Proper label association with input field
- Button type="submit" for keyboard navigation
- Focus visible states for all interactive elements
- Sufficient contrast for all text
- Error messages clearly communicate issue

## Key Principles
- **Simplicity First**: One task, clearly presented
- **Festive but Functional**: Holiday charm without sacrificing usability
- **Instant Feedback**: Clear success/error states
- **Welcoming Tone**: Friendly language and visual warmth