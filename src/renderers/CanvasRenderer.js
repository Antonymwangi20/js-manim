import { createCanvas } from "canvas";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export class CanvasRenderer {
  constructor(width = 800, height = 600, backgroundColor = "#ffffff") {
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");
    this.frameCount = 0;
    this.frameBuffer = [];
    this.framesDir = "./frames_tmp";
  }

  drawFrame(objects, time) {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this._drawObjects(objects);
    const buffer = this.canvas.toBuffer("image/png");
    this.frameBuffer.push(buffer);
    this.frameCount++;
  }

  _worldToCanvas(x, y) {
    return {
      x: this.width / 2 + x,
      y: this.height / 2 - y
    };
  }

  _drawObjects(objects, parentTransform = {}) {
    objects.forEach(obj => {
      const transform = {
        position: {
          x: (parentTransform.position?.x || 0) + (obj.position?.x || 0),
          y: (parentTransform.position?.y || 0) + (obj.position?.y || 0),
          z: (parentTransform.position?.z || 0) + (obj.position?.z || 0),
        },
        scale: (parentTransform.scale || 1) * (obj.scale || 1),
        rotationZ: (parentTransform.rotationZ || 0) + (obj.rotationZ || 0),
        opacity: (parentTransform.opacity ?? 1) * (obj.opacity ?? 1),
      };

      if (obj.constructor.name === "Circle") {
        this._drawCircle(obj, transform);
      } else if (obj.constructor.name === "Rectangle") {
        this._drawRectangle(obj, transform);
      } else if (obj.constructor.name === "Square") {
        this._drawSquare(obj, transform);
      } else if (obj.constructor.name === "Triangle") {
        this._drawTriangle(obj, transform);
      } else if (obj.constructor.name === "Line") {
        this._drawLine(obj, transform);
      } else if (obj.constructor.name === "Polygon") {
        this._drawPolygon(obj, transform);
      } else if (obj.constructor.name === "Ellipse") {
        this._drawEllipse(obj, transform);
      } else if (obj.constructor.name === "Arc") {
        this._drawArc(obj, transform);
      } else if (obj.constructor.name === "Text") {
        this._drawText(obj, transform);
      } else if (obj.constructor.name === "Star") {
        this._drawStar(obj, transform);
      }

      if (obj.children && obj.children.length > 0) {
        this._drawObjects(obj.children, transform);
      }
    });
  }

  _drawCircle(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    this.ctx.translate(pos.x, pos.y);
    this.ctx.scale(transform.scale || 1, transform.scale || 1);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#00a0f0";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, obj.radius || 30, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  _drawText(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.scale(transform.scale || 1, transform.scale || 1);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#000000";
    this.ctx.font = `${obj.fontSize || 20}px ${obj.fontFamily || 'Arial'}`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(obj.text || "", 0, 0);
    this.ctx.restore();
  }

  _drawRectangle(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const w = (obj.width || 60) * (transform.scale || 1);
    const h = (obj.height || 60) * (transform.scale || 1);
    const radius = obj.borderRadius || 0;

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#ff00ff";

    if (radius > 0) {
      this._drawRoundedRect(-w / 2, -h / 2, w, h, radius);
    } else {
      this.ctx.fillRect(-w / 2, -h / 2, w, h);
    }
    this.ctx.restore();
  }

  _drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  _drawSquare(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const size = (obj.size || 60) * (transform.scale || 1);
    const radius = obj.borderRadius || 0;

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#ff00ff";

    if (radius > 0) {
      this._drawRoundedRect(-size / 2, -size / 2, size, size, radius);
    } else {
      this.ctx.fillRect(-size / 2, -size / 2, size, size);
    }
    this.ctx.restore();
  }

  _drawTriangle(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const size = (obj.size || 60) * (transform.scale || 1);

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.scale(transform.scale || 1, transform.scale || 1);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#00ff00";

    this.ctx.beginPath();
    this.ctx.moveTo(0, -size / 2);
    this.ctx.lineTo(-size / 2, size / 2);
    this.ctx.lineTo(size / 2, size / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  _drawLine(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const length = (obj.length || 100) * (transform.scale || 1);

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.strokeStyle = obj.color || "#000000";
    this.ctx.lineWidth = obj.thickness || 2;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(-length / 2, 0);
    this.ctx.lineTo(length / 2, 0);
    this.ctx.stroke();
    this.ctx.restore();
  }

  _drawEllipse(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const w = (obj.width || 80) * (transform.scale || 1);
    const h = (obj.height || 60) * (transform.scale || 1);

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#ffa500";

    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  _drawArc(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const radius = (obj.radius || 50) * (transform.scale || 1);

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.strokeStyle = obj.color || "#ff4500";
    this.ctx.lineWidth = obj.thickness || 2;
    this.ctx.lineCap = "round";

    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, obj.startAngle || 0, obj.endAngle || Math.PI);
    this.ctx.stroke();
    this.ctx.restore();
  }

  _drawPolygon(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const radius = (obj.radius || 50) * (transform.scale || 1);
    const sides = obj.sides || 6;

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#ffff00";

    this.ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  _drawStar(obj, transform) {
    this.ctx.save();
    const pos = this._worldToCanvas(transform.position?.x || 0, transform.position?.y || 0);
    const outerRadius = (obj.outerRadius || 50) * (transform.scale || 1);
    const innerRadius = (obj.innerRadius || 25) * (transform.scale || 1);
    const points = obj.points || 5;

    this.ctx.translate(pos.x, pos.y);
    this.ctx.rotate(transform.rotationZ || 0);
    this.ctx.globalAlpha = (transform.opacity ?? 1) * (obj.opacity ?? 1);
    this.ctx.fillStyle = obj.color || "#ffd700";

    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
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
        "60",
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
          console.log(`✓ Video saved to ${outputFile}`);
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
