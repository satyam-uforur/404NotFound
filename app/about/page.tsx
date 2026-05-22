'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const PILLARS = [
  { number: '001', title: 'Identity', description: 'We believe what you wear is a signal. A frequency broadcast to the world. Every design captures a piece of internet culture — not trends, but truths.' },
  { number: '002', title: 'Expression', description: 'From meme culture to devotional art, from gaming lore to code aesthetics. Every subculture deserves its archive. This is ours.' },
  { number: '003', title: 'Community', description: '404NotFoundIN is not a brand. It is a movement. Built by people who live online, create online, and express online.' },
  { number: '004', title: 'Quality', description: 'Premium materials. Ethical production. Designs that last. Every piece is crafted to be a permanent artifact, not a seasonal throwaway.' },
]

function PillarSection({ pillar }: { pillar: typeof PILLARS[0] }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-15%' })

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="py-20 md:py-32 px-6 md:px-10 border-b border-border"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-2">
          <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase">{pillar.number}</span>
        </div>
        <div className="md:col-span-10">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-gradient mb-6">{pillar.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-light">{pillar.description}</p>
        </div>
      </div>
    </motion.section>
  )
}

export default function AboutPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <div className="bg-background min-h-screen pt-20">
      <section ref={heroRef} className="py-20 md:py-40 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }} className="mb-6">
            <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase">Manifesto</span>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground tracking-tight max-w-4xl"
            initial={{ opacity: 0, y: 40 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            We are the signal in the noise.
          </motion.h1>
          <motion.p
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            404NotFoundIN is a premium digital culture platform. We archive internet devotion —
            from sound to motion, chaos to order, memes to monuments.
          </motion.p>
        </div>
      </section>
      {PILLARS.map((pillar) => (
        <PillarSection key={pillar.number} pillar={pillar} />
      ))}
      <section className="py-32 px-6 md:px-10 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
          <p className="text-2xl md:text-4xl font-serif font-light text-foreground/30 leading-relaxed">
            Not a store. <span className="text-foreground/60">Not a brand.</span><br />
            A digital culture archive.
          </p>
        </motion.div>
      </section>
    </div>
  )
}
