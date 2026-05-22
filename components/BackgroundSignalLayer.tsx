'use client'

import { useEffect, useRef, useCallback } from 'react'

const FRAGMENTS = [
  '404', 'NOT FOUND', 'SIGNAL LOST', 'ARCHIVE ACTIVE', 'ERROR_404',
  'LOST MEMORY', 'MONO_SIGNAL', 'STATIC', 'RENDER_FAIL', 'BREACH',
  'LOADING ARCHIVE', 'DIGITAL ECHO', 'NULL', 'SYSTEM RECALL',
  'AWAITING SIGNAL', '404NOTFOUND', 'SIGNAL DETECTED', 'ACCESS FRAGMENT',
]

const RARE_SATYAM = ['SATYAM', 'S.TIWARI']
const RARE_STRETCH = '404NOTFOUND'
const RARE_ARCHIVE = 'YOU ARE INSIDE THE ARCHIVE'

const ANIMATIONS = [
  'signal_bloom', 'archive_flash', 'ghost_render', 'static_drift',
  'mono_fragment', 'pulse_recall', 'silent_decode', 'binary_bleed',
  'neural_burst', 'wireframe_fade', 'phantom_reveal', 'data_dissolve',
  'shadow_recompile', 'memory_shift', 'signal_distort', 'recursive_echo',
  'void_blink', 'archive_glitch', 'latent_flash', 'satyam_trace',
]

export function BackgroundSignalLayer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef(0)

  const spawnFragment = useCallback(() => {
    if (!containerRef.current) return

    const roll = Math.random()
    let text: string
    let fontSize: number
    let maxOpacity: number
    let blur: number
    let duration: number
    let isSpecial: 'satyam' | 'stretch' | 'archive' | undefined

    if (roll < 0.02) {
      text = RARE_ARCHIVE
      fontSize = 4 + Math.random() * 3
      maxOpacity = 0.06 + Math.random() * 0.04
      blur = 0.5
      duration = 700 + Math.random() * 500
      isSpecial = 'archive'
    } else if (roll < 0.07) {
      text = RARE_SATYAM[Math.floor(Math.random() * RARE_SATYAM.length)]
      fontSize = 1.5 + Math.random() * 2
      maxOpacity = 0.08 + Math.random() * 0.05
      blur = 0.3 + Math.random() * 0.5
      duration = 400 + Math.random() * 300
      isSpecial = 'satyam'
    } else if (roll < 0.12) {
      text = RARE_STRETCH
      fontSize = 1 + Math.random() * 1.2
      maxOpacity = 0.06 + Math.random() * 0.03
      blur = 0.3
      duration = 800 + Math.random() * 600
      isSpecial = 'stretch'
    } else {
      text = FRAGMENTS[Math.floor(Math.random() * FRAGMENTS.length)]
      fontSize = 0.6 + Math.random() * 1.4
      maxOpacity = 0.04 + Math.random() * 0.06
      blur = 0.2 + Math.random() * 1
      duration = 400 + Math.random() * 1400
      isSpecial = undefined
    }

    const animation = ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)]
    const id = counterRef.current++
    const x = Math.random() * 90 + 5
    const y = Math.random() * 90 + 5

    const el = document.createElement('div')
    el.className = `signal-fragment signal-${animation}`
    el.textContent = text
    el.dataset.signalId = String(id)

    el.style.cssText = `
      position: fixed;
      left: ${x}%;
      top: ${y}%;
      transform: translate(-50%, -50%);
      color: #ffffff;
      font-family: ${isSpecial ? "'Playfair Display', serif" : "var(--font-mono), monospace"};
      font-weight: ${isSpecial === 'satyam' ? '700' : '400'};
      letter-spacing: ${isSpecial ? '0.2em' : '0.15em'};
      text-transform: uppercase;
      pointer-events: none;
      white-space: nowrap;
      z-index: 1;
      font-size: ${fontSize}rem;
      opacity: 0;
      filter: blur(${blur}px);
      will-change: opacity, transform;
      animation-duration: ${duration}ms;
      animation-fill-mode: forwards;
      animation-timing-function: ease-in-out;
      --so: ${maxOpacity};
    `

    containerRef.current.appendChild(el)

    setTimeout(() => {
      el.remove()
    }, duration + 100)
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let stopped = false

    const scheduleNext = () => {
      if (stopped) return
      const delay = 1500 + Math.random() * 5000
      timeoutId = setTimeout(() => {
        if (!stopped) {
          spawnFragment()
          if (Math.random() < 0.35) {
            setTimeout(spawnFragment, 80 + Math.random() * 300)
          }
          scheduleNext()
        }
      }, delay)
    }

    const startDelay = 800 + Math.random() * 1500
    const startTimer = setTimeout(() => {
      if (!stopped) {
        spawnFragment()
        scheduleNext()
      }
    }, startDelay)

    return () => {
      stopped = true
      clearTimeout(timeoutId)
      clearTimeout(startTimer)
    }
  }, [spawnFragment])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  )
}
