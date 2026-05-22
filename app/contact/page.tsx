'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
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
      <section className="px-6 md:px-10 py-20 md:py-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[11px] font-mono text-muted-foreground tracking-[0.3em] uppercase block mb-6">
                Contact
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground tracking-tight mb-8">
                Get in touch
              </h1>
              <p className="text-muted-foreground font-light leading-relaxed mb-12 max-w-md">
                Questions, collaborations, or just want to connect? Drop us a message.
              </p>

              <div className="space-y-6">
                {[
                  { label: 'Email', value: 'hello@404notfound.in' },
                  { label: 'Instagram', value: '@404notfoundin' },
                  { label: 'Twitter / X', value: '@404notfoundin' },
                ].map((item) => (
                  <div key={item.label} className="border-b border-border pb-4">
                    <span className="text-[10px] font-mono text-muted-foreground tracking-[0.2em] uppercase">{item.label}</span>
                    <p className="text-sm text-foreground/40 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {submitted ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl font-serif font-bold text-foreground/[0.03] mb-6">TX</div>
                    <p className="text-foreground/40 mb-2">Message sent.</p>
                    <p className="text-sm text-muted-foreground">We will get back to you soon.</p>
                  </div>
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
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-4 bg-foreground text-background text-sm font-medium tracking-wide hover:bg-foreground/90 transition-all"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
