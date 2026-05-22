import Link from 'next/link'

export const metadata = { title: 'Return, Replacement & Refund Policy', description: 'Return, Replacement & Refund Policy for 404NotFoundIN' }

export default function RefundPolicyPage() {
  return (
    <div className="bg-background min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Return, Replacement & Refund Policy</h1>
        <p className="text-xs text-muted-foreground font-mono tracking-wide mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-foreground/60 text-sm leading-relaxed">

          <div>
            <p>At <strong className="text-foreground/80">404NotFound</strong>, every product is made-to-order specially for you after your order is confirmed. We do not keep pre-printed stock. Because of this customized production process, we follow a strict return and replacement policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Order Confirmation</h2>
            <p>Once an order is successfully placed and payment is confirmed, production begins immediately. Orders cannot be cancelled or modified once processing has started.</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Returns & Exchanges</h2>
            <p className="mb-3">We do <strong className="text-foreground/80">not</strong> accept returns or exchanges for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Wrong size selected by customer</li>
              <li>Change of mind after placing order</li>
              <li>Customer entered incorrect shipping details</li>
              <li>Preference-related issues (color/design choice)</li>
              <li>Minor print placement variations</li>
              <li>Slight color difference between screen and actual fabric</li>
              <li>Fabric texture variation</li>
              <li>Standard garment size tolerance (±1 inch)</li>
            </ul>
            <p className="mt-3">Customers are requested to check the size chart and order details carefully before placing an order.</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Replacement Eligibility</h2>
            <p className="mb-2">We provide <strong className="text-foreground/80">free replacement</strong> only if:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Product arrives damaged</li>
              <li>Wrong product delivered</li>
              <li>Wrong size delivered (different from ordered size)</li>
              <li>Major print defect or manufacturing defect</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Claim Process</h2>
            <p className="mb-2">To request a replacement, contact us within <strong className="text-foreground/80">48 hours</strong> of delivery with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Order ID</li>
              <li>Clear photos of the product</li>
              <li>Clear unboxing video from opening the sealed package</li>
            </ul>
            <p className="mt-3 text-foreground/40 text-xs">Claims without an unboxing video may not be accepted.</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Verification Process</h2>
            <p>Our team will review your request within 2–4 business days.</p>
            <p className="mt-2">If approved, we will:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Reprint and ship a replacement at <strong className="text-foreground/80">no extra cost</strong></li>
              <li>OR issue <strong className="text-foreground/80">store credit</strong> (if replacement is not possible)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Refund Policy</h2>
            <p className="mb-2">Since all products are custom-made, refunds are generally <strong className="text-foreground/80">not available</strong>.</p>
            <p className="mb-2">Refunds will only be processed if:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Replacement cannot be fulfilled</li>
              <li>Order is cancelled by us before production starts</li>
            </ul>
            <p className="mt-3">Approved refunds are processed to the original payment method within 5–10 business days.</p>
          </div>

          <div>
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Shipping Delays</h2>
            <p>Delivery delays caused by courier partners, weather, strikes, or external logistics issues are not eligible for refund or replacement.</p>
          </div>

          <div className="border-t border-border pt-6">
            <h2 className="text-xl font-serif text-foreground/80 mb-3">Contact Us</h2>
            <p>For support regarding returns, replacements, or refunds, contact:</p>
            <p className="mt-2">
              <span className="text-foreground/80">Email:</span> support@404notfound.in<br />
              <span className="text-foreground/80">Response Time:</span> Within 24–48 business hours
            </p>
          </div>

        </div>

        <Link href="/" className="inline-block mt-10 text-sm text-muted-foreground hover:text-foreground/60">← Back to Home</Link>
      </div>
    </div>
  )
}
