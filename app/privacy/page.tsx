import Link from 'next/link'

export const metadata = { title: 'Privacy Policy', description: 'Privacy Policy for 404NotFoundIN' }

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-foreground/60 text-sm leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">1. Information We Collect</h2>
          <p>We collect information you provide directly: name, email, phone, shipping address, and payment information when you make a purchase.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to process orders, communicate about your purchases, send promotional emails (with your consent), and improve our services.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">3. Information Sharing</h2>
          <p>We do not sell your personal information. We share data only with service providers necessary to fulfill your orders (shipping partners, payment processors).</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal data. All payment information is processed through secure, encrypted channels via Razorpay.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">5. Cookies</h2>
          <p>We use essential cookies for site functionality and analytics cookies to improve user experience. You can disable non-essential cookies in your browser settings.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">6. Your Rights</h2>
          <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">7. Contact</h2>
          <p>For privacy-related questions, email us at hello@404notfound.in</p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-muted-foreground hover:text-foreground/60">Back to Home</Link>
      </div>
    </div>
  )
}
