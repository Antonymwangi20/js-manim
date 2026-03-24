export class MObject {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.scale = 1;
    this.rotationZ = 0;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.opacity = 1;
    this.children = [];
  }

  add(...objs) {
    this.children.push(...objs);
    return this;
  }
}

// Easing functions
export const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - (--t) * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: t => Math.sin((t * Math.PI) / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: t => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: t => Math.sqrt(1 - (t - 1) * (t - 1)),
  easeInOutCirc: t => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
  },
  easeInBack: t => t * t * (2.70158 * t - 1.70158),
  easeOutBack: t => (t - 1) * (t - 1) * (2.70158 * (t - 1) + 1.70158) + 1,
  easeInOutBack: t => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  easeOutBounce: t => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      t -= 1.5 / d1;
      return n1 * t * t + 0.75;
    } else if (t < 2.5 / d1) {
      t -= 2.25 / d1;
      return n1 * t * t + 0.9375;
    } else {
      t -= 2.625 / d1;
      return n1 * t * t + 0.984375;
    }
  },
  easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
  easeOutElastic: t => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutBounce: t => t < 0.5 ? Easing.easeInBounce(t * 2) * 0.5 : Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
};

export class MAnimation {
  constructor(obj) {
    this.obj = obj;
    this.props = {};
    this._duration = 1;
    this.easing = Easing.linear;
    // Store original values for interpolation
    this._originalValues = {};
    // Movement sequence for chained movements
    this._movementSequence = [];
    this._currentSequenceIndex = 0;
    this._sequenceStartTime = 0;
    // Timeline properties
    this.startTime = 0;
  }

  scale(s) {
    this._originalValues.scale = this.obj.scale;
    this.props.scale = s;
    return this;
  }

  rotateZ(angle) {
    this._originalValues.rotationZ = this.obj.rotationZ;
    this.props.rotationZ = angle;
    return this;
  }

  fontSize(size) {
    this._originalValues.fontSize = this.obj.fontSize;
    this.props.fontSize = size;
    return this;
  }

  shift(delta) {
    // If this is the first shift, store original position
    if (this._movementSequence.length === 0) {
      this._originalValues.position = { ...this.obj.position };
    }

    // Add to movement sequence
    this._movementSequence.push({
      type: 'relative',
      delta: { ...delta },
      duration: this._duration,
      easing: this.easing
    });

    // Update props for backward compatibility
    this.props.position = delta;
    return this;
  }

  moveTo(position) {
    // If this is the first movement, store original position
    if (this._movementSequence.length === 0) {
      this._originalValues.position = { ...this.obj.position };
    }

    // Add to movement sequence
    this._movementSequence.push({
      type: 'absolute',
      position: { ...position },
      duration: this._duration,
      easing: this.easing
    });

    // Update props for backward compatibility
    this.props.position = position;
    return this;
  }

  duration(d) {
    this._duration = d;
    return this;
  }

  ease(easingFunction) {
    if (typeof easingFunction === 'string') {
      this.easing = Easing[easingFunction] || Easing.linear;
    } else if (typeof easingFunction === 'function') {
      this.easing = easingFunction;
    }
    return this;
  }

  getTotalDuration() {
    return this._movementSequence.reduce((sum, m) => sum + m.duration, 0);
  }

  // Get current position in movement sequence at given time
  _getPositionAtTime(time) {
    if (this._movementSequence.length === 0) {
      return this._originalValues.position || { x: 0, y: 0, z: 0 };
    }

    let currentTime = 0;
    let currentPos = { ...this._originalValues.position };

    for (const movement of this._movementSequence) {
      const movementEndTime = currentTime + movement.duration;

      if (time <= movementEndTime) {
        // We're in this movement
        const movementProgress = (time - currentTime) / movement.duration;
        const easedProgress = movement.easing(movementProgress);

        if (movement.type === 'relative') {
          return {
            x: currentPos.x + movement.delta.x * easedProgress,
            y: currentPos.y + movement.delta.y * easedProgress,
            z: currentPos.z + (movement.delta.z || 0) * easedProgress
          };
        } else { // absolute
          return {
            x: currentPos.x + (movement.position.x - currentPos.x) * easedProgress,
            y: currentPos.y + (movement.position.y - currentPos.y) * easedProgress,
            z: currentPos.z + ((movement.position.z || 0) - currentPos.z) * easedProgress
          };
        }
      } else {
        // Movement is complete, update current position
        if (movement.type === 'relative') {
          currentPos.x += movement.delta.x;
          currentPos.y += movement.delta.y;
          currentPos.z += movement.delta.z || 0;
        } else {
          currentPos = { ...movement.position };
        }
        currentTime = movementEndTime;
      }
    }

    // All movements complete
    return currentPos;
  }
}

export function animate(obj) {
  return new MAnimation(obj);
}