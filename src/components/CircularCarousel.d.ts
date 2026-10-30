import type { ComponentType, CSSProperties } from 'react'

export type CircularCarouselItem = {
  src: string
  alt?: string
  title?: string
  subtitle?: string
  id?: string
}

export type CircularCarouselProps = {
  items?: CircularCarouselItem[]
  preset?: 'cylinder' | 'orbit' | 'wheel' | 'panorama'
  intro?: 'assemble' | 'rise' | 'spin' | 'none'
  cardWidth?: number
  aspectRatio?: number
  gap?: number
  curve?: number
  stretch?: number
  parallax?: number
  autoplay?: 'drift' | 'step' | 'off'
  speed?: number
  interval?: number
  direction?: 'left' | 'right'
  draggable?: boolean
  pauseOnHover?: boolean
  focusOnClick?: boolean
  depthFade?: number
  innerShade?: number
  cornerRadius?: number
  captions?: boolean
  onChange?: (item: CircularCarouselItem, index: number) => void
  onItemClick?: (item: CircularCarouselItem, index: number) => void
  className?: string
  style?: CSSProperties
}

declare const CircularCarousel: ComponentType<CircularCarouselProps>

export default CircularCarousel
