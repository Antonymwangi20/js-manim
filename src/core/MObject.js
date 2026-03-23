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

export class MAnimation {
  constructor(obj) {
    this.obj = obj;
    this.props = {};
    this.duration = 1;
    this.easing = t => t;
  }

  scale(s) {
    this.props.scale = s;
    return this;
  }

  rotateZ(angle) {
    this.props.rotationZ = angle;
    return this;
  }

  shift(delta) {
    this.props.position = delta;
    return this;
  }

  duration(d) {
    this.duration = d;
    return this;
  }
}

export function animate(obj) {
  return new MAnimation(obj);
}