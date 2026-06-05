# Irakee — Iraqi Diaspora Platform

A non-profit platform connecting the Iraqi diaspora worldwide. Directory, marketplace, events, and mediation — built with Next.js 16, Supabase, and internationalization (EN/AR + RTL support).

## 🚀 Quick Start

```bash
# Clone and install
git clone <your-repo-url> irakee
cd irakee
npm install

# Set up environment
cp .env.example .env.local

# Run the Supabase migration
npx supabase migration up

# Start development
npm run dev
```

## 🏗️ Architecture

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router, Server Components) |
| **Backend** | Next.js API Routes + Supabase |
| **Database** | Supabase PostgreSQL (RLS-enabled) |
| **Auth** | Supabase Auth (Google OAuth + Email) |
| **i18n** | next-intl (EN/AR, RTL support) |
| **Deploy** | Vercel (recommended) |

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

- **Phase 1** (4 weeks): Instagram presence + simple web directory
- **Phase 2** (+6 weeks): Full platform (profiles, advanced search, events)
- **Phase 3** (+12 weeks): Mediation, escrow, verification system

## 🧩 Key Features

- **Directory**: Searchable diaspora member directory with filters
- **Profiles**: Member profiles with reviews and ratings
- **Auth**: Google OAuth + email/password sign-in
- **i18n**: Full English/Arabic with RTL layout
- **SEO**: generateMetadata on all pages
- **Accessibility**: Proper aria-labels, semantic HTML

## 🤝 Contributing

This is a non-profit community project. Contributions welcome — especially from Iraqi diaspora members, developers, and community organizers.

## 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aboodalbakaa/irakee)

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key

## 📄 License

Non-profit / Community Interest Company (CIC) — see [about page](https://irakee.app/about) for details.