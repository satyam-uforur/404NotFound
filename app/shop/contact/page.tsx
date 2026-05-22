'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ShopContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
    } catch {}
  }

  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-[900px] mx-auto">
          <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase block mb-6">Contact</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight mb-4">
            Get in touch
          </h1>
          <p className="text-muted-foreground font-light mb-12">
            Questions, collaborations, or feedback. We read everything.
          </p>

          {submitted ? (
            <div className="text-center py-20">
              <p className="text-foreground/40 mb-2">Message sent.</p>
              <p className="text-sm text-muted-foreground">We will respond soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {[
                { name: 'name', placeholder: 'Name', type: 'text' },
                { name: 'email', placeholder: 'Email', type: 'email' },
                { name: 'subject', placeholder: 'Subject', type: 'text' },
              ].map((field) => (
                <input
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required
                  value={formData[field.name as keyof typeof formData]}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
                />
              ))}
              <textarea
                name="message"
                placeholder="Message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              />
              <button
                type="submit"
                className="w-full py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all mt-4"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
