# 🏋️ Forge Fitness Telegram Bot

A comprehensive Telegram inquiry automation system for Forge Fitness gym, built with NestJS, Drizzle ORM, and Zod validation.

## ✨ Features

### 🤖 Telegram Bot Capabilities

- **Interactive Menu System** - Easy navigation with inline keyboards
- **Membership Information** - Pricing, packages, and details
- **Class Schedules** - Today, tomorrow, and full week timetables
- **Personal Training** - PT packages and pricing information
- **Promotions** - Current deals and special offers
- **Lead Capture** - Multi-step inquiry form with validation

### 📧 Multi-Channel Notifications

- **Email Notifications** - Automated emails to gym staff
- **CRM Integration** - Webhook support for external systems
- **Telegram Staff Channel** - Real-time notifications to staff
- **Retry Logic** - Exponential backoff for failed deliveries (2s, 4s, 8s)

### 🛠️ Technical Features

- **NestJS Framework** - Scalable and maintainable architecture
- **Drizzle ORM** - Type-safe database operations
- **Zod Validation** - Runtime type checking and validation
- **PostgreSQL** - Robust data storage with Neon hosting
- **Content Caching** - 5-minute cache for optimal performance
- **Health Monitoring** - API endpoints for system status

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd telegram
npm install
```

### 2. Environment Setup

Create a `.env` file with required variables (see `ENVIRONMENT_SETUP.md`)

### 3. Database Setup

```bash
npm run db:setup  # Creates tables and seeds data
```

### 4. Start Development

```bash
npm run start:dev
```

## 📱 Bot Commands

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `/start`      | Show main menu                       |
| `/pricing`    | View membership pricing              |
| `/timetable`  | View class schedules                 |
| `/today`      | Today's classes                      |
| `/tomorrow`   | Tomorrow's classes                   |
| `/pt`         | Personal training packages           |
| `/promotions` | Current promotions                   |
| `/contact`    | Contact information and inquiry form |
| `/help`       | Show available commands              |
| `/status`     | Bot status check                     |

## 🔗 API Endpoints

### Core Endpoints

- `POST /api/inquiries` - Create new inquiry
- `GET /api/health` - System health check
- `GET /api/stats` - Delivery statistics
- `POST /api/test-delivery` - Test delivery channels

### Example Inquiry Creation

```bash
curl -X POST https://forge-fitness.onrender.com/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phone": "09123456789",
    "email": "john@example.com",
    "preferredClass": "Weight training"
  }'
```

## 🗄️ Database Schema

### Core Tables

- **inquiries** - User inquiry data with contact information
- **deliveries** - Delivery tracking with retry mechanism
- **pricing** - Membership pricing and packages
- **timetable** - Class schedules by day and time
- **pt_packages** - Personal training packages
- **promotions** - Current promotions with expiry dates

### Sample Data Included

- 4 membership tiers (Basic to Elite)
- 24 weekly classes across all days
- 5 personal training packages
- 4 current promotions

## 🔧 Configuration

### Content Management

Update gym information by modifying `src/database/seed.ts` and running:

```bash
npm run db:seed
```

### Retry Settings

Configure retry intervals in `src/retry/retry.service.ts`:

```typescript
private readonly retryDelays = [2000, 4000, 8000]; // milliseconds
```

### Cache Duration

Modify content cache duration in `src/content/content.service.ts`:

```typescript
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

## 🚀 Deployment

### Render.com (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy with build command: `npm install && npm run build`
4. Start command: `npm run start:prod`

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Local Development

```bash
npm run start:dev    # Development with hot reload
npm run start:debug  # Debug mode
npm run start:prod   # Production mode
```

## 📊 Monitoring

### Health Checks

- Bot status: Send `/status` to your bot
- API health: `GET /api/health`
- Service tests: `POST /api/test-delivery`

### Logs

Monitor application logs for:

- Inquiry submissions
- Delivery attempts and failures
- Retry operations
- Cache refreshes

## 🔐 Security

- Environment variables for sensitive data
- Input validation with Zod schemas
- SSL/TLS connections
- Database connection security
- Rate limiting ready (can be implemented)

## 🛠️ Development

### Available Scripts

```bash
npm run build        # Build for production
npm run start:dev    # Development server
npm run lint         # ESLint checking
npm run test         # Run tests
npm run db:generate  # Generate migrations
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:setup     # Complete database setup
```

### Project Structure

```
src/
├── api/           # REST API controllers
├── content/       # Content management service
├── database/      # Database schema and configuration
├── delivery/      # Multi-channel delivery service
├── inquiry/       # Inquiry handling service
├── retry/         # Retry mechanism with exponential backoff
├── schemas/       # Zod validation schemas
└── telegram/      # Telegram bot handlers
```

## 📈 Performance

- **Content Caching** - Reduces database queries
- **Connection Pooling** - Efficient database connections
- **Retry Logic** - Prevents system overload
- **Async Processing** - Non-blocking operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For deployment help, see `DEPLOYMENT_GUIDE.md`
For environment setup, see `ENVIRONMENT_SETUP.md`

---

**Built with ❤️ for Forge Fitness**
