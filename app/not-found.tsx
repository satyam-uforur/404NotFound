'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function BrokenGlobe() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += 0.002
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })

  const edges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2, 3))

  return (
    <group ref={groupRef}>
      <lineSegments>
        <primitive object={edges} attach="geometry" />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </lineSegments>
      <lineSegments position={[0.5, 0.3, -0.5]} rotation={[0.3, 0.5, 0.2]}>
        <primitive object={new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.8, 2))} attach="geometry" />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </lineSegments>
      <pointLight position={[3, 3, 3]} intensity={0.3} />
    </group>
  )
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="bg-black min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        {mounted && (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.15} />
            <BrokenGlobe />
          </Canvas>
        )}
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[8rem] md:text-[14rem] font-serif font-bold text-white/[0.03] leading-none tracking-tighter">
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-[-2rem] md:mt-[-4rem]"
        >
          <p className="text-white/20 text-sm font-mono tracking-[0.3em] uppercase mb-2">
            Signal Lost
          </p>
          <p className="text-white/10 text-xs font-mono tracking-wider mb-10">
            The page you are looking for does not exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-white text-black text-sm font-medium tracking-wide hover:bg-white/90 transition-all"
            >
              Return Home
            </Link>
            <Link
              href="/shop"
              className="px-8 py-4 border border-white/10 text-white/30 text-sm font-medium hover:text-white/70 hover:border-white/20 transition-all"
            >
              Browse Archive
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 grain mix-blend-overlay pointer-events-none" />
    </div>
  )
}
