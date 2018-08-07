export interface PointLike {
  x: number
  y: number
}

export class Point {
  public x: number = 0
  public y: number = 0

  public constructor()
  public constructor(point: PointLike)
  public constructor(x: number, y: number)
  public constructor(xy: number)
  public constructor(...args: (PointLike | number)[]) {
    if (args.length == 1) {
      if (typeof args[0] === 'object') {
        const point = args[0] as PointLike
        this.x = point.x
        this.y = point.y
        return
      }

      this.x = args[0] as number
      this.y = args[0] as number
      return
    }

    if (args.length >= 2) {
      this.x = args[0] as number
      this.y = args[1] as number
      return
    }
  }

  public add(point: PointLike | number): Point {
    if (typeof point === 'number') {
      this.x += point
      this.y += point
    } else {
      this.x += point.x
      this.y += point.y
    }

    return this
  }

  public substract(point: PointLike | number): Point {
    if (typeof point === 'number') {
      this.x -= point
      this.y -= point
    } else {
      this.x -= point.x
      this.y -= point.y
    }

    return this
  }

  public multiply(value: PointLike | number): Point {
    if (typeof value === 'number') {
      this.x *= value
      this.y *= value
    } else {
      this.x *= value.x
      this.y *= value.y
    }

    return this
  }

  public divide(value: PointLike | number): Point {
    if (typeof value === 'number') {
      this.x /= value
      this.y /= value
    } else {
      this.x /= value.x
      this.y /= value.y
    }

    return this
  }

  public adding(value: PointLike | number): Point {
    if (typeof value === 'number') {
      return new Point(this.x + value, this.y + value)
    } else {
      return new Point(this.x + value.x, this.y + value.y)
    }
  }

  public substracting(value: PointLike | number): Point {
    if (typeof value === 'number') {
      return new Point(this.x - value, this.y - value)
    } else {
      return new Point(this.x - value.x, this.y - value.y)
    }
  }

  public dividing(value: PointLike | number): Point {
    if (typeof value === 'number') {
      return new Point(this.x / value, this.y / value)
    } else {
      return new Point(this.x / value.x, this.y / value.y)
    }
  }

  public multiplying(value: PointLike | number): Point {
    if (typeof value === 'number') {
      return new Point(this.x * value, this.y * value)
    } else {
      return new Point(this.x * value.x, this.y * value.y)
    }
  }

  public toObject() {
    return {x: this.x, y: this.y}
  }
}
