# Iraqee — Product Roadmap

> A proper social platform for the Iraqi diaspora. Not a directory. Not a classifieds site. A place you open every day.

---

## Phase 0: Fix What's Broken (Today)

| Issue | Fix |
|-------|-----|
| "Following" feed returns empty | Follow API uses profile.userId → need to fix post query to match by user ID |
| Can't upload images in posts | Wire up Daniya image upload to post composer |
| Signup doesn't ask where you're from | Add city/country/diaspora status to onboarding |
| No suggested follows after signup | Follow 3-5 seed users automatically |

---

## Phase 1: The Social Foundation (This Week)

### 1.1 Proper Profiles
- Cover photo — banner image
- About section — longer bio, interests, Iraqi governorate
- Activity tab — recent posts/likes/comments visible on your profile
- Stats — followers, following, posts count
- Verification badge (gold checkmark if verified)
- Photo gallery — uploaded images in a grid

### 1.2 Rich Feed (The Core)
- Image upload in posts — camera → Daniya → feed
- Post types — text, image, poll
- Share button — share post to feed or DM
- Bookmark/save — save for later
- Repost — reshare with optional comment
- Trend indicators — see hot posts

### 1.3 Onboarding Flow
1. Email + password
2. "Where in Iraq are you from?" (governorate dropdown)
3. "Where are you now?" (city + country)
4. "What brings you here?" (Connect / Find services / Events / Business)
5. → Auto-follow suggested people. Auto-suggest groups.

---

## Phase 2: Daily Habits

### 2.1 Stories / Status
- 24h ephemeral photo posts at top of feed
- Green dot when online
- "Seen by" viewers
- This alone drives daily opens

### 2.2 Groups / Communities
- By city: "Iraqis in London", "Iraqis in Chicago"
- By interest: "Iraqi Food", "Iraqi Tech", "Iraqi Music"
- Group feed, member directory, events calendar
- **The moat** — nobody organises diaspora by city + interest

### 2.3 Notifications That Matter
- "X posted in Iraqis in London"
- "X followed you"
- "Event in your city this weekend"
- Daily digest: "Here's what you missed"

---

## Phase 3: Virality & Discovery

### 3.1 Trending / Explore
- Trending hashtags — #IraqiFood #BaghdadMemories
- Explore page — discover popular posts, people, events
- Recommended people — "Near you", "From your governorate"
- Spotlight — curated featured members

### 3.2 Algorithmic Feed
- "For You" — recency × engagement × network affinity
- "Following" — chronological

### 3.3 Referral System
- Invite friends → both get profile boost
- Network effects: diaspora spreads by word of mouth

---

## Phase 4: Design System

| Element | Direction |
|---------|-----------|
| Colors | Warmer gold, deeper navy, Iraqi flag accents |
| Typography | Playfair Display headers, Inter body |
| Animation | Spring transitions, card lift, heart pop |
| Dark mode | Inverted navy palette |
| Illustrations | Mesopotamian vector patterns |
| Mobile | Bottom nav, full-width cards, pull-to-refresh |

---

## Phase 5: Engagement Loops

| Loop | How it works |
|------|-------------|
| Content → Notification → Return | Someone engages → you're notified → you come back |
| Follow → Feed → Like → Follow | See content → engage → follow more |
| Story → View → DM | Stories → engagement → messaging |
| Event → RSVP → Post | Discover → attend → share → others discover |
| Group → Join → Invite | Join → see familiar names → invite friends |

---

## Technical Debt

| Issue | Fix |
|-------|-----|
| Polling everywhere | WebSockets |
| No CDN for images | Daniya needs caching layer |
| No API types | All fetches return `any` |
| No error boundaries | One crash kills the feed |
| Loading spinners | Skeleton screens |
| Prisma N+1 queries | Optimise joins |

---

## ✅ What I'll Fix Right Now (Phase 0)

1. Following feed bug
2. Image upload for posts (via Daniya)
3. Better empty states when signed in