# Boater Portal — Deployable Final

This is the most complete deployable package produced in this session.

## What is included

- Next.js App Router project
- Supabase SSR auth
- email signup/login
- role onboarding for owner / provider / captain
- role-aware dashboards
- Stripe subscriptions
- Stripe Connect onboarding for providers and captains
- marketplace appointment payments
- Stripe Elements checkout page
- payment intent reuse for unpaid appointments
- Supabase SQL schema with starter RLS
- Vercel deployment notes

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill in `.env.local`, run `supabase/schema.sql`, then deploy to Vercel.

## Environment variables

```bash
NEXT_PUBLIC_APP_URL=https://YOUR_APP.vercel.app

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

STRIPE_PREMIUM_OWNER_PRICE_ID=
STRIPE_PROVIDER_PRICE_ID=
```

## Supabase checklist

1. Create a Supabase project
2. Run `supabase/schema.sql`
3. In Auth settings set:
   - Site URL: `https://YOUR_APP.vercel.app`
   - Redirect URL: `https://YOUR_APP.vercel.app/auth/confirm`

## Stripe checklist

1. Create the recurring products / prices
2. Paste price IDs into the env vars
3. Enable Stripe Connect if using provider/captain payouts
4. Add webhook endpoint:

`https://YOUR_APP.vercel.app/api/stripe/webhook`

Recommended webhook events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `account.updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## Vercel checklist

1. Push this folder to GitHub
2. Import it into Vercel
3. Add the environment variables
4. Redeploy
5. Test in Stripe test mode

## Important notes

This is a strong starter, but before a public launch you still need:
- tax handling
- refund and dispute handling
- cancellation logic
- audit logging
- stronger production RLS for every workflow
- abuse/rate limiting
- document upload validation
- real appointment creation and quote acceptance forms
