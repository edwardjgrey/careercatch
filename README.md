# Career Catch - Job Board for Central Asia

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run setup-db
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables
Update `.env.local` with your actual credentials:
- Generate a secure NEXTAUTH_SECRET
- Add email credentials for notifications
- Add Cloudflare R2 credentials for file uploads

## Database
PostgreSQL database is hosted on Render. Connection string is in `.env.local`.

## Deployment
Deploy to Vercel:
```bash
vercel
```
