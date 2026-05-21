# Jewellers MB — Website Application

Full-stack web application for **Jewellers MB**, a South Indian jewellery business specializing in Nakshi work, Antique designs, bridal collections, and customized jewellery.

The site is customer-facing (browsing, custom orders, schemes, spiritual gemstone consultation, testimonials, wishlist) and admin-managed (full CMS for products, categories, schemes, gemstones, content). Sales are not transacted online — all customer interest routes to WhatsApp inquiry. The website serves as a digital catalogue, lead generator, and scheme management tool.

---

## Tech Stack

- **Frontend:** React 19, Tailwind CSS, Radix UI, framer-motion, GSAP. Hosted on **Vercel**.
- **Backend:** FastAPI (Python 3.11), Motor (async MongoDB), JWT auth. Hosted on **Render** free tier.
- **Database:** MongoDB Atlas.
- **Auto-deploy:** GitHub → Vercel (frontend) and Render (backend) on push to `main`.

---

## Repository Structure

```
/backend
  server.py        # All FastAPI routes
  models.py        # All Pydantic models
  seed_data.py     # Startup seeders + migration helpers
  utils.py         # Shared helpers
  requirements.txt
/frontend
  src/
    App.js
    api.js
    components/
    contexts/      # UserPhoneContext (soft-login)
    utils/         # compressImage, astrologyMap
    pages/
      admin/
README.md          # this file
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local) or MongoDB Atlas account
- Yarn or npm

### Environment Variables

Create `backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=jewellers_mb
JWT_SECRET=any-long-random-string
```

Create `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Run Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

On first startup, the backend seeds default schemes, gemstones, article types, and filter attributes if collections are empty. Idempotent.

### Run Frontend
```bash
cd frontend
yarn install
yarn start
```

Default admin credentials: `admin` / `admin123` — **change before public launch**.

---

## Public Pages (Customer-Facing)

| Route | Purpose |
|---|---|
| `/` | Homepage: festival banner popup, hero, featured categories, parallax quote, MBJ Difference badges, CTA banner, testimonials carousel |
| `/collections` | Category cards → category landing with subcategory shortcuts + dynamic filter sidebar + Dummy/Model image toggle + search + share-this-view |
| `/products/:id` | Product detail with multi-image, item code, price breakdown, WhatsApp inquiry, Instagram link, wishlist heart |
| `/about` | Admin-controlled heading + body |
| `/contact` | Reads phone, email, WhatsApp, address from admin Settings |
| `/calculator` | Gold price calculator (preset + custom wastage %) |
| `/customisation` | Custom order form with reference image uploads |
| `/schemes` | Active schemes + embedded phone lookup to track enrolled schemes |
| `/schemes/:id` | Scheme detail with description, highlights, terms, enroll modal |
| `/spiritual` | 5-mode Vedic gemstone picker → article type → inquiry |
| `/track-order` | Phone or order ID lookup with status timeline |
| `/share-review` | Customer review submission with photos |
| `/wishlist` | Phone-based saved items |
| `/my-account` | Soft-login dashboard showing user's data across the site |

**Soft login:** A single phone number stored in `localStorage` via `UserPhoneContext`. Auto-fills on every page asking for phone.

---

## Admin Panel

Accessed at `/admin/login`.

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Overview stats |
| `/admin/categories` | Nested tree, image upload, "Featured in Nav" toggle |
| `/admin/filter-attributes` | Define per-category filter attributes and options |
| `/admin/products` | Tree-style category picker, dynamic attribute fields, Dummy + Model image slots, auto item code, Instagram URL |
| `/admin/orders` | Status management |
| `/admin/customers` | Aggregated from orders + custom orders |
| `/admin/custom-orders` | All customer fields shown, status, delete, WhatsApp |
| `/admin/schemes` | Flexible content + enrollments with payment tracking, manual enroll, WhatsApp templates |
| `/admin/spiritual` | Gemstones (with Vedic data), article types, inquiries |
| `/admin/testimonials` | Approve/reject/feature/delete customer reviews |
| `/admin/banners` | Festival popup banner (one active at a time) |
| `/admin/settings` | Business info, social, hero image, gold rates, GST %, homepage CMS sections |

---

## Key Domain Logic

### Schemes — Two Types

- **`flexible`** (e.g. Gold Savings Plan): customer pays any amount any time. Each payment converts to gold weight at the current 22K rate. Accumulates total grams.
- **`fixed_monthly`** (e.g. Gold Harvest Scheme): customer commits a monthly amount per enrollment (must be ≥ scheme's `minimum_monthly_amount`). Pays for N months. Grace window logic: if a month's window passes, admin marks it forfeited, tenure extends by 1 month.

### Spiritual Gemstones — Multi-System Picker

Customer picks via one of five modes: Birth Month, Vedic Rashi, Planet (Graha), Birth Date (auto-calculates), or Browse All. Each gemstone has `birth_months`, `vedic_rashi`, `planets`, `wearing_finger` arrays/string.

### Categories — Nested in Admin, Flat in Public

Admin uses a hierarchical tree (parent_id). Public browsing is flat: top-level category landing shows subcategories as "Shop by Type" shortcut cards, plus dynamic filter sidebar derived from actual product attribute values.

### Image Storage

All images stored as base64 strings inline in MongoDB documents. Client-side compression via `frontend/src/utils/compressImage.js` applied on every upload point with appropriate presets.

---

## Deployment

### Vercel (Frontend)
- Connected to GitHub `main` branch
- Auto-deploys on push
- Env: `REACT_APP_BACKEND_URL`

### Render (Backend)
- Connected to GitHub `main` branch
- Auto-deploys on push
- Build command: `pip install --upgrade pip && pip install -r requirements.txt`
- Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Env: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`
- Free tier sleeps after 15 min idle. Keep-alive ping recommended via cron-job.org pinging `/api/categories` every 10 minutes.

### MongoDB Atlas
- Free tier sufficient for small/medium catalogue
- Connection string in Render env as `MONGO_URL`

---

## Known Limitations

1. No online checkout or payment gateway. All purchase intent routes to WhatsApp.
2. No customer account login. Soft-login via phone only — no password, no email verification.
3. Gold rate updated manually from admin Settings (auto-scraping attempted but goodreturns.in returns 403).
4. Images stored as base64 in MongoDB. Migrate to external storage (Cloudinary, Vercel Blob) when catalogue grows past ~200 products.
5. Default admin credentials `admin/admin123` must be changed before public launch.
6. No email/SMS notifications. All customer messaging is manual via WhatsApp templates in admin panel.

---

## Working Conventions With AI Coding Agents

1. One agent task at a time. Confirm `git status` matches the agent's claimed scope before pushing.
2. Always push from local terminal after the agent finishes:
   ```bash
   git add -A && git commit -m "brief description" && git push
   ```
3. Watch Render logs after every backend deploy for clean startup. Manual redeploy with "Clear build cache & deploy" usually fixes occasional Render free-tier flakes.
4. Hard-refresh (Cmd+Shift+R) live site after every deploy to bypass browser cache.
5. Backward compat is critical. Any model change must handle existing documents missing new fields. Migration helpers in `seed_data.py` run on backend startup.
6. Never use localStorage for sensitive data. Only `user_phone` (non-sensitive convenience) is stored client-side.

---

## License

Private project. Not for redistribution.
