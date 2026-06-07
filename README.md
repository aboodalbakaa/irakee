# Iraqee — Iraqi Diaspora Platform

A non-profit platform connecting the Iraqi diaspora worldwide. Directory, marketplace, events, and mediation — built with Next.js 16, Supabase, and internationalization (EN/AR + RTL support).

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo-url> iraqee
cd iraqee
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET

# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router, Server Components) |
| **Backend** | Next.js API Routes + Prisma ORM |
| **Database** | PostgreSQL (direct, via Prisma) |
| **Auth** | NextAuth v5 (Google OAuth + Email/Credentials) |
| **i18n** | next-intl (EN/AR, RTL support) |
| **Deploy** | VPS (systemd service + Caddy reverse proxy) |

## 📁 Project Structure

```
src/app/[locale]/
├── page.tsx           ← Home (hero, search, featured profiles, stats)
├── directory/page.tsx ← Searchable + filterable directory
├── profile/[id]/page.tsx ← Full profile with reviews
├── about/page.tsx     ← Mission, vision, CIC structure
├── auth/page.tsx      ← Google OAuth + email sign in
├── layout.tsx         ← RTL-aware, i18n provider
├── loading.tsx        ← Spinner skeleton
└── error.tsx          ← Error boundary with retry

src/components/
├── layout/ (Header, Navbar, Footer)
└── ui/ (Button, Card, Badge, Input, SearchBar, ProfileCard, LanguageSwitcher)

supabase/migrations/   ← Full schema with RLS + FTS (EN+AR)
messages/              ← en.json + ar.json (all strings translated)
```

## 🗺️ Roadmap

- **Phase 1** (current): VPS deployment with Caddy + systemd. Working directory, auth, i18n.
- **Phase 2** (+4 weeks): Instagram presence + member onboarding. Profile creation, directory growth.
- **Phase 3** (+8 weeks): Marketplace (listings, transactions, reviews), events system.
- **Phase 4** (+16 weeks): Mediation, escrow, verification system.

## 🧩 Key Features

- **Directory**: Searchable diaspora member directory with filters
- **Profiles**: Member profiles with reviews and ratings
- **Auth**: Google OAuth + email/password sign-in
- **i18n**: Full English/Arabic with RTL layout
- **SEO**: generateMetadata on all pages
- **Accessibility**: Proper aria-labels, semantic HTML

## 🤝 Contributing

This is a non-profit community project. Contributions welcome — especially from Iraqi diaspora members, developers, and community organizers.

## 📦 Deployment

The site is currently deployed on a **VPS** via systemd + Caddy reverse proxy.

### VPS setup
```bash
# Start/stop/restart
sudo systemctl start irakee
sudo systemctl stop irakee
sudo systemctl restart irakee

# Check status
sudo systemctl status irakee

# View logs
journalctl -u irakee -n 100 -f
```

### Vercel (optional)
If you want better global performance + HTTPS domain later:
1. Push to GitHub
2. Link repo to Vercel
3. Add env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — NextAuth secret (generate with `npx auth secret`)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials

## 📄 License

Non-profit / Community Interest Company (CIC) — see [about page](https://iraqee.app/about) for details.