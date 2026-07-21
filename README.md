This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Testing without a real Firebase project

Copy `.env.local.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_ENABLE_TEST_LOGIN=true
```

That's it — no Firebase project, credentials, or emulator needed. The sign-in page
now shows a temporary **Continue with test account** button that starts a session
stored entirely in your browser's `localStorage`. All test-account data (lists,
sections, items) is read from and written to `localStorage` too, so the whole app
can be exercised fully offline with zero dependency on Firebase. This is meant for
local testing/QA only and should stay disabled (the default) elsewhere. Test data is
local to your browser and may be wiped at any time (e.g. by clearing site data).

Signing in with **Continue with Google** still uses real Firebase Auth + Firestore,
as configured via the `NEXT_PUBLIC_FIREBASE_*` variables below.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
