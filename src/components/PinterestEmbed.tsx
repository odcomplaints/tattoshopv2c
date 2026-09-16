import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    PinUtils?: { build?: () => void }
  }
}

const PINTEREST_SCRIPT_SRC = '//assets.pinterest.com/js/pinit.js'

function loadPinterestScript() {
  if (document.querySelector(`script[src="${PINTEREST_SCRIPT_SRC}"]`)) {
    window.PinUtils?.build?.()
    return
  }
  const script = document.createElement('script')
  script.src = PINTEREST_SCRIPT_SRC
  script.async = true
  script.defer = true
  document.body.appendChild(script)
}

type PinterestEmbedProps = {
  pinUrl: string
  className?: string
}

export function PinterestEmbed({ pinUrl, className }: PinterestEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPinterestScript()
    const timeout = window.setTimeout(() => window.PinUtils?.build?.(), 300)
    return () => window.clearTimeout(timeout)
  }, [pinUrl])

  return (
    <div ref={containerRef} className={className}>
      <a
        data-pin-do="embedPin"
        data-pin-width="large"
        href={pinUrl}
      >
        {pinUrl}
      </a>
    </div>
  )
}
