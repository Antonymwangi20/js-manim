import * as THREE from "three";
import { createCanvas } from "canvas";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Try to use headless-gl for WebGL context, fallback to canvas
let gl;
try {
  gl = require('headless-gl');
} catch (e) {
  console.warn('headless-gl not available, using fallback renderer');
}

export class ThreeRenderer {
  constructor(width = 800, height = 600, backgroundColor = "#ffffff") {
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.frameCount = 0;
    this.frameBuffer = [];
    this.framesDir = "./frames_tmp_3d";

    // Create WebGL context if available
    if (gl) {
      this.glContext = gl(width, height, { preserveDrawingBuffer: true });
      this.canvas = { width, height, getContext: () => this.glContext };
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        context: this.glContext,
        antialias: true
      });
    } else {
      // Fallback: use canvas for 2D projections
      this.canvas = createCanvas(width, height);
      this.ctx = this.canvas.getContext("2d");
      this.renderer = null; // No WebGL renderer
    }

    // Setup Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Initialize objects cache
    this.threeObjects = new Map();
  }

  drawFrame(objects, time) {
    // Update Three.js objects
    this._syncObjects(objects);

    if (this.renderer) {
      // Use WebGL renderer
      this.renderer.setSize(this.width, this.height);
      this.renderer.render(this.scene, this.camera);

      // Read pixels from WebGL context
      const pixels = new Uint8Array(this.width * this.height * 4);
      this.glContext.readPixels(0, 0, this.width, this.height, this.glContext.RGBA, this.glContext.UNSIGNED_BYTE, pixels);

      // Create canvas from pixels
      const canvas = createCanvas(this.width, this.height);
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(this.width, this.height);

      // Flip Y axis (WebGL vs Canvas coordinate systems)
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const srcIndex = (y * this.width + x) * 4;
          const dstIndex = ((this.height - 1 - y) * this.width + x) * 4;
          imageData.data[dstIndex] = pixels[srcIndex];     // R
          imageData.data[dstIndex + 1] = pixels[srcIndex + 1]; // G
          imageData.data[dstIndex + 2] = pixels[srcIndex + 2]; // B
          imageData.data[dstIndex + 3] = pixels[srcIndex + 3]; // A
        }
      }

      ctx.putImageData(imageData, 0, 0);
      this.frameBuffer.push(canvas.toBuffer("image/png"));
    } else {
      // Fallback: render as 2D projections
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this._renderObjects2D(objects);
      this.frameBuffer.push(this.canvas.toBuffer("image/png"));
    }

    this.frameCount++;
  }

  _syncObjects(objects) {
    // Clear existing objects
    this.scene.children = this.scene.children.filter(child =>
      child.type === 'Light' || child.type === 'AmbientLight'
    );

    // Add/update objects
    objects.forEach(obj => {
      if (obj.constructor.name === "Sphere") {
        this._syncSphere(obj);
      } else if (obj.constructor.name === "Box") {
        this._syncBox(obj);
      }
    });
  }

  _syncSphere(sphere) {
    let threeObj = this.threeObjects.get(sphere);
    if (!threeObj) {
      const geometry = new THREE.SphereGeometry(sphere.radius || 1, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: this._parseColor(sphere.color || 0x00a0f0),
        shininess: 100
      });
      threeObj = new THREE.Mesh(geometry, material);
      this.threeObjects.set(sphere, threeObj);
    }

    threeObj.position.set(sphere.position.x, sphere.position.y, sphere.position.z);
    threeObj.scale.setScalar(sphere.scale);
    threeObj.rotation.set(sphere.rotation.x, sphere.rotation.y, sphere.rotation.z);

    this.scene.add(threeObj);
  }

  _syncBox(box) {
    let threeObj = this.threeObjects.get(box);
    if (!threeObj) {
      const geometry = new THREE.BoxGeometry(
        box.width || 1,
        box.height || 1,
        box.depth || 1
      );
      const material = new THREE.MeshPhongMaterial({
        color: this._parseColor(box.color || 0xff00ff),
        shininess: 100
      });
      threeObj = new THREE.Mesh(geometry, material);
      this.threeObjects.set(box, threeObj);
    }

    threeObj.position.set(box.position.x, box.position.y, box.position.z);
    threeObj.scale.setScalar(box.scale);
    threeObj.rotation.set(box.rotation.x, box.rotation.y, box.rotation.z);

    this.scene.add(threeObj);
  }

  _parseColor(color) {
    if (typeof color === 'string') {
      return new THREE.Color(color);
    }
    return color;
  }

  _renderObjects2D(objects) {
    objects.forEach(obj => {
      if (obj.constructor.name === "Sphere") {
        this._renderSphere2D(obj);
      } else if (obj.constructor.name === "Box") {
        this._renderBox2D(obj);
      }
    });
  }

  _renderSphere2D(sphere) {
    const x = this.width / 2 + sphere.position.x * 50;
    const y = this.height / 2 + sphere.position.y * 50;
    const radius = (sphere.radius || 1) * sphere.scale * 30;

    this.ctx.fillStyle = this._colorToCSS(sphere.color || 0x00a0f0);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  _renderBox2D(box) {
    const x = this.width / 2 + box.position.x * 50;
    const y = this.height / 2 + box.position.y * 50;
    const w = (box.width || 1) * box.scale * 40;
    const h = (box.height || 1) * box.scale * 40;

    this.ctx.fillStyle = this._colorToCSS(box.color || 0xff00ff);
    this.ctx.fillRect(x - w/2, y - h/2, w, h);
  }

  _colorToCSS(color) {
    if (typeof color === 'string') return color;
    return `#${color.toString(16).padStart(6, '0')}`;
  }

  async finalize(outputFile) {
    if (!fs.existsSync(this.framesDir)) {
      fs.mkdirSync(this.framesDir, { recursive: true });
    }

    for (let i = 0; i < this.frameBuffer.length; i++) {
      const framePath = path.join(
        this.framesDir,
        `frame_${String(i).padStart(6, "0")}.png`
      );
      fs.writeFileSync(framePath, this.frameBuffer[i]);
    }

    return new Promise((resolve, reject) => {
      const ext = path.extname(outputFile).toLowerCase();
      const format = ext === ".webm" ? "libvpx-vp9" : "libx264";
      const inputPattern = path.join(this.framesDir, "frame_%06d.png");

      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-framerate",
        "30",
        "-i",
        inputPattern,
        "-c:v",
        format,
        "-pix_fmt",
        "yuv420p",
        outputFile,
      ]);

      ffmpeg.on("close", code => {
        try {
          fs.rmSync(this.framesDir, { recursive: true });
        } catch (e) {}

        if (code === 0) {
          console.log(`✓ 3D video saved to ${outputFile}`);
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on("error", err => {
        reject(err);
      });
    });
  }
}
