import { MObject } from "../core/MObject.js";

// Helper function to normalize shape properties
function normalizeProps(props, defaults) {
  if (typeof props === 'object' && !Array.isArray(props)) {
    return { ...defaults, ...props };
  }
  // If not an object, treat as primary property value
  if (typeof props === 'string' || typeof props === 'number') {
    return { ...defaults, [defaults.primary]: props };
  }
  // Handle array format [primary, secondary1, secondary2, ...]
  if (Array.isArray(props)) {
    const result = { ...defaults };
    result[defaults.primary] = props[0];
    defaults.secondary.forEach((key, index) => {
      if (props[index + 1] !== undefined) {
        result[key] = props[index + 1];
      }
    });
    return result;
  }
  return defaults;
}

export class Circle extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'radius',
      secondary: ['color'],
      radius: 30,
      color: "#00a0f0",
      opacity: 1
    });
    super();
    this.radius = config.radius;
    this.color = config.color;
    this.opacity = config.opacity;
  }
}

export class Rectangle extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'width',
      secondary: ['height', 'color'],
      width: 60,
      height: 60,
      color: "#ff00ff",
      opacity: 1,
      borderRadius: 0
    });
    super();
    this.width = config.width;
    this.height = config.height;
    this.color = config.color;
    this.opacity = config.opacity;
    this.borderRadius = config.borderRadius;
  }
}

export class Square extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'size',
      secondary: ['color'],
      size: 60,
      color: "#ff00ff",
      opacity: 1,
      borderRadius: 0
    });
    super();
    this.size = config.size;
    this.color = config.color;
    this.opacity = config.opacity;
    this.borderRadius = config.borderRadius;
  }
}

export class Triangle extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'color',
      secondary: ['size'],
      size: 60,
      color: "#00ff00",
      opacity: 1
    });
    super();
    this.size = config.size;
    this.color = config.color;
    this.opacity = config.opacity;
  }
}

export class Line extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'length',
      secondary: ['color'],
      length: 100,
      color: "#000000",
      opacity: 1,
      thickness: 2
    });
    super();
    this.length = config.length;
    this.color = config.color;
    this.opacity = config.opacity;
    this.thickness = config.thickness;
  }
}

export class Ellipse extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'width',
      secondary: ['height', 'color'],
      width: 80,
      height: 60,
      color: "#ffa500",
      opacity: 1
    });
    super();
    this.width = config.width;
    this.height = config.height;
    this.color = config.color;
    this.opacity = config.opacity;
  }
}

export class Arc extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'radius',
      secondary: ['startAngle', 'endAngle', 'color'],
      radius: 50,
      startAngle: 0,
      endAngle: Math.PI,
      color: "#ff4500",
      opacity: 1,
      thickness: 2
    });
    super();
    this.radius = config.radius;
    this.startAngle = config.startAngle;
    this.endAngle = config.endAngle;
    this.color = config.color;
    this.opacity = config.opacity;
    this.thickness = config.thickness;
  }
}

export class Polygon extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'sides',
      secondary: ['radius', 'color'],
      sides: 6,
      radius: 50,
      color: "#ffff00",
      opacity: 1
    });
    super();
    this.sides = config.sides;
    this.radius = config.radius;
    this.color = config.color;
    this.opacity = config.opacity;
  }
}

export class Text extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'text',
      secondary: ['fontSize', 'color'],
      text: "",
      fontSize: 20,
      color: "#000000",
      opacity: 1,
      fontFamily: "Arial"
    });
    super();
    this.text = config.text;
    this.fontSize = config.fontSize;
    this.color = config.color;
    this.opacity = config.opacity;
    this.fontFamily = config.fontFamily;
  }
}

export class Star extends MObject {
  constructor(props = {}) {
    const config = normalizeProps(props, {
      primary: 'outerRadius',
      secondary: ['innerRadius', 'points', 'color'],
      outerRadius: 50,
      innerRadius: 25,
      points: 5,
      color: "#ffd700",
      opacity: 1
    });
    super();
    this.outerRadius = config.outerRadius;
    this.innerRadius = config.innerRadius;
    this.points = config.points;
    this.color = config.color;
    this.opacity = config.opacity;
  }
}
