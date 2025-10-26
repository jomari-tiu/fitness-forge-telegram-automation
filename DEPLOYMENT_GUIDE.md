# 🏋️ Forge Fitness Telegram Bot - Deployment Guide

## 🎯 Overview

This is a complete Telegram inquiry automation system for Forge Fitness gym. The bot handles:

- **Membership pricing information**
- **Class timetables and schedules**
- **Personal training packages**
- **Current promotions**
- **Lead capture and inquiry automation**
- **Multi-channel notifications** (Email, CRM webhook, Telegram staff notifications)
- **Automatic retry mechanism** with exponential backoff

## 🚀 Quick Deployment to Render.com

### 1. Prerequisites

- GitHub account with this repository
- Telegram Bot Token (from @BotFather)
- Neon PostgreSQL database (already configured)

### 2. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`
3. Follow instructions to create your bot
4. Copy the bot token (format: `123456789:ABCdefGhIjKlMnOpQrStUvWxYz`)

### 3. Deploy to Render

1. **Connect Repository**
   - Go to [Render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - **Name**: `forge-fitness-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

3. **Set Environment Variables**

   ```bash
   DATABASE_URL=postgresql://neondb_owner:npg_cbSYx6q3Mtwk@ep-holy-fire-a44g93lx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
   TELEGRAM_WEBHOOK_DOMAIN=https://fitness-forge-telegram-automation.onrender.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=jomaritiu16@gmail.com
   SMTP_PASS=jpaw zaqb jxlu pkdu
   NOTIFICATION_EMAIL=jomaritiu16@gmail.com
   CRM_URL=https://forge-fitness.onrender.com/api/inquiries
   STAFF_CHANNEL_ID=-1003287465736
   NODE_ENV=production
   PORT=3000
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (~5-10 minutes)

### 4. Initialize Database

After deployment, run these commands to set up the database:

```bash
# Generate and push database schema
npm run db:push

# Seed with initial data
npm run db:seed
```

Or use the combined command:

```bash
npm run db:setup
```

## 🤖 Bot Features

### Main Menu Options

- **💰 Membership Pricing** - Shows all available membership plans
- **📅 Class Timetable** - Interactive schedule viewer (today/tomorrow/full week)
- **🏃 Personal Training** - PT packages and pricing
- **🎉 Current Promotions** - Active deals and offers
- **📞 Contact Us** - Inquiry form and contact information

### Inquiry Flow

1. User clicks "Request Callback"
2. Bot collects:
   - Full name
   - Phone number
   - Email address
   - Preferred class/service
3. Automatic delivery to:
   - Email notification to gym staff
   - CRM webhook (if external system)
   - Telegram staff channel notification

### Smart Features

- **Keyword Recognition** - Bot responds to natural language
- **Session Management** - Handles multiple users simultaneously
- **Error Handling** - Graceful fallbacks and user-friendly messages
- **Retry Logic** - Automatic retry for failed deliveries (2s, 4s, 8s intervals)

## 🔧 API Endpoints

### Health Check

```bash
GET /api/health
```

Returns system status and service health.

### Create Inquiry (CRM Integration)

```bash
POST /api/inquiries
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "09123456789",
  "email": "john@example.com",
  "preferredClass": "Weight training"
}
```

### Test Delivery Channels

```bash
POST /api/test-delivery
Content-Type: application/json

{
  "channel": "EMAIL" | "CRM_WEBHOOK" | "STAFF_TELEGRAM"
}
```

### Statistics

```bash
GET /api/stats
```

Returns delivery statistics and system metrics.

## 📊 Database Management

### Available Commands

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (development)
npm run db:push

# Seed database with sample data
npm run db:seed

# Complete setup (push + seed)
npm run db:setup
```

### Database Schema

- **inquiries** - User inquiry data
- **deliveries** - Delivery tracking with retry logic
- **pricing** - Membership pricing information
- **timetable** - Class schedules
- **pt_packages** - Personal training packages
- **promotions** - Current promotions and offers

## 🛠️ Configuration

### Content Management

Update gym data by modifying the database directly or through the seed script:

```typescript
// src/database/seed.ts
const seedData = {
  pricing: [...],
  timetable: [...],
  ptPackages: [...],
  promotions: [...]
};
```

### Retry Configuration

Modify retry intervals in `src/retry/retry.service.ts`:

```typescript
private readonly retryDelays = [2000, 4000, 8000]; // 2s, 4s, 8s
```

### Cache Settings

Content is cached for 5 minutes. Modify in `src/content/content.service.ts`:

```typescript
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

## 🔍 Monitoring & Troubleshooting

### Logs

Monitor application logs in Render dashboard:

- Deployment logs
- Runtime logs
- Error tracking

### Health Checks

- **Bot Status**: Send `/status` to your bot
- **API Health**: `GET /api/health`
- **Service Tests**: `POST /api/test-delivery`

### Common Issues

1. **Bot not responding**
   - Check `TELEGRAM_BOT_TOKEN` environment variable
   - Verify bot is not running elsewhere
   - Check Render service logs

2. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Check Neon database status
   - Run `npm run db:push` to sync schema

3. **Email delivery failures**
   - Verify Gmail SMTP credentials
   - Check `SMTP_PASS` app password
   - Test with `POST /api/test-delivery`

4. **Staff notifications not working**
   - Verify `STAFF_CHANNEL_ID` is correct
   - Ensure bot is added to the staff channel
   - Bot must be admin in the channel

## 📈 Scaling & Optimization

### Performance Tips

1. **Database Indexing** - Already optimized for common queries
2. **Content Caching** - 5-minute cache reduces database load
3. **Retry Logic** - Prevents system overload during failures
4. **Connection Pooling** - Efficient database connections

### Monitoring Metrics

- Response times
- Delivery success rates
- Database query performance
- Memory usage
- Error rates

## 🔐 Security Considerations

- Environment variables for sensitive data
- SSL/TLS for all connections
- Input validation with Zod schemas
- Rate limiting (can be added)
- Database connection security

## 🎉 Success!

Your Forge Fitness Telegram Bot is now live! Users can:

1. Find your bot on Telegram
2. Send `/start` to begin
3. Explore gym information
4. Submit inquiries
5. Receive immediate responses

The system will automatically handle all inquiries and notify your team through multiple channels.

---

**Need help?** Check the logs in Render dashboard or test the API endpoints to diagnose any issues.
