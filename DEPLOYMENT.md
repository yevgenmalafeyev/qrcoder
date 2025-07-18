# QRCoder Production Deployment Guide

## Database Setup

The application requires a PostgreSQL database. For production deployment:

### 1. Database Schema
Run the Prisma migration to create the required tables:

```bash
npx prisma migrate deploy
```

### 2. Seed Data
Populate the database with initial data:

```bash
npx prisma db seed
```

### 3. Environment Variables

Set the following environment variables in your production environment:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-secret-key"
```

## Test Accounts

After seeding, the following accounts are available:

- **Admin**: `admin@qrcoder.com` / `admin123`
- **Author**: `yevgen.malafeyev@gmail.com` / `author123`

## Fallback Authentication

If the database is not available, the app provides demo credentials:

- **Admin**: `admin@example.com` / `admin123`
- **Author**: `author@example.com` / `author123`

## Health Check

Monitor the application status at `/api/health`

## Deployment Steps

1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npx prisma migrate deploy`
4. Run `npx prisma db seed`
5. Deploy application

## Troubleshooting

- Check `/api/health` endpoint for database connectivity
- Verify environment variables are set correctly
- Check application logs for Prisma connection errors
- Use fallback credentials if database is unavailable