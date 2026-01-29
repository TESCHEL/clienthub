# ClientHub

Professional client management platform for freelancers and consultants.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (we recommend Neon)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TESCHEL/clienthub.git
cd clienthub
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`

5. Push the database schema:
```bash
npm run db:push
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Authentication:** Clerk
- **Payments:** Stripe
- **File Storage:** UploadThing

## Features

- Client management
- Project tracking with progress updates
- File sharing and storage
- Client approval workflows
- Task checklists
- Client portal for external access
- Organization branding
- Subscription billing

## Environment Variables

See `.env.example` for all required environment variables.

## License

Private - All rights reserved.
