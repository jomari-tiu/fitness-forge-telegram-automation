# Environment Configuration for Forge Fitness Bot

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_cbSYx6q3Mtwk@ep-holy-fire-a44g93lx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jomaritiu16@gmail.com
SMTP_PASS=jpaw zaqb jxlu pkdu
NOTIFICATION_EMAIL=jomaritiu16@gmail.com

# CRM Webhook Configuration
CRM_URL=https://forge-fitness.onrender.com/api/inquiries

# Telegram Staff Notifications
STAFF_CHANNEL_ID=-1003287465736

# Application Configuration
NODE_ENV=production
PORT=3000
```

## Render.com Deployment Configuration

When deploying to Render.com, set these environment variables in the Render dashboard:

### Required Variables:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token from @BotFather
- `SMTP_HOST`: smtp.gmail.com
- `SMTP_PORT`: 587
- `SMTP_USER`: jomaritiu16@gmail.com
- `SMTP_PASS`: jpaw zaqb jxlu pkdu
- `NOTIFICATION_EMAIL`: jomaritiu16@gmail.com
- `CRM_URL`: https://forge-fitness.onrender.com/api/inquiries
- `STAFF_CHANNEL_ID`: -1003287465736
- `NODE_ENV`: production
- `PORT`: 3000

### Build & Start Commands:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

## Getting Your Telegram Bot Token

1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow the instructions to create your bot
4. Copy the token and add it to your environment variables

## Database Setup

The application will automatically create the required database tables on first run. Make sure your Neon database is accessible and the connection string is correct.

## Testing the Setup

Once deployed, you can test the endpoints:

- Health Check: `GET https://your-app.onrender.com/api/health`
- Test Inquiry: `POST https://your-app.onrender.com/api/inquiries`

## Local Development

For local development:

1. Create a `.env` file with the variables above
2. Run `npm install`
3. Run `npm run start:dev`
4. The bot will be available at `http://localhost:3000`
