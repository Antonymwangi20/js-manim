import { MObject } from "../core/MObject.js";

export class Sphere extends MObject {
  constructor(radius = 1, color = 0x00a0f0) {
    super();
    this.radius = radius;
    this.color = color;
  }
}

export class Box extends MObject {
  constructor(width = 1, height = 1, depth = 1, color = 0xff00ff) {
    super();
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;
  }
}

export class Axes3D extends MObject {
  constructor() {
    super();
  }
}
