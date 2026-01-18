# Floating Ball App - Design Guidelines

## 1. Brand Identity

**Purpose**: A minimalist utility that provides a draggable floating button for quick access and interaction practice.

**Aesthetic Direction**: Brutally minimal - essential functionality with maximum clarity. No distractions, pure utility.

**Memorable Element**: The floating ball itself is the product. Its smoothness, responsiveness, and satisfying physics make it memorable.

## 2. Navigation Architecture

**Type**: Single Screen (Stack-Only)
- Main Screen: Canvas with draggable floating ball

**No Authentication**: This is a single-user utility app. No login required.

## 3. Screen Specifications

### Main Screen (Home)
- **Purpose**: Provides an interactive canvas where users can drag the floating ball
- **Layout**:
  - No header (full-screen experience)
  - No tab bar
  - Clean canvas background
  - Floating ball component overlays everything
- **Root View**: 
  - Non-scrollable container
  - Safe area insets: all edges = insets + Spacing.xl
- **Components**:
  - Draggable floating ball (60x60px circle)
  - Subtle instructions text at center (fades after first interaction): "Drag me around"
- **Behavior**:
  - Ball starts at center-right of screen
  - Ball snaps to screen edges when released
  - Ball always stays within screen bounds
  - Smooth spring animation on release

## 4. Color Palette

```
Background:
- Canvas: #F5F5F5 (light gray)

Floating Ball:
- Base: #6B7280 (medium gray)
- Opacity: 0.85
- Shadow: rgba(0, 0, 0, 0.15)

Text:
- Instructions: #9CA3AF (subtle gray)
```

## 5. Typography

**System Fonts** (SF Pro for iOS, Roboto for Android)

**Type Scale**:
- Instructions: Regular, 14px, #9CA3AF

## 6. Visual Design

- **Floating Ball**:
  - 60x60px perfect circle
  - Gray (#6B7280) with 85% opacity
  - Subtle shadow: offset (0, 2), opacity 0.15, radius 4
  - No border
  - Active state: scale to 1.1, opacity 1.0
  
- **Animations**:
  - Drag: Follow finger with no lag
  - Release: Spring animation (tension: 200, friction: 20) to nearest edge
  - Touch down: Scale up with gentle spring
  - Touch up: Scale back to normal

## 7. Assets to Generate

1. **icon.png**
   - Simple gray circle on white background
   - WHERE USED: App icon on device home screen

2. **splash-icon.png**
   - Same as icon.png
   - WHERE USED: Launch screen

**Note**: No empty states, avatars, or illustrations needed. The app is the floating ball itself.