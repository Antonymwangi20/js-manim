export class Scene {
  constructor({ mode = "2D", renderer = null, backgroundColor = "#ffffff" } = {}) {
    this.mode = mode;
    this.objects = [];
    this.timeline = [];
    this.currentTime = 0;
    this.renderer = renderer;
    this.time = 0;
    this.running = false;
    this.fps = 60;
    this.duration = 5;
    this.backgroundColor = backgroundColor;
  }

  add(...objs) {
    this.objects.push(...objs);
    return this;
  }

  play(anims, options = {}) {
    if (!Array.isArray(anims)) {
      anims = [anims];
    }
    const { lagRatio = 0 } = options;

    let offset = 0;
    let maxEnd = 0;

    anims.forEach(anim => {
      anim.startTime = this.currentTime + offset;
      this.timeline.push(anim);

      const end = anim.startTime + anim.getTotalDuration();
      maxEnd = Math.max(maxEnd, end);

      offset += lagRatio * anim.getTotalDuration();
    });

    this.currentTime = maxEnd;
  }

  wait(seconds) {
    this.currentTime += seconds;
  }

  async render({ fps = 60, duration = null, outputFile = "output.mp4", width = 1280, height = 720 } = {}) {
    if (!this.renderer) {
      // Auto-create renderer based on mode
      if (this.mode === "3D") {
        const { ThreeRenderer } = await import("../renderers/ThreeRenderer.js");
        this.renderer = new ThreeRenderer(width, height, this.backgroundColor);
      } else {
        const { CanvasRenderer } = await import("../renderers/CanvasRenderer.js");
        this.renderer = new CanvasRenderer(width, height, this.backgroundColor);
      }
    }

    this.fps = fps;
    this.outputFile = outputFile;

    // Calculate total duration from timeline if not provided
    if (duration === null) {
      this.duration = this.timeline.length > 0
        ? Math.max(...this.timeline.map(anim => anim.startTime + anim.getTotalDuration()))
        : 5;
    } else {
      this.duration = duration;
    }

    return new Promise((resolve, reject) => {
      this._animationLoop(0, resolve, reject);
    });
  }

  _animationLoop(frameIndex, resolve, reject) {
    const totalFrames = Math.floor(this.fps * this.duration);
    const currentTime = frameIndex / this.fps;

    if (frameIndex >= totalFrames) {
      this.renderer
        .finalize(this.outputFile)
        .then(resolve)
        .catch(reject);
      return;
    }

    try {
      this.timeline.forEach(anim => {
        const localTime = currentTime - anim.startTime;

        if (localTime < 0 || localTime > anim.getTotalDuration()) return;

        this._applyTransform(anim.obj, anim, localTime);
      });

      this.renderer.drawFrame(this.objects, currentTime);

      setImmediate(() => {
        this._animationLoop(frameIndex + 1, resolve, reject);
      });
    } catch (err) {
      reject(err);
    }
  }

  _applyTransform(obj, anim, localTime) {
    const totalDuration = anim.getTotalDuration();
    const t = localTime / totalDuration;

    // Store original values on first application
    if (!obj._animationOriginal) {
      obj._animationOriginal = {};
      if (anim.props.scale !== undefined) {
        obj._animationOriginal.scale = obj.scale;
      }
      if (anim.props.rotationZ !== undefined) {
        obj._animationOriginal.rotationZ = obj.rotationZ;
      }
      if (anim.props.fontSize !== undefined) {
        obj._animationOriginal.fontSize = obj.fontSize;
      }
      if (anim.props.position) {
        obj._animationOriginal.position = { ...obj.position };
      }
    }

    // Handle scale
    if (anim.props.scale !== undefined) {
      const originalScale = obj._animationOriginal.scale ?? 1;
      obj.scale = originalScale + (anim.props.scale - originalScale) * anim.easing(t);
    }

    // Handle rotation
    if (anim.props.rotationZ !== undefined) {
      const originalRotationZ = obj._animationOriginal.rotationZ ?? 0;
      obj.rotationZ = originalRotationZ + (anim.props.rotationZ - originalRotationZ) * anim.easing(t);
    }

    // Handle fontSize
    if (anim.props.fontSize !== undefined) {
      const originalFontSize = obj._animationOriginal.fontSize ?? 20;
      obj.fontSize = originalFontSize + (anim.props.fontSize - originalFontSize) * anim.easing(t);
    }

    // Handle position - now supports movement sequences
    if (anim._movementSequence.length > 0 || anim.props.position) {
      obj.position = anim._getPositionAtTime(localTime);
    }
  }
}
