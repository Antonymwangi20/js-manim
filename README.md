# js-manim

A Manim-style animation framework for JavaScript that renders to MP4/WebM videos headlessly using Node.js.

## ✨ Features

- **Zero boilerplate**: No `MediaRecorder`, `Blob`, or manual encoding
- **CLI-first**: `manjs -qh scene.js output.mp4`
- **2D + 3D**: Canvas for 2D, simplified 3D rendering
- **ESM modules**: Modern JavaScript everywhere
- **Auto MP4/WebM encoding**: FFmpeg integration
- **Multiple quality settings**: From preview to ultra-high quality
- **Timeline-based animation**: Schedule sequential, parallel, and staggered animations
- **Rich easing functions**: All standard easings plus custom functions
- **Chained movements**: Complex animation sequences with different easings per segment
- **Transform hierarchies**: Proper parent-child transform composition

## 🚀 Quick Start

```bash
git clone https://github.com/Antonymwangi20/js-manim.git
cd js-manim
npm install
npm link  # Makes 'manjs' available globally
```

## 📝 Usage Examples

### Timeline-Based Animation

```javascript
import { Scene, animate, Circle, Square } from "js-manim";

export async function main() {
  const scene = new Scene({ mode: "2D" });

  const circle = new Circle({ radius: 30, color: "#00a0f0" });
  const square = new Square({ size: 50, color: "#00ff00" });

  scene.add(circle, square);

  // Sequential animations
  scene.play(animate(circle).shift({ x: 200 }).duration(2));
  scene.play(animate(square).shift({ x: 200 }).duration(1.5));

  // Wait between animations
  scene.wait(0.5);

  // Parallel animations
  scene.play([
    animate(circle).scale(1.5).duration(1),
    animate(square).rotateZ(Math.PI).duration(1)
  ]);

  // Staggered animations with lag
  scene.play([
    animate(circle).shift({ y: -100 }).duration(1),
    animate(square).shift({ y: -100 }).duration(1)
  ], { lagRatio: 0.2 }); // 0.2 second delay between each

  return scene;
}
```

### 2D Animation

```javascript
import { Scene, animate, Circle, Text } from "js-manim";

export async function main() {
  const scene = new Scene({ mode: "2D" });

  const circle = new Circle(40, "#00a0f0");
  const label = new Text("Hello World", 24, "#000000");

  scene.add(circle, label);
  scene.play(
    animate(circle).scale(2).duration(2),
    animate(label).shift({ x: 0, y: 100 }).duration(2)
  );

  return scene;
}
```

### 3D Animation

```javascript
import { Scene, animate, Sphere } from "js-manim";

export async function main() {
  const scene = new Scene({ mode: "3D" });

  const sphere = new Sphere(1, 0x00a0f0);

  scene.add(sphere);
  scene.play(
    animate(sphere).scale(2).rotateZ(Math.PI * 2).duration(3)
  );

  return scene;
}
```

## 🎬 CLI Commands

```bash
# Basic usage
npx manjs scene.js

# Quality settings
npx manjs -ql scene.js          # Low quality (854x480, 15fps)
npx manjs -qp scene.js          # Presentation quality (1920x1080, 30fps)
npx manjs -qh scene.js          # High quality (2560x1440, 60fps)
npx manjs -qk scene.js          # Ultra quality (3840x2160, 60fps)

# Custom output file
npx manjs -qh scene.js -o my_animation.webm

# Version info
npx manjs --version
```

## 🏗️ Architecture

### Core Components

1. **Scene** (`src/core/Scene.js`): Manages objects and animations
2. **MObject** (`src/core/MObject.js`): Base class for animatable objects
3. **Renderers**:
   - `CanvasRenderer`: 2D rendering with node-canvas
   - `ThreeRenderer`: Simplified 3D rendering
4. **Shapes**: 2D and 3D geometric primitives
5. **CLI** (`bin/manjs`): Command-line interface

### Animation System

```javascript
// Chainable animation API
animate(object)
  .scale(2)           // Scale by factor of 2
  .rotateZ(Math.PI)   // Rotate 180 degrees
  .shift({x: 100})    // Move 100 units right
  .duration(2)        // Over 2 seconds
```

## 📚 API Reference

### Scene
```javascript
const scene = new Scene({ mode: "2D" });  // or "3D"
scene.add(circle, text);                  // Add objects
scene.play(animation1, animation2);       // Add animations
```

### Shapes

#### 2D Shapes
```javascript
const circle = new Circle(radius, color);
const rect = new Rectangle(width, height, color);
const text = new Text("Hello", fontSize, color);
```

#### 3D Shapes
```javascript
const sphere = new Sphere(radius, color);
const box = new Box(width, height, depth, color);
```

### Animations
```javascript
animate(object).scale(factor)
animate(object).rotateZ(angle)
animate(object).shift({x, y, z})
animate(object).duration(seconds)
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Test examples
npm run test:2d   # Renders scenes/2d_demo.js
npm run test:3d   # Renders scenes/3d_demo.js

# Link globally for development
npm link
```

## 📦 Dependencies

- `canvas`: Headless HTML5 canvas
- `three`: 3D math utilities
- `canvas-record`: Frame capture utilities
- `ffmpeg-static`: Video encoding

## 🎯 Quality Settings

| Flag | Resolution | FPS | Use Case |
|------|------------|-----|----------|
| `-ql` | 854×480   | 15  | Fast preview |
| `-qp` | 1920×1080 | 30  | Presentations |
| `-qh` | 2560×1440 | 60  | High quality |
| `-qk` | 3840×2160 | 60  | Ultra quality |

## 📄 License

MIT - See LICENSE file for details
