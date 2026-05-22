# 404NotFoundIN — Digital Culture Platform

Premium futuristic multi-genre culture-commerce platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4 + custom premium utilities
- **Animations:** Framer Motion
- **3D:** Three.js + React Three Fiber + Drei
- **UI Components:** shadcn/ui (Radix primitives)
- **State:** Zustand (cart), React hooks
- **Auth/Database:** Supabase
- **Payments:** Razorpay
- **Analytics:** Vercel Analytics

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase and Razorpay credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Optional
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## Project Structure

```
app/
├── layout.tsx              # Root layout (fonts, metadata)
├── page.tsx                # Homepage (cinematic hero + globe)
├── globals.css             # Global styles (dark monochrome theme)
├── not-found.tsx           # 404 experience page
├── about/                  # About/Manifesto page
├── contact/                # Contact page
├── auth/                   # Auth pages (login, signup, callback)
├── admin/                  # Admin panel (dashboard, orders, products)
├── shop/
│   ├── page.tsx            # Shop landing (featured drops)
│   ├── products/           # Product catalog + detail pages
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── wishlist/           # Wishlist
│   └── account/            # User account (profile, orders)
└── api/                    # API routes (products, orders, payments, etc.)

components/
├── ClientLayout.tsx        # Client wrapper (navbar, footer, transitions)
├── Navbar.tsx              # Unified navigation (route-aware, auto-hide)
├── Footer.tsx              # Premium footer
├── InteractiveOrb.tsx      # Wireframe globe (Three.js)
├── theme-provider.tsx      # Theme context
└── ui/                     # shadcn/ui components (57 components)

lib/
├── utils.ts                # Utility functions
├── supabase/               # Supabase clients (browser, server, middleware)
├── auth/                   # Auth helpers (client, server, useAuth hook)
└── store/
    └── cartStore.ts        # Zustand cart state

hooks/
├── useMousePosition.ts     # Mouse tracking
├── useScrollAnimation.ts   # Scroll-based animations
├── use-mobile.ts           # Mobile detection
└── use-toast.ts            # Toast notifications

scripts/
├── schema.sql              # Complete database schema
└── seed.sql                # Sample data (categories + products)
```

## Database Schema

Run `scripts/schema.sql` in Supabase SQL editor, then `scripts/seed.sql` for sample data.

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `categories` | Product categories (music, memes, gaming, etc.) |
| `products` | Product catalog with full metadata |
| `addresses` | User shipping addresses |
| `wishlist` | User wishlist items |
| `orders` | Order tracking with status management |
| `order_items` | Individual items within orders |
| `contact_messages` | Contact form submissions |
| `newsletter` | Email subscribers |
| `banners` | Homepage banners / featured collections |

All tables have Row Level Security (RLS) enabled.

## Design System

### Theme
- **Pure black background** (`#000000`)
- **White typography** with gradient text effects
- **Monochrome palette** with subtle white opacity layers
- **Premium glass effects** (`glass`, `glass-strong`, `glass-card`)

### Typography
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)
- **Code/Labels:** Geist Mono

### Animations
- Page transitions with Framer Motion
- Scroll-triggered reveals
- Hover lift effects
- Mouse-reactive 3D globe
- Smooth navbar auto-hide on scroll

## Categories Supported

Music, Meme Culture, Gaming, Anime, Coding, Devotional, Cyberpunk, Creator Merch, AI & Tech, Minimal, Internet Humor, Vintage Web

## Deployment

The project is configured for Vercel deployment:

```bash
npm run build
```

Ensure all environment variables are set in your Vercel project settings.

## Admin Access

Admin pages are at `/admin`. Access is controlled by email matching `*@404notfound.in` in the database RLS policies.

## License

Private. All rights reserved.
