import Link from 'next/link'

export const metadata = { title: 'Terms of Service', description: 'Terms of Service for 404NotFoundIN' }

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-foreground/60 text-sm leading-relaxed">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">1. Agreement to Terms</h2>
          <p>By accessing and using 404NotFoundIN, you agree to be bound by these terms. If you do not agree, please do not use our services.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">2. Products & Pricing</h2>
          <p>All products are subject to availability. Prices are listed in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices without prior notice.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">3. Orders</h2>
          <p>Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel orders due to stock unavailability, pricing errors, or suspected fraud.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">4. Payment</h2>
          <p>Payments are processed securely through Razorpay. We accept major credit/debit cards, UPI, and net banking.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">5. Shipping</h2>
          <p>We aim to ship orders within 3-7 business days. Delivery timelines may vary based on location. Free shipping on orders above ₹1000.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">6. Returns & Refunds</h2>
          <p>We offer a 30-day return policy for unused products in original packaging. Refunds are processed within 7-10 business days after receiving the returned product.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">7. Intellectual Property</h2>
          <p>All content on this website is owned by 404NotFoundIN. Unauthorized use, reproduction, or distribution is prohibited.</p>
          <h2 className="text-xl font-serif text-foreground/80 mt-8">8. Limitation of Liability</h2>
          <p>404NotFoundIN is not liable for indirect, incidental, or consequential damages arising from the use of our products or services.</p>
        </div>
        <Link href="/" className="inline-block mt-8 text-sm text-muted-foreground hover:text-foreground/60">Back to Home</Link>
      </div>
    </div>
  )
}
