import React from 'react'
import {Image} from '../../common'
import {Point, PointLike} from '@karma.run/editor-common'

declare function require(module: string): any

export interface FocusScaleEditorProps {
  className?: string
  style?: React.CSSProperties
  imageClassName?: string
  imageStyle?: React.CSSProperties
  image: Image
  focusPoint: PointLike
  scale: number
  minScale?: number
  maxScale?: number
  onChange: (focusPoint: PointLike, scale: number) => void
}

export interface FocusScaleEditorState {
  isPanning: boolean
  lastDragPosition: PointLike
  containerSize: PointLike
  startPinchScale: number
}

export class FocusScaleEditor extends React.Component<
  FocusScaleEditorProps,
  FocusScaleEditorState
> {
  private hammerManager: any
  private _container: HTMLDivElement | null = null

  public state: FocusScaleEditorState = {
    isPanning: false,
    lastDragPosition: {x: 0, y: 0},
    containerSize: {x: 0, y: 0},
    startPinchScale: 1
  }

  public constructor(props: FocusScaleEditorProps) {
    super(props)
  }

  private set container(value: HTMLDivElement | null) {
    if (this._container) {
      this._container.removeEventListener('mousedown', this.handleMouseDown)
      this._container.removeEventListener('wheel', this.handleMouseWheel)
      this.hammerManager.destroy()
    }

    this._container = value

    if (this._container) {
      this._container.addEventListener('mousedown', this.handleMouseDown)
      this._container.addEventListener('wheel', this.handleMouseWheel)

      // Hammer.js fails in server environment so we have to require it.
      const Hammer = require('hammerjs')
      const hammerManager = new Hammer(this._container)

      hammerManager.get('pan').set({direction: Hammer.DIRECTION_ALL})
      hammerManager.get('pinch').set({enable: true})

      hammerManager.on('panstart', (e: any) => {
        this.startPan(e.center)
      })

      hammerManager.on('panmove', (e: any) => {
        this.pan(e.center)
      })

      hammerManager.on('panend', () => {
        this.endPan()
      })

      hammerManager.on('pinchstart', () => {
        this.setState({
          startPinchScale: this.props.scale
        })
      })

      hammerManager.on('pinchmove', (e: any) => {
        const scaleOrigin = this.clientToWorld(new Point(e.center.x, e.center.y))
        this.setScale(this.state.startPinchScale * e.scale, scaleOrigin)
      })

      this.hammerManager = hammerManager

      this.setState({
        containerSize: this.getContainerSize()
      })
    }
  }

  private get container(): HTMLDivElement | null {
    return this._container
  }

  private get scaleFactor() {
    const containerSize = this.state.containerSize
    const imageSize = this.getImageSize()

    const widthFactor = containerSize.x / imageSize.x
    const heightFactor = containerSize.y / imageSize.y

    return heightFactor < widthFactor ? widthFactor : heightFactor
  }

  public componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
    window.addEventListener('resize', this.handleResize)
  }

  public componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('resize', this.handleResize)
  }

  private getContainerSize(): PointLike {
    if (!this.container) return new Point()
    const clientRect = this.container.getBoundingClientRect()
    return {x: clientRect.width, y: clientRect.height}
  }

  private handleResize = () => {
    if (this.container) {
      this.setState({
        containerSize: this.getContainerSize()
      })
    }
  }

  private handleContainerRef = (container: HTMLDivElement | null) => {
    this.container = container
  }

  private handleMouseWheel = (e: WheelEvent) => {
    const scale =
      e.deltaY < 0
        ? this.props.scale * 1.1 // Up / Zoom In
        : this.props.scale / 1.1 // Down / Zoom out

    const cursorOrigin = this.clientToWorld(new Point(e.clientX, e.clientY))

    this.setScale(scale, cursorOrigin)
    e.preventDefault()
  }

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    this.startPan({x: e.clientX, y: e.clientY})
  }

  private handleMouseUp = (e: MouseEvent) => {
    this.endPan()
    e.preventDefault()
  }

  private handleMouseMove = (e: MouseEvent) => {
    this.pan({x: e.clientX, y: e.clientY})
    e.preventDefault()
  }

  private startPan(point: PointLike) {
    this.setState({
      isPanning: true,
      lastDragPosition: point
    })
  }

  private pan(point: PointLike) {
    if (!this.state.isPanning || !this.container) return

    const scale = this.getLocalizedScale()
    const focusPoint = new Point(this.props.focusPoint)
    const lastPosition = new Point(this.state.lastDragPosition)

    const pagePoint = new Point(point.x, point.y)
    const offset = pagePoint.substracting(lastPosition).divide(this.getScaledImageSize(scale))
    const newFocusPoint = this.clampFocusPoint(focusPoint.substracting(offset), scale)

    this.props.onChange(newFocusPoint.toObject(), this.props.scale)
    this.setState({lastDragPosition: pagePoint})
  }

  private endPan() {
    if (!this.state.isPanning) return
    this.setState({isPanning: false})
  }

  private setScale(scale: number, scaleOrigin: Point) {
    scale = this.clampScale(scale)

    const oldScale = this.props.scale
    const focusPoint = this.clampFocusPoint(this.props.focusPoint, this.getLocalizedScale(oldScale))

    if (scale == oldScale) return

    const scaleRatio = this.getLocalizedScale(oldScale) / this.getLocalizedScale(scale)
    const offset = focusPoint.substracting(scaleOrigin)
    const scaledOffset = offset.multiplying(scaleRatio)
    const newFocusPoint = this.clampFocusPoint(
      scaledOffset.adding(scaleOrigin),
      this.getLocalizedScale(scale)
    )

    this.props.onChange(newFocusPoint.toObject(), scale)
  }

  private clampScale(scale: number) {
    return Math.min(this.props.maxScale || 3, Math.max(this.props.minScale || 1, scale))
  }

  private clampFocusPoint(focusPointLike: PointLike, scale: number): Point {
    const focusPoint = new Point(focusPointLike)
    const scaleFactor = new Point(this.state.containerSize)
      .divide(this.getScaledImageSize(scale))
      .multiply(0.5)

    return new Point(
      Math.min(1 - scaleFactor.x, Math.max(scaleFactor.x, focusPoint.x)),
      Math.min(1 - scaleFactor.y, Math.max(scaleFactor.y, focusPoint.y))
    )
  }

  private getImageTranslation(scale: number): PointLike {
    const focusPoint = this.clampFocusPoint(this.props.focusPoint, scale)
    const scaleFactor = new Point(this.state.containerSize)
      .divide(this.getImageSize())
      .multiply(0.5)

    return focusPoint
      .multiply(scale)
      .substract(scaleFactor)
      .multiply(100)
  }

  private getImageSize() {
    return new Point(this.props.image.width, this.props.image.height)
  }

  private getScaledImageSize(scale: number) {
    return new Point(this.props.image.width, this.props.image.height).multiply(scale)
  }

  private getLocalizedScale(scale: number = this.props.scale): number {
    return scale * this.scaleFactor
  }

  private clientToWorld(point: Point): Point {
    const containerRect = this.container!.getBoundingClientRect()
    const containerOffset = new Point(containerRect.left, containerRect.top)
    const containerPoint = point.substracting(containerOffset).divide({
      x: containerRect.width,
      y: containerRect.height
    })

    return this.containerToWorld(containerPoint)
  }

  private containerToWorld(point: Point): Point {
    const scale = this.getLocalizedScale()

    const containerSize = new Point(this.state.containerSize)
    const scaleFactor = containerSize.dividing(this.getScaledImageSize(scale))

    const focusPoint = this.clampFocusPoint(this.props.focusPoint, scale)
    const topLeftFocusPoint = focusPoint.substract(scaleFactor.multiplying(0.5))

    return point.multiplying(scaleFactor).add(topLeftFocusPoint)
  }

  public render() {
    const scale = this.getLocalizedScale()
    const translation = this.getImageTranslation(scale)

    const containerStyle: React.CSSProperties = {
      ...this.props.style,
      overflow: 'hidden',
      userSelect: 'none',
      cursor: 'move'
    }

    const imageStyle: React.CSSProperties = {
      ...this.props.imageStyle,
      width: `${this.props.image.width}px`,
      height: `${this.props.image.height}px`,
      transformOrigin: 'top left',
      transform: `translate(${-translation.x}%, ${-translation.y}%) scale(${scale})`
    }

    return (
      <div className={this.props.className} ref={this.handleContainerRef} style={containerStyle}>
        <img className={this.props.imageClassName} style={imageStyle} src={this.props.image.url} />
      </div>
    )
  }
}
