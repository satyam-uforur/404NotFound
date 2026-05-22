'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const FOOTER_LINKS = {
  Culture: [
    { label: 'Music', href: '/shop?category=music' },
    { label: 'Meme Culture', href: '/shop?category=memes' },
    { label: 'Gaming', href: '/shop?category=gaming' },
    { label: 'Anime', href: '/shop?category=anime' },
    { label: 'Devotional', href: '/shop?category=devotional' },
  ],
  Platform: [
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Drops', href: '/shop?filter=trending' },
  ],
  Connect: [
    { label: 'Instagram', href: '#' },
    { label: 'Twitter / X', href: '#' },
    { label: 'Discord', href: '#' },
    { label: 'Email', href: 'mailto:hello@404notfound.in' },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-foreground/[0.06] mt-20">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-16">
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
                404
              </h3>
              <p className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                NotFoundIN
              </p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              A premium digital culture platform. Internet identity, aesthetic drops,
              and curated merchandise for every subculture.
            </p>
          </motion.div>

          {Object.entries(FOOTER_LINKS).map(([title, links], sectionIdx) => (
            <motion.div
              key={title}
              className="md:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: sectionIdx * 0.1 }}
            >
              <h4 className="text-[10px] md:text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-5 md:mb-6">
                {title}
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {links.map((link) => (
                  <li key={`${title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/25 hover:text-foreground/70 transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-foreground/[0.06] pt-8 md:pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] md:text-[12px] text-foreground/20 tracking-wide">
            &copy; {currentYear} 404NotFoundIN. All rights reserved.
          </p>
          <div className="flex gap-6 md:gap-8">
            <Link href="/privacy" className="text-[11px] md:text-[12px] text-foreground/20 hover:text-foreground/50 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[11px] md:text-[12px] text-foreground/20 hover:text-foreground/50 transition-colors">
              Terms
            </Link>
            <Link href="/refund-policy" className="text-[11px] md:text-[12px] text-foreground/20 hover:text-foreground/50 transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
