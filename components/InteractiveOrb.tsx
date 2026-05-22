'use client'

import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireframeGlobe({ detail }: { detail: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let ticking = false
    const onMove = (e: MouseEvent) => {
      if (ticking) return
      ticking = true
      rafRef.current = requestAnimationFrame(() => {
        setMouse({ x: e.clientX, y: e.clientY })
        ticking = false
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const w = typeof window !== 'undefined' ? window.innerWidth : 1
    const h = typeof window !== 'undefined' ? window.innerHeight : 1

    mouseRef.current.x += ((mouse.x / w - 0.5) * 0.15 - mouseRef.current.x) * 0.01
    mouseRef.current.y += ((mouse.y / h - 0.5) * 0.15 - mouseRef.current.y) * 0.01

    groupRef.current.rotation.y += 0.0008
    groupRef.current.rotation.x += (mouseRef.current.y * 0.3 - groupRef.current.rotation.x) * 0.015
    groupRef.current.rotation.y += mouseRef.current.x * 0.01

    if (innerRef.current) {
      const mouseInfluence = Math.sqrt(mouseRef.current.x ** 2 + mouseRef.current.y ** 2)
      const innerSpeed = 0.0004 + mouseInfluence * 0.008
      innerRef.current.rotation.y -= innerSpeed
      innerRef.current.rotation.x -= (mouseRef.current.y * 0.3 - innerRef.current.rotation.x) * (0.005 + mouseInfluence * 0.02)
    }

    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.4) * 0.015
    groupRef.current.scale.setScalar(breathe)
  })

  const d = detail

  const primaryEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2, d)
    return new THREE.EdgesGeometry(geo)
  }, [d])

  const outerEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.6, Math.max(d - 2, 1))
    return new THREE.EdgesGeometry(geo)
  }, [d])

  const innerEdges = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, Math.max(d - 1, 2))
    return new THREE.EdgesGeometry(geo)
  }, [d])

  return (
    <group ref={groupRef}>
      <lineSegments>
        <primitive object={primaryEdges} attach="geometry" />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </lineSegments>
      <lineSegments>
        <primitive object={outerEdges} attach="geometry" />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </lineSegments>
      <group ref={innerRef}>
        <lineSegments>
          <primitive object={innerEdges} attach="geometry" />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.22} />
        </lineSegments>
      </group>
      <pointLight position={[3, 3, 3]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.15} color="#666666" />
    </group>
  )
}

export function InteractiveOrb() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    let resizeTimer: ReturnType<typeof setTimeout>
    const debounced = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(check, 150)
    }
    window.addEventListener('resize', debounced, { passive: true })
    return () => {
      window.removeEventListener('resize', debounced)
      clearTimeout(resizeTimer)
    }
  }, [])

  if (!mounted) {
    return <div className="relative w-full h-[45vh] md:h-[70vh] lg:h-[80vh]" />
  }

  return (
    <div className="relative w-full h-[45vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <Canvas
          camera={{ position: [0, 0, isMobile ? 6.5 : 5.5], fov: isMobile ? 32 : 40 }}
          style={{ width: '100%', height: '100%' }}
          gl={{
            antialias: !isMobile,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          dpr={isMobile ? 1 : 1.5}
          frameloop="always"
        >
          <ambientLight intensity={0.12} />
          <directionalLight position={[5, 5, 5]} intensity={0.25} />
          <WireframeGlobe detail={isMobile ? 2 : 4} />
        </Canvas>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.95) 100%)',
        }}
      />
    </div>
  )
}
