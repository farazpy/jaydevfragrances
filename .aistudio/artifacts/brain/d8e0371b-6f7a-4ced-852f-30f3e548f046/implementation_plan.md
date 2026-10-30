# Comprehensive WordPress & WooCommerce Core Admin Suite & Agarbatti Engine

Integrate WordPress/WooCommerce core administrative capabilities into the Jaydev Fragrances Admin portal backed by real MySQL storage, with zero mockups or sandbox code. Includes a full Coupons & Discounts engine, Customer Management & Review Moderation, and Agarbatti-specific catalog attributes (scents, burn time, packaging types, and pooja deities) synced in real time between `/admin` and the storefront.

## User Review & Critical Decisions

> [!IMPORTANT]
> The features outlined below directly fulfill the user's responses in Phase 1:
> - **Confirmed WordPress Modules**: Coupons & Discounts manager and Customer Accounts & Reviews moderation suite.
> - **Confirmed Agarbatti Attributes**: Sacred scents (Chandan, Guggul, Loban, Rose, Sambrani, etc.), stick burn time (e.g., 45 mins, 60 mins), packaging styles (Zipper Pouch, Rigid Box, Dhoop Log, Hexa Pack), and Puja Deities (Lord Shiva, Ganesha, Lakshmi, Krishna, Durga, Hanuman, etc.).
> - **Zero-Sandbox Guarantee**: Every update made in the `/admin` portal writes to the MySQL database tables (`coupons`, `users`, `reviews`, `products`, `settings`) and immediately reflects in storefront browsing, cart discounts, customer reviews, and filters.

---

## 1. Overview & Core Concept

- **What It Delivers**: Transforms the custom Jaydev Fragrances admin panel into a WordPress/WooCommerce-style management system. Store managers can issue promotional coupons with cart limits and expiry dates, inspect user profiles, approve or moderate customer reviews, and configure Agarbatti-tailored product fields that appear on product pages and faceted shop filters.
- **Target Audience**: Store owners, inventory administrators, and customer support staff managing an authentic Indian Agarbatti, Dhoop, and Camphor brand.
- **Key Value**: Eliminates hardcoded data and brings full administrative control to product specs, discounting, customer verification, and social proof.

---

## 2. User Experience & Visual Design

- **Admin Navigation**: Clear WordPress-style left sidebar with dedicated sections:
  1. *Dashboard*: Live revenue, orders count, low-stock alerts, customer count.
  2. *Products*: Agarbatti catalog with scent profiles, burn time, packaging, and deity attributes.
  3. *Coupons & Discounts (WooCommerce Core)*: Create, edit, toggle, and track percentage/flat coupons with minimum cart spend and usage limits.
  4. *Customer Accounts*: User roster with order history, registered contact details, and role management.
  5. *Review Moderation*: Approve, reject, or delete customer testimonials and star ratings before they appear on PDPs.
  6. *Categories & Subcategories*: Multi-level incense groupings (Agarbatti, Dry Dhoop, Wet Dhoop, Bhimseni Kapoor, Hawan Samagri).
  7. *Orders*: Order lifecycle status tracking and AWB tracking numbers.
  8. *Hero Banners & Store Settings*: Live banner slides, logo branding, and contact details.
- **Storefront Integration**:
  - *Cart & Checkout*: Real coupon validation modal and automatic discount deduction against MySQL `coupons` table.
  - *Product Detail Page (PDP)*: Renders Agarbatti attributes: Stick Burn Time (minutes), Scent Profile, Packaging Format, and Recommended Pooja Deities.
  - *Reviews Component*: Displays only verified/approved customer ratings and allows real logged-in users to submit reviews for admin moderation.
- **Visual Design Discipline**:
  - Rich devotional aesthetic: Charcoal canvas (`#121214`), warm saffron/gold accents (`#D97706` / `#F59E0B`), warm paper surfaces.
  - Strict compliance with `frontend-design`: unboxed metadata (`·` dividers), tabular numerals for financial and inventory data, single-line actions, zero artificial pill badges.
- **Header Version**: Increment version in the site header to **`v1.4.0`** upon release.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native MySQL Persistence Over Third-Party Plugins**
  - *Approach*: Utilize existing MySQL tables (`coupons`, `reviews`, `users`, `products`, `orders`) with lightweight, non-destructive column additions for Agarbatti specifications (`burn_time`, `scent_type`, `packaging_type`, `pooja_deity`).
  - *Why*: Direct SQL execution in Node/Express ensures zero lag, full data ownership, and strict schema compliance.
- **Decision 2: Review Moderation Workflow**
  - *Approach*: Customer reviews submitted on the storefront default to `is_verified = 0` (pending moderation) and are dynamically listed in the Admin "Reviews" tab for 1-click Approval or Removal.
  - *Why*: Mirrors standard WooCommerce/WordPress comment and review moderation rules, preventing spam and maintaining high brand credibility.
- **Decision 3: Coupon Verification in Cart & Checkout API**
  - *Approach*: `/api/coupons/apply` checks minimum cart amount, expiry date, and usage count against MySQL before applying deductions.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       ADMIN DASHBOARD                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Products   │  │   Coupons    │  │ Customer Accounts │  │
│  │ & Agarbatti  │  │ & Discounts  │  │    & Reviews      │  │
│  │  Attributes  │  │  Management  │  │    Moderation     │  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
└─────────┼─────────────────┼────────────────────┼────────────┘
          │                 │                    │
          ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXPRESS REST API ENDPOINTS                  │
│   • /api/admin/coupons (GET, POST, PUT, DELETE)             │
│   • /api/admin/users (GET, PUT role/status)                 │
│   • /api/admin/reviews (GET, PUT approve, DELETE)           │
│   • /api/admin/products (PUT with burn_time, deity, scents) │
│   • /api/coupons/apply (Cart evaluation & discount check)   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MYSQL DATABASE POOL                     │
│   • products (burn_time, scent_type, packaging, deity)      │
│   • coupons (code, type, discount_value, min_amount, limit) │
│   • reviews (is_verified, rating, comment, product_id)      │
│   • users (name, email, role, phone, created_at)            │
└─────────────────────────────────────────────────────────────┘
```

### Database Enhancements (Safe & Non-Destructive):
1. **Products Table**: Add optional columns `burn_time VARCHAR(50)`, `scent_type VARCHAR(100)`, `packaging_type VARCHAR(100)`, `pooja_deity VARCHAR(100)` using `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` or try-catch safety wrapper without modifying existing columns.
2. **Coupons Table**: Wire up full CRUD endpoints in `server.ts` (`GET /api/admin/coupons`, `POST /api/admin/coupons`, `PUT /api/admin/coupons/:id`, `DELETE /api/admin/coupons/:id`).
3. **Reviews Table**: Wire up moderation endpoints (`GET /api/admin/reviews`, `PUT /api/admin/reviews/:id/status`, `DELETE /api/admin/reviews/:id`).
4. **Users Table**: Wire up customer roster (`GET /api/admin/users`, `PUT /api/admin/users/:id/role`).
