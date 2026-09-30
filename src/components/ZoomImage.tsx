import { useRef, useState } from 'react'
import type { MouseEvent, TouchEvent } from 'react'

type ZoomImageProps = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  zoom?: number
  lensSize?: number
}

/**
 * Wraps an <img> with a hover/touch magnifying-glass effect.
 * - Desktop: a square lens follows the mouse cursor, showing a magnified crop of the image
 *   at the exact point underneath the cursor (like a real magnifying glass).
 * - Mobile/touch: dragging a finger over the image shows the same magnified crop as a
 *   full-image overlay, since a small lens would be hidden under the finger.
 *
 * The image is assumed to be displayed with `object-fit: contain`, so the visible
 * image box inside the container may be letterboxed (not filling the container on
 * one axis). We measure the actual rendered image box (not the container box) so
 * the magnified crop isn't stretched.
 */
export function ZoomImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  zoom = 1.6,
  lensSize = 200,
}: ZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [hovering, setHovering] = useState(false)
  const [touching, setTouching] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  const [imageBox, setImageBox] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [percent, setPercent] = useState({ x: 50, y: 50 })

  function getRenderedImageBox() {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img || !img.naturalWidth || !img.naturalHeight) return null

    const containerRect = container.getBoundingClientRect()
    const containerRatio = containerRect.width / containerRect.height
    const imageRatio = img.naturalWidth / img.naturalHeight

    let width = containerRect.width
    let height = containerRect.height
    if (imageRatio > containerRatio) {
      // Image is relatively wider than the container -> letterboxed top/bottom.
      height = containerRect.width / imageRatio
    } else {
      // Image is relatively taller than the container -> letterboxed left/right.
      width = containerRect.height * imageRatio
    }

    const left = containerRect.left + (containerRect.width - width) / 2
    const top = containerRect.top + (containerRect.height - height) / 2

    return { left, top, width, height }
  }

  function updateFromPoint(clientX: number, clientY: number) {
    const container = containerRef.current
    const box = getRenderedImageBox()
    if (!container || !box) return

    const containerRect = container.getBoundingClientRect()
    setLensPos({ x: clientX - containerRect.left, y: clientY - containerRect.top })
    setImageBox(box)

    const x = Math.min(Math.max(clientX - box.left, 0), box.width)
    const y = Math.min(Math.max(clientY - box.top, 0), box.height)
    setPercent({ x: (x / box.width) * 100, y: (y / box.height) * 100 })
  }

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    updateFromPoint(event.clientX, event.clientY)
  }

  function handleTouchMove(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0]
    if (!touch) return
    updateFromPoint(touch.clientX, touch.clientY)
  }

  // Background is sized to the actual rendered image dimensions (not the container,
  // which may be letterboxed) multiplied by the zoom factor, and positioned in
  // pixels so the point under the cursor stays centered in the lens.
  const bgSize = `${imageBox.width * zoom}px ${imageBox.height * zoom}px`
  const bgPosX = -(percent.x / 100) * imageBox.width * zoom + lensSize / 2
  const bgPosY = -(percent.y / 100) * imageBox.height * zoom + lensSize / 2

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHovering(false)}
      onTouchStart={(event) => {
        setTouching(true)
        handleTouchMove(event)
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
    >
      <img ref={imgRef} src={src} alt={alt} draggable={false} className={imgClassName} />

      {hovering && (
        <div
          className="pointer-events-none absolute z-30 hidden overflow-hidden bg-neutral-950 sm:block"
          style={{
            width: lensSize,
            height: lensSize,
            left: lensPos.x - lensSize / 2,
            top: lensPos.y - lensSize / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: bgSize,
            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
          }}
        />
      )}

      {touching && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            backgroundColor: '#0a0a0a',
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: bgSize,
            backgroundPosition: `${-(percent.x / 100) * imageBox.width * zoom + imageBox.width / 2}px ${
              -(percent.y / 100) * imageBox.height * zoom + imageBox.height / 2
            }px`,
          }}
        />
      )}
    </div>
  )
}


