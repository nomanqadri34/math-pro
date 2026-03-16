# Professional Mathematics Animation

## Overview
This project includes two versions of a professional mathematics background animation for the home page:

### 1. MathCanvas (3D Text Version)
- **File**: `src/components/MathCanvas.tsx`
- **Features**: 
  - Realistic 3D floating numbers (0-9)
  - 3D mathematical symbols (π, ∑, ∫, √, ∞, ±, ÷, ×, α, β, θ, Δ)
  - 3D mathematical formulas (x²+y², a²+b²=c², E=mc², etc.)
  - Geometric shapes (octahedrons, icosahedrons, torus)
  - Animated particle field
  - Dynamic grid background
  - Professional lighting with multiple colored lights
  - Smooth floating and rotation animations

### 2. MathCanvasSimple (2D Text Version - Fallback)
- **File**: `src/components/MathCanvasSimple.tsx`
- **Features**: Same as above but uses 2D text rendering for better performance
- **Use when**: You experience performance issues with 3D text

## Current Implementation
The home page (`src/app/page.tsx`) currently uses `MathCanvas` (3D version).

## How to Switch Versions

### To use the Simple version (better performance):
In `src/app/page.tsx`, change the import:

```typescript
// Change from:
import MathCanvas from "@/components/MathCanvas";

// To:
import MathCanvas from "@/components/MathCanvasSimple";
```

## Animation Features

### Numbers
- All digits 0-9 float in 3D space
- Smooth rotation on Y and X axes
- Different colors for visual variety

### Mathematical Symbols
- Greek letters: α, β, θ, Δ
- Operators: π, ∑, ∫, √, ∞, ±, ÷, ×
- Gentle Z-axis rotation

### Formulas
- Common equations: x²+y², a²+b²=c², E=mc²
- Function notation: f(x), dy/dx
- Trigonometric: sin, cos
- Calculus: lim

### Visual Effects
- 1000 floating particles creating depth
- Animated mathematical grid plane
- Multiple colored point lights (blue, purple, cyan)
- Fog effect for atmospheric depth
- Gradient background (slate → blue → purple)

## Color Palette
- Primary Blue: `#4f46e5`
- Cyan: `#06b6d4`
- Purple: `#8b5cf6`
- Pink: `#ec4899`
- Amber: `#f59e0b`
- Green: `#10b981`

## Performance Tips
1. The 3D text version requires the font file at `/public/fonts/helvetiker_bold.typeface.json`
2. If you experience lag, switch to `MathCanvasSimple`
3. Adjust `dpr` in Canvas component for lower-end devices
4. Reduce particle count in `Particles` component if needed

## Customization

### Add More Numbers/Symbols
Edit the arrays in `MathElements` function:
```typescript
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const symbols = ['π', '∑', '∫', '√', '∞', '±', '÷', '×', 'α', 'β', 'θ', 'Δ'];
const formulas = ['x²+y²', 'a²+b²=c²', 'E=mc²', 'f(x)', 'dy/dx', 'lim', 'sin', 'cos'];
```

### Adjust Animation Speed
Modify the `speed` prop in `Float` components:
```typescript
<Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
```

### Change Colors
Update the `colors` array:
```typescript
const colors = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
```

### Modify Lighting
Adjust light positions and intensities in the `Canvas` component:
```typescript
<spotLight position={[20, 25, 15]} intensity={2.5} />
<pointLight position={[-15, -10, -5]} intensity={1.8} color="#6366f1" />
```

## Dependencies
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F
- `three` - 3D library
- `framer-motion` - For page-level animations (already in use)

All dependencies are already installed in the project.

## Browser Compatibility
- Works in all modern browsers with WebGL support
- Best performance in Chrome/Edge
- Safari may have slightly reduced performance
- Mobile devices: Use MathCanvasSimple for better performance
